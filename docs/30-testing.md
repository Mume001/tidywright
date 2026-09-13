# Testiranje

Šta se testira, na kojem nivou, i šta mora proći prije svakog merge-a. Cilj nije
pokrivenost u procentima nego da tri stvari nikad ne puknu tiho: izolacija agencija,
SSRF, i naplata.

## Piramida

| Nivo | Alat | Šta | Traje |
|---|---|---|---|
| Jedinični | Vitest | provjere (29 funkcija), ocjena, validacija, `safeFetch` odluke, plan mapa, formatiranje | < 10 s |
| Integracijski | Vitest + Postgres u Docker/Actions | RLS, migracije, pg-boss tok `audit.run` s mock fetchom i modelom, Stripe sync s mock API-jem, webhook potpisi | 1 do 2 min |
| Komponente | Storybook + Vitest browser mode + axe | svaka komponenta i ekran u svim stanjima, dostupnost | 1 min |
| Vizuelni | Playwright screenshot diff na Storybook pričama | promjena piksela traži odobrenje u PR-u | 2 min |
| E2E | Playwright na stagingu | 6 tokova dolje | 5 min |
| Opterećenje | k6 | vidi `21-capacity.md` | ručno prije lansiranja i prije stepenice |
| Sintetički | Better Stack | pravi audit svakih 15 min u produkciji | stalno |

## Jedinični testovi provjera

Svaka od 29 provjera ima fajl `checks/<code>.test.ts` s bar: prolazi, pada, granični
slučaj, nema elementa uopšte. Ulaz je HTML string, izlaz `{status, evidence, weight}`.
Fixture folder `fixtures/html/` s 40 pravih anonimizovanih stranica (WordPress s
Yoastom, Shopify, Squarespace, Wix, Next.js SPA, stara HTML4 stranica, stranica na
ćirilici, RTL stranica, stranica s 5 MB HTML-a, prazan `<body>`).

Ocjena: test da su težine iz `checks_catalog` iste kao u kodu, da 0 grešaka daje 100,
sve kritične daju ispod 30, i da promjena težine ne mijenja stare `summary` vrijednosti.

## SSRF test lista

`fixtures/ssrf-urls.json`, 30+ unosa, svaki mora biti odbijen s tačnim kodom:
- `http://127.0.0.1`, `http://localhost`, `http://[::1]`, `http://0.0.0.0`
- `http://169.254.169.254/latest/meta-data`, `http://metadata.google.internal`
- `http://10.0.0.1`, `http://192.168.1.1`, `http://172.16.0.1`, `http://100.64.0.1`
- `http://2130706433`, `http://0x7f000001`, `http://0177.0.0.1`, `http://127.1`
- `http://[::ffff:127.0.0.1]`, `http://[0:0:0:0:0:ffff:7f00:1]`
- `ftp://example.com`, `file:///etc/passwd`, `gopher://`, `javascript:`
- `http://user:pass@example.com`, `http://example.com:22`, `http://example.com:6379`
- redirekt lanac: javni URL → 302 → `http://169.254.169.254` (lokalni test server)
- DNS rebinding: test resolver koji prvi put vrati `93.184.216.34`, drugi put
  `127.0.0.1`; pinovanje mora spriječiti drugi
- `http://example.com.` (trailing dot), `http://example.com%00.evil.com`
- 6 redirekata (limit 5), tijelo 6 MB (limit 5), odgovor koji traje 15 s (limit 10)

## RLS test

`tests/rls.test.ts`:
1. Kreiraj agencije A i B, korisnike sa svakom ulogom u obje.
2. Za svaku tabelu iz `information_schema.tables where table_schema='public'`, upiši red
   za A servisnim ključem.
3. Za svaku ulogu u B: SELECT, UPDATE, DELETE na taj red kroz Supabase klijent s B-ovim
   JWT-om. Očekuj 0 redova ili grešku. Nikad podatak.
4. Za svaku ulogu u A: očekuj tačno ono što matrica u `16-access-control.md` kaže
   (matrica je u `tests/access-matrix.ts` kao podaci, test je generisan iz nje).
5. Tabela bez ijedne politike → test pada (štiti od zaboravljene RLS).
6. `audit_log`: UPDATE i DELETE moraju pasti čak i servisnim ključem.

## Integracijski tok audita

Mock `safeFetch` vraća fixture HTML, mock `FixGenerator` vraća fiksni JSON, pravi
Postgres i pg-boss. Test:
- POST obrazac → lead i audit u `queued` → radnik obradi → `done`, `summary` tačan,
  Storage objekat postoji, `events` ima `audit_done`, email posao u redu, webhook posao
  u redu.
- Fetch baca timeout → `failed:fetch_timeout`, retry jednom, email `report_failed`.
- Model baca → audit `done` sa `score_only` i oznakom za regen.
- Kvota puna → `score_only` i `usage_100` email.
- Isti email + host u 24 h → isti lead, novi audit.
- Suppressed email → audit radi, email se ne šalje, `email_log` ima `skipped`.
- Obrisan lead → izvještaj 410, audit anonimizovan.

## Stripe

Mock Stripe klijent (`stripe-mock` ili vlastiti) s scenarijima iz `24-billing.md`.
Plus jedan pravi test u stagingu mjesečno s test karticom kroz Checkout (ručno, u
checklisti).

## Komponente i ekrani

- Svaka komponenta: priča po stanju, `play` funkcija za interakciju (klik, unos), axe
  bez `serious`/`critical` nalaza.
- Svaki ekran iz `15-frontend-spec.md`: priča `Loading`, `Empty`, `Error`, `Default`, i
  gdje ima smisla `Dense` (1.000 redova). Ovo je frontend-prvo: ekran je gotov kad ima
  sve četiri priče i prođe vizuelni diff, prije nego što backend postoji.
- Mock podaci: `packages/shared/mocks/` isti koje koristi `db/seed.ts`, pa Storybook i
  lokalna baza pokazuju isto.

## E2E tokovi (Playwright, staging)

1. Registracija → potvrda emaila (Mailpit ili Resend test inbox) → onboarding 3 koraka
   → embed kod prikazan → test audit iz onboardinga završi.
2. Obrazac u iframeu (test HTML stranica na stagingu koja ugrađuje `/embed.js`) →
   Turnstile test ključ → slanje → izvještaj `pending` → `done` → tri popravke vidljive
   → Copy radi.
3. Lead u dashboardu → promjena statusa → izvoz CSV (faza 2).
4. Brendiranje: promjena boje i logotipa → iframe prikazuje novo u 60 s.
5. Odjava iz emaila → suppression → sljedeći audit s istim emailom ne šalje.
6. Naplata (faza 2): Checkout test kartica → entitlements → "powered by" nestaje.

Radi na svakom merge-u u `main` protiv staginga. Pad blokira tag.

## Šta se ne testira automatski

- Pravi model (skup, nedeterminističan): jednom sedmično ručno 10 audita, pregled
  kvaliteta popravki u tabeli, ocjena 1 do 5, u `ops/fix-quality-log.md`.
- Isporuka emaila u inbox (mail-tester prije lansiranja, pa mjesečno).
- Cloudflare pravila (ručno s k6 s druge IP adrese).

## Pravila

- PR bez testa za novu provjeru, novu rutu ili novu politiku se ne merge-a.
- Bug fix prvo dobija test koji pada, pa fix.
- Flaky test se briše ili popravlja isti dan, ne `retry: 3`.
- CI ukupno ispod 8 minuta, inače se dijeli na paralelne poslove.
