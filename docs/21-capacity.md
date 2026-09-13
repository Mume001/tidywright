# Kapacitet: koliko sistem može da podnese

Računica po dijelovima, s brojevima koji su mjereni ili iz dokumentacije dobavljača,
ne iz osjećaja. Cilj: 100.000 registrovanih agencija, s puno istovremenih izvještaja,
bez da išta padne.

## Pretpostavke o opterećenju

| Stavka | Vrijednost | Osnova |
|---|---|---|
| Registrovane agencije | 100.000 | cilj |
| Aktivne mjesečno | 15.000 (15%) | tipično za free+paid SaaS |
| Audita po aktivnoj mjesečno | 60 | agencija s 2 do 3 leada dnevno |
| Audita mjesečno | 900.000 | |
| Audita dnevno, prosjek | 30.000 | |
| Audita u špici (sat) | 4.000 | 3× prosjek sata, radni dan popodne u EU i SAD |
| Audita u špici (sekunda) | ~1,1, rafali do 20 | |
| Pregleda izvještaja dnevno | 60.000 | 2 po auditu |
| Pregleda obrasca dnevno | 600.000 | 20 pregleda po slanju |
| Emailova dnevno | 60.000 | posjetilac plus agencija |

## Jedan audit: šta košta

Mjereno na jednoj stranici prosječne veličine (180 KB HTML, 40 zahtjeva za resurse koje
ne dohvaćamo, samo HTML plus robots.txt plus sitemap head).

| Korak | Vrijeme | CPU | Memorija |
|---|---|---|---|
| DNS + SSRF provjera | 20 do 80 ms | zanemarivo | |
| Fetch HTML (bez JS) | 300 do 2.000 ms | zanemarivo, čeka mrežu | 1 MB |
| Parsiranje (cheerio) + 29 provjera | 40 do 100 ms | 40 do 100 ms | 10 MB |
| PSI poziv (opcija, ne u fazi 1) | 8 do 25 s | čeka | |
| Playwright render (samo ako je HTML prazan) | 2 do 6 s | 500 do 1.500 ms | 150 do 300 MB |
| Generisanje 3 popravke, model | 4 do 12 s | čeka | |
| Upis rezultata, Storage, email | 100 do 300 ms | | |
| **Ukupno tipično** | **6 do 15 s** | **~100 ms** | |

Zaključak: audit je 99% čekanja na mrežu i model, 1% CPU. Zato jedan radnik može voditi
mnogo audita istovremeno. Ograničenje je memorija (ako ide Playwright) i limiti dobavljača
modela, ne procesor.

## Radnik

- Node proces s pg-boss `teamSize` (koliko poslova istovremeno). Na 1 vCPU / 2 GB bez
  Playwrighta: 20 do 30 istovremenih audita. Na CX33 (4 vCPU, 8 GB): 80 do 100.
- Playwright u zasebnom kontejneru s vlastitim redom `audit.render`, `teamSize` 3 po
  2 GB memorije (svaki render do 300 MB plus 200 MB osnova). Render se traži samo kad
  statični HTML nema `<title>` ni `<h1>` ni tekst (SPA), procjena 8 do 12% sajtova.
- Propusnost u špici: 4.000 audita na sat je 1,1 u sekundi. S 10 s po auditu to je 11
  istovremenih u prosjeku, rafali do 100. Jedan CX33 to nosi. Stepenica C ima 3 × CX53
  radi redundanse i rasta, ne zbog potrebe.

## Model

| Model | Cijena po auditu | Kvalitet | Napomena |
|---|---|---|---|
| GPT-5.6 Luna | ~0,00112 $ | dovoljan za title, meta, JSON-LD | ~1.200 ulaznih, 400 izlaznih tokena |
| Claude Haiku 4.5 | ~0,005 $ | bolji ton, strukturisan izlaz | 4× skuplji |
| Batch API (oba) | −50% | isti | čeka do 24 h, samo za mjesečne izvještaje i re-generisanje |

Trošak na 30.000 dnevno: 34 $ dnevno s Lunom, 150 $ s Haikuom. Na 900.000 mjesečno:
1.000 $ odnosno 4.500 $. Prihod na 15.000 aktivnih s 10% konverzije u plaćeno: 58.500 $.
Model je ispod 2% prihoda u oba slučaja.

Limiti dobavljača: tier računa određuje zahtjeve po minuti. Špica od 100 istovremenih
zahtjeva traži tier s bar 500 RPM. Plan: dva dobavljača konfigurisana, `FixGenerator`
interfejs bira drugog kad prvi vrati 429 ili preko 20 s. Krug prekidača (circuit
breaker) po dobavljaču: 5 grešaka u minuti isključuje ga na 2 minute.

Pragovi: audit iznad 0,03 $ upozorenje u logu, iznad 0,10 $ prekid i `failed:model`.
Dnevni budžet modela u `feature_flags` (`model_daily_budget_usd`), kad se potroši,
auditi se završe bez popravki i vrate `score_only` s porukom "fixes coming shortly", pa
se popravke generišu iz batch reda.

## PageSpeed Insights (ako uđe kasnije)

Kvota 25.000 poziva dnevno po projektu, 400 u 100 sekundi. Na 30.000 audita dnevno
to nije dovoljno bez dva projekta ili keširanja po hostu (isti host u 24 h, isti
rezultat). Za fazu 1 PSI nije uključen (odluka 0005). Kad uđe: keš po `site_host` na
24 h u `psi_cache` tabeli, poziv samo za plaćene agencije, jedan Google Cloud projekat po
100.000 audita dnevno.

## Baza

