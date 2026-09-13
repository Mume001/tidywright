# Model podataka

Kompletna shema za sve faze. Faza 1 i 2 se prave odmah, faza 3 tabele su nacrtane da se
ništa iz faze 1 ne mora mijenjati kad dođu. Sve je Postgres na Supabase, migracije kroz
Drizzle, ključevi UUIDv7.

## Načela

1. **UUIDv7 svuda.** Vremenski sortiran, pa B-tree indeks ne fragmentira kao kod
   nasumičnog UUIDv4. Generiše se u aplikaciji (`uuidv7` paket) ili u bazi kroz
   `uuid_generate_v7()` funkciju. Nikad sekvencijalni integer na javnim tabelama
   (curi koliko imamo korisnika i omogućava pogađanje).
2. **`agency_id` na svakoj tabeli** koja pripada agenciji, čak i kad se može doći joinom.
   RLS politika poredi kolonu s JWT claimom bez joina. Vidi `16-access-control.md`.
3. **Mali JSONB u tabeli, veliki JSON u storage.** Sažetak audita (ocjena, grupe, popis
   kodova provjera) ide u `audits.summary`, do oko 2 KB. Puni rezultat sa svih 29 provjera,
   HTML izvodima i tri popravke ide u Supabase Storage kao gzip JSON, a tabela čuva samo
   putanju. Razlog: 100.000 audita mjesečno puta 40 KB je 4 GB mjesečno u tabeli koju
   nikad ne pretražujemo po sadržaju, a `VACUUM` i backup bi patili.
4. **Vremenski žig `timestamptz`**, nikad `timestamp`. Sve u UTC, prikaz konvertuje UI.
5. **Meko brisanje samo gdje zakon traži trag** (agencije, korisnici). Leadovi se brišu
   tvrdo, jer GDPR brisanje znači brisanje. Auditi vezani za obrisan lead gube email i
   IP (anonimizacija), a ostaju za statistiku.
6. **Enumi kao `text` s CHECK ograničenjem**, ne Postgres `enum` tip, jer se lakše
   mijenjaju migracijom.
7. **Novac u centima kao `integer`**, trošak modela u mikrodolarima kao `bigint`
   (`cost_usd_micros`), jer je jedan audit oko 1.120 mikrodolara.

## Faza 1: jezgro

### `agencies`

| Kolona | Tip | Napomena |
|---|---|---|
| id | uuid pk | |
| slug | text unique | 3 do 40 znakova, `[a-z0-9-]`, rezervisane riječi zabranjene |
| name | text | |
| plan | text | `free`, `starter`, `agency`, `pro`; CHECK |
| status | text | `active`, `suspended`, `deleted`; CHECK |
| owner_user_id | uuid fk users | tačno jedan |
| stripe_customer_id | text unique null | faza 2 |
| timezone | text | IANA, default `UTC` |
| settings | jsonb | notifikacije, zadržavanje dana, default `{}` |
| created_at, updated_at | timestamptz | |
| deleted_at | timestamptz null | meko brisanje, tvrdo poslije 30 dana |

Indeksi: `slug`, `stripe_customer_id`, `(status, deleted_at)`.

### `users`

Supabase Auth drži `auth.users` (email, lozinka, MFA). Naša tabela `public.users` je
profil, 1:1 po `id`.

| Kolona | Tip | Napomena |
|---|---|---|
| id | uuid pk | isti kao `auth.users.id` |
| email | text | kopija radi prikaza |
| full_name | text null | |
| avatar_path | text null | Storage |
| locale | text | `en` |
| last_seen_at | timestamptz null | |
| created_at, updated_at, deleted_at | | |

### `memberships`

Veza korisnik ↔ agencija s ulogom. Jedan korisnik može biti u više agencija.

| Kolona | Tip | Napomena |
|---|---|---|
| id | uuid pk | |
| agency_id | uuid fk | |
| user_id | uuid fk | |
| role | text | `owner`, `admin`, `member`, `client`; CHECK |
| invited_by | uuid null | |
| accepted_at | timestamptz null | null dok je pozivnica otvorena |
| created_at | | |

Unique `(agency_id, user_id)`. Partial unique `(agency_id) where role = 'owner'`.
Trigger poslije INSERT/UPDATE/DELETE osvježava `auth.users.raw_app_meta_data.agencies`
da bi JWT nosio listu.

