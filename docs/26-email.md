# Email

Šta šaljemo, s koje domene, kako se ne završi u spamu, i kako agencija šalje pod svojim
imenom na plaćenom planu.

## Šta šaljemo

| Šablon | Kome | Kada | Od |
|---|---|---|---|
| `report_ready` | posjetilac | audit gotov | agencija (ime), naša ili agencijska domena |
| `report_failed` | posjetilac | audit pao, s razlogom i "we'll retry" | isto |
| `report_followup` | posjetilac | 3 dana poslije, ako agencija uključi, jednom | isto |
| `lead_new` | agencija (lista adresa) | novi lead | Tidywright |
| `lead_digest` | agencija | dnevno u izabrani sat, ako uključi | Tidywright |
| `welcome`, `verify_email`, `reset_password`, `invite`, `new_device` | korisnik app-a | auth | Tidywright |
| `usage_80`, `usage_100` | owner | kvota | Tidywright |
| `payment_failed_1/2/3`, `plan_changed`, `trial_ending` | owner | naplata | Tidywright |
| `key_paused`, `incident` | owner | zloupotreba, incident | Tidywright |

Svi šabloni u `packages/email/templates/*.tsx` (React Email), tekstualna verzija
generisana automatski, predmet i tijelo na engleskom, mock pregled u Storybooku.

## Domene i pošiljalac

| Domena | Za šta | SPF/DKIM/DMARC |
|---|---|---|
| `mail.tidywright.com` | sve naše transakcijske (auth, naplata, leadovi agenciji) | da, poddomena da glavna domena ne trpi |
| `mail.siteauditserver.com` | posjetiocima na free planu, "From: {Agency} via SiteAuditServer" | da |
| `{agencijina poddomena}` | posjetiocima na plaćenom planu, "From: {Agency} <reports@seo.agencija.com>" | agencija dodaje 3 DNS zapisa |

Zašto poddomene: reputacija pošiljaoca je po domeni. Ako neka agencija na free planu
napravi bounce, `mail.siteauditserver.com` trpi, ne `mail.tidywright.com`.

Zašto agencijska domena na plaćenom: posjetilac vidi samo agenciju (to je proizvod), i
reputacija je njena. Ako agencija ne doda DNS, šaljemo s `mail.siteauditserver.com` s
`Reply-To` na agenciju, bez našeg brenda u tekstu.

## DNS zapisi, tačno

Za `mail.tidywright.com` (Resend daje vrijednosti, ovo je oblik):

```
mail.tidywright.com.           TXT  "v=spf1 include:amazonses.com ~all"
resend._domainkey.mail.tidywright.com.  TXT  "p=MIGfMA0GCS..." (DKIM javni ključ)
_dmarc.mail.tidywright.com.    TXT  "v=DMARC1; p=quarantine; rua=mailto:dmarc@tidywright.com; pct=100"
mail.tidywright.com.           MX   10 feedback-smtp.eu-west-1.amazonses.com  (za bounce)
```

DMARC prvih 30 dana `p=none` da vidimo izvještaje, pa `quarantine`, pa `reject`. Na
glavnoj domeni `tidywright.com` DMARC `p=reject` odmah, jer s nje ne šaljemo ništa
(štiti od lažiranja).

Za agencijsku domenu, `/settings/email-domain` prikazuje tri zapisa (DKIM CNAME ili
TXT, SPF include, MX za bounce) i dugme "Verify". Resend API `domains.create` po
agenciji (Scale plan podržava mnogo domena), status polling svakih 10 min dok ne
prođe. Do tada fallback.

Google i Yahoo pravila za velike pošiljaoce (od 2024): SPF i DKIM oba, DMARC bar
`p=none`, jednoklik odjava (`List-Unsubscribe` i `List-Unsubscribe-Post` zaglavlja),
spam stopa ispod 0,3%. Sve to radimo od prvog dana za svaki email posjetiocu, bez
obzira na plan.

## Dobavljač

| | Resend | Amazon SES | Postmark |
|---|---|---|---|
| Cijena 100k mjesečno | 90 $ (Scale) | 10 $ | 115 $ |
| Više domena po nalogu | da, Scale | da | da, po "server" |
| API i React Email | najbolje | goli API | dobro |
| Reputacija | dobra, dijeljeni IP | traži izlazak iz sandboxa, dijeljeni IP | najbolja, samo transakcijski |
| Webhooks (bounce, complaint, open) | da | kroz SNS, komplikovanije | da |
| EU region | da | da | ne (SAD) |

**Odluka:** Resend do 300.000 mjesečno, iza `Mailer` interfejsa
(`send(template, to, data, from)`), pa SES kad račun pređe 300 $ mjesečno. Postmark
ne, jer zabranjuje išta što liči na marketing, a `report_followup` je na granici.