| Operacija | Po sekundi u špici | Napomena |
|---|---|---|
| INSERT lead + audit | 1 do 20 | trivijalno |
| UPDATE audit status | 5 do 100 | radnik, kratke transakcije |
| INSERT events | 10 do 300 | append-only, batch po 50 |
| SELECT izvještaj po tokenu | 20 do 50 | unique indeks, 1 ms |
| SELECT lista leadova | 5 do 30 | indeks `(agency_id, created_at)` |
| Status polling `/status` | 50 do 200 | jedan red po PK, keš 2 s u memoriji |

Postgres na 4 vCPU radi 5.000 do 10.000 ovakvih upita u sekundi. Supabase Small
compute (2 vCPU) je dovoljan do stepenice B, Large za B, Hetzner AX42 za C s tri puta
rezerve.

Konekcije: Next.js kroz Supavisor transaction pool (max 200 klijenata, 20 pravih),
radnik 10 konekcija po instanci u session modu. Ukupno pravih konekcija ispod 100 na
stepenici C, `max_connections` 200.

Veličina: vidi `18-data-model.md`, 30 do 40 GB godišnje. Diskovi su 240 GB (CX53) i
2×512 GB (AX42), dovoljno 5 godina bez čišćenja.

## Red poslova (pg-boss)

- Jedna tabela `pgboss.job`, particionisana po redu od verzije 10.
- Propusnost: pg-boss radi hiljade poslova u sekundi na malom Postgresu, mi tražimo
  desetine.
- Prioritet: `audit.run` za plaćene agencije prioritet 10, free 5, `retention.sweep` 1.
  Za paket koji stoji u redu duže od 30 s, stanje u UI kaže "busy, usually under a
  minute".
- Zaštita od jedne agencije koja zaguši sve: `singletonKey` po `agency_id` s
  `singletonSeconds` ne, nego semafor u kodu, max 20 istovremenih audita po agenciji
  (`entitlements.concurrent_audits`, free 3, paid 20). Preko toga, poslovi čekaju.
- Arhiva: završeni poslovi se brišu poslije 24 h, `queue.archive` job.
- Kad pg-boss postane usko grlo (nije prije stepenice C, i tad teško), zamjena je
  BullMQ na Redisu, isti interfejs u našem `queue` modulu.

## Embed obrazac i izvještaj

- `/embed.js` je statičan fajl na Cloudflare CDN-u, 600.000 pregleda dnevno ne dotiče
  naš server. Cache hit iznad 99%.
- `/e/[key]` iframe stranica je Next.js ruta s `revalidate` 60 s po ključu (brendiranje
  se rijetko mijenja), u praksi Cloudflare keš s `stale-while-revalidate`. Origin dobija
  oko 1 zahtjev u minuti po aktivnom ključu.
- `/r/[token]` izvještaj: dinamičan dok je `pending`, poslije `done` keš 5 minuta na
  CDN-u (privatni token je u URL-u, keš je po URL-u, pa je bezbjedno) i `no-store` za
  HTML kad je 410.
- Status polling svakih 2 s do 60 s: 30 zahtjeva po auditu, 900.000 dnevno u špici. To
  je i dalje samo 10 zahtjeva u sekundi na jedan PK upit s in-memory kešom. Ako naraste,
  SSE stream umjesto pollinga.

## Email

60.000 dnevno je 1,8 miliona mjesečno. Resend Scale je 100.000 za 90 $, dodatni po
0,00035 $ po emailu u tom tieru, pa oko 700 $ mjesečno na stepenici C. Alternativa
Amazon SES 0,10 $ po 1.000 je 180 $. Plan: Resend do 300.000 mjesečno, pa SES kroz isti
`Mailer` interfejs. Vidi `26-email.md`.

Slanje ide kroz red `audit.email_visitor`, `teamSize` 10, jer dobavljač ima limit
zahtjeva u sekundi.

## Storage

Audit JSON 12 KB gzip × 900.000 mjesečno je 11 GB mjesečno, uz zadržavanje 90 dana
oko 33 GB živih. PDF 200 KB × 10% audita je 18 GB mjesečno. Supabase Storage 100 GB
uključeno na Pro, 0,021 $/GB preko. Na stepenici C prelazak na Hetzner Object Storage
(1 TB 6,49 €) ili R2.

## Šta puca prvo, po redu

1. **Limit modela (RPM).** Rješenje: dva dobavljača, batch fallback, budžet.
2. **Cloudflare challenge na tuđim sajtovima.** Ne puca sistem nego kvalitet, dio audita
   `failed:blocked`. Praćenje udjela, cilj ispod 8%.
3. **Playwright memorija** ako procenat SPA sajtova bude veći od procjene. Rješenje:
   više `audit.render` radnika, limit 1 render po agenciji istovremeno.
4. **Email reputacija** ako neka agencija spamuje kroz naš obrazac. Rješenje: limiti po
   ključu, blocklist, Turnstile, praćenje bounce i complaint stopa po agenciji, auto
   pauza iznad 2% complaint.
5. **Baza** tek na stepenici C, i tad selidba na dedicated.

## Testiranje opterećenja

Prije lansiranja: `k6` skripta koja šalje 50 audita u sekundi 10 minuta na staging s
mock modelom i mock fetchom (lokalni sajt), mjeri p95 vremena statusa i izvještaja, i
provjerava da nijedan posao nije izgubljen. Isti test s pravim modelom na 2 u sekundi.
Ciljevi: p95 `POST /audits` ispod 300 ms, p95 `/r/token` ispod 500 ms, 0 izgubljenih
poslova, radnik ispod 70% CPU.