### `invitations`

| Kolona | Tip |
|---|---|
| id, agency_id, email, role, token_hash, invited_by, expires_at (7 dana), accepted_at, created_at | |

Token se čuva kao SHA-256 heš, sam token ide samo u email.

### `branding`

Jedan red po agenciji.

| Kolona | Tip | Napomena |
|---|---|---|
| agency_id | uuid pk fk | |
| logo_path | text null | Storage, max 512 KB, PNG/SVG |
| primary_color | text | `#RRGGBB`, CHECK regex |
| headline | text | max 80 |
| subline | text | max 160 |
| button_label | text | max 30 |
| report_intro | text | max 400, ispod ocjene |
| cta_label, cta_url | text | dugme na zamućenom dijelu |
| footer_text | text null | max 200 |
| hide_powered_by | boolean | samo ako entitlement dozvoli, provjera u API-ju |
| updated_at | | |

### `embed_keys`

| Kolona | Tip | Napomena |
|---|---|---|
| id | uuid pk | |
| agency_id | uuid fk | |
| public_key | text unique | `pk_live_` plus 24 base62 znaka |
| label | text | "Main site", "Landing 2" |
| allowed_origins | text[] | lista domena, prazna znači sve (upozorenje u UI) |
| status | text | `active`, `revoked` |
| last_used_at | timestamptz null | |
| created_at, revoked_at | | |

Ključ je javan (stoji u HTML-u), zato nije tajna, ali je vezan za origin listu koju
`/embed.js` i API provjeravaju kroz `Origin` i `Referer`.

### `leads`

Osoba koja je unijela URL i email.

| Kolona | Tip | Napomena |
|---|---|---|
| id | uuid pk | |
| agency_id | uuid fk | |
| embed_key_id | uuid fk null | null za hostovani obrazac |
| email | citext | |
| email_domain | text | generisano, za grupisanje |
| site_url | text | normalizovan, bez fragmenta |
| site_host | text | za dedup i pretragu |
| name | text null | ako obrazac traži |
| phone | text null | ako obrazac traži |
| status | text | `new`, `contacted`, `qualified`, `won`, `lost`, `spam`; CHECK |
| source_url | text null | stranica agencije na kojoj je obrazac bio |
| utm | jsonb | `{source, medium, campaign}` |
| consent | jsonb | vidi dolje, obavezno |
| ip_hash | text | SHA-256 s dnevnom soli, briše se poslije 30 dana |
| country | text null | iz Cloudflare zaglavlja |
| first_viewed_at | timestamptz null | kad je agencija prvi put otvorila |
| notes | text null | |
| unsubscribed_at | timestamptz null | |
| created_at, updated_at | | |

`consent` sadrži: `{text: "puni tekst pristanka", version: "2026-09-01", checked: true,
ts: "...", form_url: "...", ip_hash: "..."}`. Ovo je dokaz za GDPR, ne mijenja se.

Indeksi: `(agency_id, created_at desc)`, `(agency_id, status)`, `(agency_id, email)`,
`(agency_id, site_host)`, GIN na `to_tsvector('simple', email || ' ' || site_url)` za
pretragu.

Dedup pravilo: isti email i isti site_host u istoj agenciji unutar 24 h ne pravi novi
lead nego novi audit na postojećem leadu.

### `audits`

Jedan pokrenuti audit jedne stranice.

| Kolona | Tip | Napomena |
|---|---|---|
| id | uuid pk | |
| agency_id | uuid fk | |
| lead_id | uuid fk null | null za test audit iz onboardinga |
| site_id | uuid fk null | faza 3 |
| token | text unique | 32 znaka, javni link `/r/<token>` |
| url | text | tačno šta smo dohvatili |
| final_url | text null | poslije redirekta |
| status | text | `queued`, `fetching`, `checking`, `generating`, `done`, `failed`, `expired`; CHECK |
| failure_code | text null | `fetch_timeout`, `blocked`, `dns`, `too_large`, `ssrf`, `model`, `internal` |
| score | smallint null | 0 do 100 |
| summary | jsonb null | `{groups: {technical: 80, content: 60, ...}, passed: [...], failed: [...], warnings: [...]}` |
| result_path | text null | Storage putanja punog JSON-a |
| variant | text | `full`, `score_only` |
| fetch_ms, check_ms, model_ms | integer null | mjerenje |
| model | text null | koji model je generisao popravke |
| cost_usd_micros | bigint | ukupno |
| pdf_path | text null | |
| viewed_at | timestamptz null | prvi pregled izvještaja |
| view_count | integer | |
| expires_at | timestamptz | po zadržavanju agencije, default 90 dana |
| created_at, started_at, finished_at | | |

