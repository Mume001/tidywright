# Naplata

Stripe, s najmanje vlastitog koda i jednim izvorom istine za "šta agencija smije".
Faza 2, ali shema i entitlements tabela postoje od faze 1 da bi free plan već radio
kroz isti mehanizam.

## Planovi

| Plan | Cijena | Auditi mjesečno | Ključevi | Sjedišta | Powered by | PDF | Webhook | Izvoz | Zadržavanje |
|---|---|---|---|---|---|---|---|---|---|
| Free | 0 | 50 | 1 | 1 | da | ne | ne | ne | 30 dana |
| Starter | 39 $ mjesečno, 390 $ godišnje | 500 | 3 | 3 | ne | da | da | da | 90 dana |
| Agency | 99 $ mjesečno, 990 $ godišnje | 2.500 | 10 | 10 | ne | da | da | da | 365 dana |
| Pro | 249 $ mjesečno, 2.490 $ godišnje | 10.000 | neograničeno | 25 | ne | da | da | da | 365 dana |

Faza 3 dodaje limit sajtova (Starter 3, Agency 15, Pro 50) i broj popravki mjesečno.
Godišnje je 10 mjeseci za 12. Cijene u USD, jer je tržište globalno; EU kupci dobijaju
PDV kroz Stripe Tax.

Prekoračenje: audit preko limita ne pada nego se izvještaj pravi kao `score_only` s
porukom agenciji "You've used your monthly audits, upgrade to keep full reports". Free
plan preko 50 blokira obrazac s porukom "This form is temporarily unavailable" (bez
našeg brenda) i email owneru.

Trial: 14 dana Starter bez kartice pri registraciji, poslije toga pada na Free bez
prekida. Kartica se traži tek pri izboru plana.

## Stripe komponente

| Šta | Koristimo | Ne pravimo |
|---|---|---|
| Kupovina | Stripe Checkout (hosted) | vlastitu formu za karticu |
| Upravljanje | Customer Portal (promjena plana, kartica, otkazivanje, fakture) | vlastite ekrane za to |
| Fakture | Stripe Invoicing, automatski | PDF fakture |
| Porez | Stripe Tax (0,5% po transakciji) | ručne PDV stope |
| Neuspjela naplata | Stripe Smart Retries plus naši emailovi | vlastiti retry |

Stripe Billing je 0,7% preko 2,9% plus 30 ¢, plus 1,5% za internacionalne kartice i 1%
za konverziju valute. Na 39 $ to je oko 2 $ po naplati. Prihvatljivo.

## Tok

```
/billing "Upgrade"  ->  POST /api/billing/checkout {price_id}
  ->  stripe.checkout.sessions.create({
        customer: agency.stripe_customer_id (kreiraj ako nema),
        mode: 'subscription', line_items, success_url, cancel_url,
        automatic_tax: {enabled: true}, client_reference_id: agency_id,
        subscription_data: {metadata: {agency_id}}
      })
  ->  redirect na Stripe
  ->  Stripe webhook  ->  sync(customer_id)  ->  subscriptions + entitlements
  ->  success_url /billing?ok=1 čeka do 10 s da entitlements budu osvježeni (polling)
```

## Webhook obrazac: "sync by customer ID"

Ključno pravilo: webhook ne interpretira događaj. Bilo koji događaj s `customer` poljem
pokreće istu funkciju `syncStripeCustomer(customerId)` koja:
1. povuče iz Stripe API-ja sve pretplate za tog kupca (`subscriptions.list` s
   `expand: ['data.default_payment_method']`),
2. uzme najnoviju aktivnu ili trialing pretplatu (ili nijednu),
3. upiše u `subscriptions` (upsert po `stripe_subscription_id`),
4. preračuna `entitlements` iz `plan` mapiranja u kodu,
5. upiše fakture u `invoices_cache`.

Zašto: Stripe događaji stižu van reda, dupliraju se, i ima ih 30 vrsta. Kad sve vode na
"pročitaj pravo stanje i upiši ga", nema race uslova ni polovičnih stanja. Ovo je obrazac
koji preporučuje više iskusnih Stripe integratora i kojeg se držimo.

Događaji na koje se pretplaćujemo: `checkout.session.completed`,
`customer.subscription.created/updated/deleted/paused/resumed`,
`invoice.paid`, `invoice.payment_failed`, `invoice.payment_action_required`,
`customer.updated`, `payment_method.attached`.