Supabase Auth emailovi (verify, reset) idu kroz **custom SMTP** na Resend, jer ugrađeni
Supabase email ima limit 2 na sat i nije za produkciju. Podešava se u Supabase Auth
settings s Resend SMTP kredencijalima.

## Zagrijavanje domene

Nova domena bez istorije koja odjednom pošalje 5.000 emailova ide u spam. Plan:

| Sedmica | Dnevno max |
|---|---|
| 1 | 50 |
| 2 | 200 |
| 3 | 500 |
| 4 | 1.500 |
| 5 | 5.000 |
| 6+ | bez limita, uz spam stopu ispod 0,1% |

Ograničenje se sprovodi u `audit.email_visitor` redu po domeni pošiljaoca
(`sending_domains.daily_cap`), višak čeka sljedeći dan (posjetilac dobija izvještaj
u iframeu odmah, email kasni). Za agencijske domene isto pravilo automatski, s porukom
u app-u "Your domain is warming up, day 3 of 35".

Prije lansiranja: `mail.siteauditserver.com` i `mail.tidywright.com` zagrijati s pravim
saobraćajem beta agencija 4 sedmice.

## Bounce, complaint, odjava

- Resend webhook `email.bounced`, `email.complained`, `email.delivered`, `email.opened`,
  `email.clicked` → `POST /api/webhooks/resend` → `email_log` update, `events`,
  `suppressions` za hard bounce i complaint (globalno za hard bounce, po agenciji za
  complaint).
- Prije svakog slanja: provjera `suppressions` (globalno i za agenciju), sintaksa, MX
  domena (keš), blocklist domena.
- `List-Unsubscribe: <https://siteauditserver.com/u/{token}>, <mailto:u+{token}@mail.siteauditserver.com>`
  i `List-Unsubscribe-Post: List-Unsubscribe=One-Click` na svakom emailu posjetiocu.
  Ruta `/u/[token]` prima GET (stranica s dugmetom) i POST (jednoklik), upisuje
  suppression.
- Po agenciji: bounce > 5% ili complaint > 0,3% u 7 dana → ključ pauziran, email
  owneru, staff pregled. Ovo štiti dijeljenu domenu.

## Newsletter i marketinški email

Odluka `0011`, tačka 3. Dvije stvari koje se lako pobrkaju, a ne smiju se pomiješati.

**Izvještaj nije marketing.** Email s izvještajem ide svakome ko je označio pristanak za
uslugu, jer je to ono što je tražio. On se šalje i kad marketinški pristanak nije dat.

**Marketinški email ide samo na adrese sa `consent.marketing.checked = true`.** Provjera
je uz postojeće (`suppressions`, sintaksa, MX, blocklist) i pada zatvoreno: ako zapisa
nema, ne šalje se.

**Čiji je newsletter.** Adresa koja je došla kroz agencijin widget je agencijin lead
(`0010`, tačka 1). Marketinški pristanak koji je ta osoba dala odnosi se na agenciju i
njen tekst stoji uz kvačicu. **Mi na te adrese ne šaljemo vlastiti newsletter.**

**Naš newsletter** ima vlastitu prijavu na tidywright.com, dolazi s F3, i puni se samo
odatle i sa audita na našoj domeni. Odjava je ista mehanika: `List-Unsubscribe`,
jednoklik, `suppressions`.

## Sadržaj emaila posjetiocu, pravila

- Predmet: "Your SEO report for {host} is ready" (bez "FREE", bez velikih slova, bez
  uzvičnika, filteri to kažnjavaju).
- Jedan jasan link na izvještaj, dugme plus goli URL ispod.
- Ocjena i tri naslova nalaza u tekstu (da email ima vrijednost i bez klika).
- Ime agencije i njena adresa u footeru (CAN-SPAM), naš "powered by" samo na free.
- Link za odjavu vidljiv.
- Bez slika osim logotipa agencije (max 1), bez praćenja otvaranja na plaćenom ako
  agencija isključi (GDPR pristojnost).
- Tekst verzija uvijek.

## Testiranje

- Lokalno: Mailpit u Docker Compose, svi emailovi tamo.
- Staging: Resend test domena, adrese `*@resend.dev`.
- Prije lansiranja: mail-tester.com rezultat 10/10 za `report_ready`, provjera u
  Gmail, Outlook, Apple Mail, Yahoo (Litmus ili ručno s četiri naloga).
- CI: snapshot test svakog šablona (HTML i tekst), provjera da svaki ima
  `List-Unsubscribe` i fizičku adresu.