Indeksi: `token`, `(agency_id, created_at desc)`, `(lead_id)`, `(status) where status in
('queued','fetching','checking','generating')` (partial, mali), `(expires_at) where
status = 'done'` za sweep.

Puni rezultat u Storage: `audits/{agency_id}/{yyyy}/{mm}/{audit_id}.json.gz`. Sadrži
sve provjere s dokazima, HTML izvode, tri popravke s obrazloženjem, sirovo zaglavlje
odgovora. Nikad se ne čita listom, samo za jedan izvještaj.

### `checks_catalog`

Statična tabela, puni se iz koda pri deployu. Nije po agenciji.

| Kolona | Tip |
|---|---|
| code (pk, npr. `title_missing`), group_key, severity, weight, title, description, docs_url, enabled, version | |

Referenca za UI i za težine u ocjeni. Kad se težina promijeni, stari auditi zadrže
svoj `summary` kakav je bio (ne preračunavamo unazad).

### `events`

Sve što se desilo, jedna tabela, particionisana po mjesecu. Iz nje se prave
statistike, grafovi i mjerenje konverzije.

| Kolona | Tip | Napomena |
|---|---|---|
| id | uuid | |
| agency_id | uuid | |
| type | text | `form_view`, `form_submit`, `audit_done`, `report_view`, `email_sent`, `email_open`, `cta_click`, `lead_status`, `webhook_ok`, `webhook_fail` |
| audit_id, lead_id | uuid null | |
| props | jsonb | mali, do 1 KB |
| created_at | timestamptz | ključ particije |

Primarni ključ `(created_at, id)`. Particija po mjesecu kroz `pg_partman`, unaprijed
napravljene 3 buduće, stare starije od 13 mjeseci se odvajaju i brišu. Indeks
`(agency_id, type, created_at)`.

### `stats_daily`

Sažetak iz `events`, jedan red po agenciji po danu, puni ga job `stats.rollup` svaki sat
za tekući dan i jednom noću za jučer (konačno).

| Kolona |
|---|
| agency_id, day (date), form_views, submits, audits_done, audits_failed, report_views, emails_sent, cta_clicks, leads_new, cost_usd_micros |

PK `(agency_id, day)`. Pregled i grafovi čitaju samo ovu tabelu, nikad `events`.

### `usage_monthly`

Brojači za limite plana.

| Kolona |
|---|
| agency_id, period (date, prvi u mjesecu), audits_used, audits_limit, emails_used, resets_at |

PK `(agency_id, period)`. Uvećava se atomski `update ... set audits_used = audits_used + 1
where audits_used < audits_limit returning *`. Ako ne vrati red, limit je pun.

### `notification_settings`

| Kolona |
|---|
| agency_id pk, new_lead_email (bool), new_lead_to (text[]), daily_digest (bool), digest_hour (smallint), webhook_url (text null), webhook_secret_encrypted (bytea null), webhook_events (text[]), updated_at |

### `webhook_deliveries`

| Kolona |
|---|
| id, agency_id, event_type, payload (jsonb), url, attempt (smallint), status (`pending`, `ok`, `failed`, `dead`), response_code, response_ms, last_error, next_attempt_at, created_at, delivered_at |

Čuva se 30 dana. Ponovni pokušaji: 1 min, 5 min, 30 min, 2 h, 12 h, pa `dead`.

### `email_log`

| Kolona |
|---|
| id, agency_id, audit_id null, lead_id null, to_hash, template, provider_id, status (`sent`, `delivered`, `bounced`, `complained`, `failed`), opened_at, clicked_at, created_at |

Adresa se ne čuva u čistom tekstu ovdje, samo heš, jer log živi duže od leada.

### `suppressions`

Globalna lista adresa kojima više ne šaljemo, po agenciji i globalno.