Webhook ruta:
- verifikuje potpis (`stripe.webhooks.constructEvent` s raw tijelom),
- upisuje `event.id` u `stripe_events` tabelu (PK), duplikat vraća 200 odmah,
- stavlja `stripe.sync` posao u pg-boss s `singletonKey = customer_id` i vraća 200 u
  ispod sekunde (Stripe očekuje brz odgovor),
- radnik radi sync s retry.

Dodatno `stripe.reconcile` job svaku noć prolazi sve agencije s `stripe_customer_id` i
radi sync, za slučaj propuštenog webhooka.

## Entitlements

Aplikacija nikad ne pita Stripe "smije li ova agencija PDF". Pita `entitlements`
tabelu. Mapa plan → entitlements je jedna TypeScript datoteka `packages/shared/plans.ts`,
isti izvor za cijene na marketing stranici, za Checkout `price_id` i za limite.

Stanja pretplate i šta znače:

| Stripe status | Entitlements |
|---|---|
| `trialing` | plan iz pretplate |
| `active` | plan |
| `past_due` | plan još 7 dana (Stripe Smart Retries traje do 3 sedmice, mi ranije spuštamo), pa Free |
| `unpaid`, `canceled` | Free odmah, podaci ostaju do zadržavanja Free plana |
| `paused` | Free |
| nema pretplate | Free |

`source = 'manual'` omogućava staff-u da ručno da plan (partneri, kompenzacija), s
`expires_at`.

## Dunning (neuspjela naplata)

| Dan | Šta |
|---|---|
| 0 | Stripe pokuša, ne uspije; webhook `invoice.payment_failed`; email "Payment failed, update your card" s linkom na portal |
| 3 | Stripe retry; ako opet ne, email 2 |
| 7 | naš status pada na Free: powered by se vraća, PDF i webhook stanu; email 3 "Your plan was paused" |
| do 21 | Stripe još pokušava; ako uspije, sync vraća plan |
| 21 | Stripe otkaže pretplatu (podešeno u Stripe Billing settings), `canceled` |

Traka u app-u od dana 0: "Payment failed. Update your card to keep your features."

## Otkazivanje i povrat

- Otkazivanje kroz portal, na kraju perioda (`cancel_at_period_end`), ne odmah. Do kraja
  perioda sve radi.
- Povrat: prvih 14 dana mjesečnog plana na zahtjev, bez pitanja, ručno iz Stripe
  dashboarda. Godišnji plan proporcionalno u prvih 30 dana. Piše u uslovima.
- Promjena plana kroz portal: proration uključen, Stripe računa razliku.

## Porez

- Stripe Tax uključen, naplaćuje PDV/GST po lokaciji kupca kad pređemo prag registracije
  u toj zemlji (Stripe prati pragove i upozorava).
- EU B2B s validnim PDV brojem: reverse charge, Stripe Tax to radi ako Checkout traži
  `tax_id_collection: {enabled: true}`.
- Naša firma: dok nema pravnog lica, nema Stripe naloga. Odluka u `23-compliance.md`.
  Stripe Atlas (Delaware LLC, 500 $, uključuje EIN i bankovni račun) je najbrža ruta ako
  BiH firma ne prolazi Stripe onboarding (Stripe ne podržava BiH kao zemlju naloga, to
  treba provjeriti u trenutku odluke, lista se mijenja).

## Fakture za kupca

Portal pokazuje sve fakture, PDF s Stripe-a, s podacima firme koje kupac unese
(`customer.name`, `address`, `tax_ids`). Na `/billing` prikazujemo istu listu iz
`invoices_cache` s linkovima. Ništa ne generišemo sami.

## Testiranje

- Stripe test mode ključevi u `local` i `staging`, live samo u `prod`.
- Stripe CLI `stripe listen --forward-to localhost:3000/api/webhooks/stripe` lokalno.
- Test kartice: 4242 uspjeh, 4000 0000 0000 0341 neuspjeh pri naplati, 4000 0025 0000
  3155 traži 3DS.
- Test scenariji u CI (s mock Stripe klijentom): checkout → active; past_due → 7 dana →
  Free; canceled; upgrade s prorationom; duplikat webhook; webhook van reda (`updated`
  prije `created`).
- Stripe test clock za dunning vremensku liniju.

## Metrike koje pratimo (staff)

MRR, novi/otkazani mjesečno, churn stopa, trial → paid konverzija, Free → paid
konverzija, prosječan prihod po plaćenoj, neuspjele naplate u toku. Sve iz `subscriptions`
i `invoices_cache`, jedan SQL pogled `billing_metrics`, u admin panelu. Stripe dashboard
ima isto, ali naše brojke moraju da se slažu.