| Kolona |
|---|
| id, agency_id null (null znači globalno), email_hash, reason (`unsubscribe`, `bounce`, `complaint`, `manual`), created_at |

Unique `(coalesce(agency_id, '00000000-...'), email_hash)`.

### `audit_log`

Append-only. Vidi `16-access-control.md`.

| Kolona |
|---|
| id, agency_id null, actor_user_id null, actor_type (`user`, `staff`, `system`), action, target_type, target_id, ip_hash, user_agent, meta (jsonb), created_at |

Politika: samo INSERT, i to kroz funkciju `security definer`. Particija po mjesecu,
čuva se 24 mjeseca.

### `feature_flags`

| Kolona |
|---|
| key pk, enabled (bool), rollout_pct (smallint), agencies (uuid[]), description, updated_at |

### `blocklist`

Za zloupotrebu.

| Kolona |
|---|
| id, kind (`email_domain`, `site_host`, `ip_range`, `embed_origin`), value, reason, created_by, expires_at, created_at |

## Faza 2: naplata

### `subscriptions`

Ogledalo Stripe stanja, sinhronizovano po `customer_id` (vidi `24-billing.md`).

| Kolona |
|---|
| id, agency_id, stripe_subscription_id unique, stripe_price_id, plan, status (`trialing`, `active`, `past_due`, `canceled`, `unpaid`, `paused`), current_period_start, current_period_end, cancel_at, canceled_at, trial_end, seats, created_at, updated_at |

### `entitlements`

Šta agencija smije, izračunato iz plana, jedan red po agenciji. Aplikacija čita samo
ovo, nikad Stripe direktno.

| Kolona |
|---|
| agency_id pk, audits_per_month, embed_keys_max, team_seats, hide_powered_by (bool), pdf (bool), webhook (bool), export (bool), custom_domain (bool), retention_days_max, source (`plan`, `manual`, `trial`), updated_at |

### `invoices_cache`

Samo za prikaz na `/billing`, puni se iz webhooka.

| Kolona |
|---|
| id, agency_id, stripe_invoice_id, number, amount_cents, currency, status, hosted_url, pdf_url, period_start, period_end, created_at |

## Faza 3: sajtovi i popravke

### `sites`

| Kolona |
|---|
| id, agency_id, url, host, name, verified_at, verify_method (`dns`, `file`, `gsc`, `meta`), cms (`wordpress`, `shopify`, `static`, `unknown`), status, client_can_approve (bool), crawl_limit (default 500), schedule (`manual`, `weekly`, `monthly`), created_at, deleted_at |

### `site_members`

Koji `client` vidi koji sajt. `(site_id, user_id, can_approve)`.

### `connections`

| Kolona |
|---|
| id, agency_id, site_id, type (`wordpress`, `github`, `patch`), status, config (jsonb, bez tajni), credentials_encrypted (bytea), credentials_key_id, last_ok_at, last_error, created_at, revoked_at |

Tajne su omotane (envelope encryption), vidi `22-security.md`.

### `crawls`

| Kolona |
|---|
| id, agency_id, site_id, status, pages_found, pages_crawled, pages_failed, started_at, finished_at, result_path, cost_usd_micros |

### `pages`

| Kolona |
|---|
| id, agency_id, site_id, crawl_id, url, status_code, content_type, title, meta_description, canonical, h1, word_count, html_hash, render_mode (`static`, `js`), fetched_at |

Indeks `(site_id, url)`, `(crawl_id)`. Tijelo stranice se ne čuva u tabeli, samo u
Storage kad je potrebno za diff.

### `findings`

| Kolona |
|---|
| id, agency_id, site_id, crawl_id, page_id null, check_code, severity, data (jsonb), fingerprint (text), first_seen_at, last_seen_at, resolved_at |

`fingerprint` je heš `(check_code, page url, ključni podatak)` da isti problem kroz više
crawlova bude jedan red koji se ažurira, ne novi svaki put.

### `fixes`

| Kolona |
|---|
| id, agency_id, site_id, finding_id, kind (`title`, `meta`, `jsonld`, `alt`, `heading`, `canonical`, `redirect`, `robots`), state (`proposed`, `approved`, `rejected`, `applying`, `applied`, `failed`, `rolled_back`), before (jsonb), after (jsonb), rationale, model, cost_usd_micros, proposed_by (`system`, uuid), approved_by uuid null, approved_at, applied_at, created_at |

### `fix_applications`

Jedan pokušaj primjene.

| Kolona |
|---|
| id, agency_id, fix_id, connection_id, snapshot_path, result (`ok`, `failed`), log (jsonb), external_ref (post id, PR url), applied_at, rolled_back_at, rollback_reason |

Snimak prije primjene ide u Storage i čuva se 90 dana.

### `gsc_connections`, `gsc_daily`

| Kolona |
|---|
| gsc_connections: id, agency_id, site_id, property, refresh_token_encrypted, scope, status, last_sync_at |
| gsc_daily: site_id, day, page, query, clicks, impressions, ctr, position; PK (site_id, day, page, query) |

`gsc_daily` je najveća tabela u fazi 3, particija po mjesecu, čuva 16 mjeseci (koliko
i Google daje).

### `reports`

| Kolona |
|---|
| id, agency_id, site_id, period_start, period_end, pdf_path, sent_to (text[]), sent_at, created_at |

## Storage buckets

| Bucket | Javan | Sadržaj | Životni vijek |
|---|---|---|---|
| `branding` | da, kroz CDN | logotipi | dok agencija postoji |
| `audit-results` | ne | puni JSON audita | po zadržavanju agencije |
| `pdfs` | ne, potpisani URL 1 h | PDF izvještaji | 90 dana |
| `snapshots` | ne | stanje prije primjene popravke | 90 dana |
| `exports` | ne, potpisani URL 15 min | CSV izvozi | 24 h |
| `crawl-pages` | ne | HTML stranica za diff | do sljedećeg crawla |

## Zadržavanje i brisanje

| Šta | Koliko | Ko briše |
|---|---|---|
| lead i njegovi auditi | po agenciji, 30 do 365 dana, default 90 | `retention.sweep` noću |
| `ip_hash` na leadu | 30 dana | isti job |
| `events` | 13 mjeseci | odvajanje particije |
| `audit_log` | 24 mjeseca | odvajanje particije |
| `webhook_deliveries`, `email_log` | 30 dana, 13 mjeseci | sweep |
| agencija poslije brisanja naloga | 30 dana meko, pa tvrdo sve | sweep |
| Storage objekti | prate red na koji pokazuju | sweep briše i objekt |

Brisanje leada na zahtjev posjetioca (link iz emaila ili zahtjev agenciji) radi odmah:
red leada nestaje, audit ostaje bez `lead_id`, emaila i IP-a, izvještaj vraća 410.

## Veličine na 100.000 korisnika

Pretpostavka: 100.000 registrovanih agencija, 15% aktivnih mjesečno, prosjek 60 audita
mjesečno po aktivnoj, dakle oko 900.000 audita mjesečno.

| Tabela | Redova mjesečno | Bajtova po redu | Rast mjesečno |
|---|---|---|---|
| audits | 900.000 | ~1,5 KB s indeksima | 1,4 GB |
| leads | 600.000 | ~1 KB | 0,6 GB |
| events | 9.000.000 | ~250 B | 2,3 GB, briše se poslije 13 mj |
| stats_daily | 450.000 | 150 B | 70 MB |
| Storage audit JSON | 900.000 | 12 KB gzip | 11 GB |

Baza poslije 12 mjeseci: oko 30 do 40 GB (bez events koji se rotiraju). To je udobno na
Supabase Large i na jednom Hetzner CX53 sa 240 GB NVMe. Vidi `21-capacity.md`.

## Migracije

- Drizzle Kit, jedna migracija po PR-u, ime `NNNN_opis.sql`.
- RLS politike i funkcije žive u `db/policies/*.sql` i primjenjuju se u istoj migraciji.
- Nikad `drop column` u istoj migraciji u kojoj se kod prestaje koristiti. Prvo kod
  prestane pisati, sljedeći deploy briše kolonu (expand, contract).
- Svaka migracija se prvo pusti na `staging` Supabase projekat, pa na produkciju.
- Seed za lokalni razvoj: 3 agencije, 200 leadova, 500 audita, sve generisano iz
  `db/seed.ts`, isti podaci koje koristi Storybook mock.
