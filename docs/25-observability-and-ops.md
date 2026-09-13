# Nadzor, deploy, backup, dežurstvo

Kako znamo da sistem radi, kako kod stiže u produkciju, i šta se radi kad nešto pukne.
Sve na besplatnim ili jeftinim alatima dok ne bude razloga za drugo.

## Alati

| Potreba | Alat | Plan | Cijena |
|---|---|---|---|
| Greške s stack traceom, web i radnik | Sentry | Developer | 0 (5.000 grešaka mjesečno), Team 26 $ kasnije |
| Logovi, pretraga, grafovi iz logova | Axiom | Personal | 0 (500 GB mjesečno ingest), Team kasnije |
| Metrike servera, Postgres, dashboardi | Grafana Cloud | Free | 0 (10k serija, 14 dana) |
| Uptime, heartbeat, dežurni alarm | Better Stack | Free | 0 (10 monitora), alternativa Healthchecks.io za cron |
| Status stranica | Better Stack | uključeno | status.tidywright.com |
| Produkt analitika | naš `events` + `stats_daily` | | 0 |
| Marketing analitika | Plausible ili Umami self-host | | 0 do 9 $ |
| Deploy web | Vercel | Pro | 20 $ |
| Deploy radnik | Coolify na Hetzneru | self-host | 0 |
| CI | GitHub Actions | Free 2.000 minuta | 0 |
| Backup | restic → Hetzner Storage Box + Backblaze B2 | | 4 € + ~1 $ |

## Logovanje

- `pino` u oba app-a, JSON, jedan red po događaju, nivo `info` u produkciji.
- Svaki log nosi `req_id` (iz Cloudflare `cf-ray` ili generisan), `agency_id` ako
  postoji, `job_id` u radniku. Bez emaila, tokena, tijela zahtjeva (`redact` lista).
- Transport: `pino` → Axiom kroz `@axiomhq/pino`. Vercel logovi idu kroz Vercel Log
  Drain u Axiom (Pro plan ima drains).
- Radnik loguje svaki posao: početak, kraj, trajanje, ishod, trošak modela, `failure_code`.
  Iz toga Axiom dashboard: auditi po satu, stopa grešaka po kodu, p50/p95 trajanje,
  trošak po satu.

## Metrike

Radnik izlaže `/metrics` (Prometheus format, `prom-client`) samo na privatnoj mreži,
Grafana Alloy agent na istom serveru ga skrejpa i šalje u Grafana Cloud. Metrike:
- `tw_audits_total{status, failure_code}`
- `tw_audit_duration_seconds{step}` histogram
- `tw_queue_depth{queue}` (iz pg-boss `getQueueSize`)
- `tw_model_cost_usd_total{provider}`
- `tw_model_latency_seconds{provider}`
- `tw_emails_total{template, status}`
- `tw_render_memory_bytes`
- Node default (heap, event loop lag)

Postgres kroz Supabase Grafana integraciju (Supabase izlaže Prometheus endpoint na Pro).

## Alarmi

Pravilo: alarm koji budi čovjeka mora značiti da korisnik trpi. Sve ostalo ide u dnevni
digest.

| Alarm | Uslov | Kanal | Budi? |
|---|---|---|---|
| Radnik mrtav | heartbeat nije stigao 3 min | Better Stack → push + SMS | da |
| Web pao | `https://siteauditserver.com/healthz` 2 provjere zaredom neuspjele | Better Stack | da |
| Red raste | `tw_queue_depth{audit.run}` > 200 kroz 10 min | Grafana → email + push | da |
| Stopa grešaka | `failed` > 20% u 15 min (min 20 audita) | Grafana | da |
| Model ne radi | `failed:model` > 10 u 5 min | Grafana | da |
| Email bounce | bounce > 5% u satu | Axiom monitor | ne, digest |
| Trošak | model trošak > 2× dnevnog prosjeka do 12 h | Axiom | ne, digest |
| Disk | > 80% | Grafana | ne, digest |
| Cert | ističe za 14 dana | Better Stack | ne |
| Nova Sentry greška | prva pojava | Sentry → email | ne |
| Backup | restic nije javio success do 06:00 | Healthchecks.io | ne, ali isti dan |
| Stripe webhook | 5 neuspjeha u satu | Sentry | ne |

Dežurstvo: jedan čovjek, telefon, Better Stack aplikacija. Eskalacija ne postoji dok
smo sami. Tihi sati: nema, jer korisnici su globalni. Alarmi "budi" su namjerno rijetki.

## Zdravstvene provjere

- Web: `GET /healthz` vraća 200 s `{db: ok, version}`; Cloudflare i Better Stack ga
  gađaju.
- Radnik: `GET /healthz` na privatnom portu (Coolify ga koristi za restart) plus
  heartbeat ping na Better Stack svakih 60 s iz procesa, sa `pg-boss` stanjem. Ako se
  proces vrti a red stoji, heartbeat to vidi jer šalje i `last_job_at`.
- Sintetički test: svakih 15 min Better Stack pošalje pravi audit na
  `https://siteauditserver.com/e/pk_test_synthetic` za `example.com` i očekuje `done`
  ispod 60 s. To je jedini test koji dokazuje da cijeli lanac radi.

## Okruženja i grane

| Okruženje | Grana / tag | Web | Radnik | Baza | Stripe | Model |
|---|---|---|---|---|---|---|
| local | bilo koja | `next dev` | `tsx watch` | Docker Postgres + Supabase CLI | test mode | mock (fiksni odgovor) ili pravi s malim budžetom |
| preview | svaki PR | Vercel preview | ne | staging Supabase | test | mock |
| staging | `main` | Vercel staging domen | Hetzner CX23 | staging Supabase | test | pravi |
| prod | tag `vX.Y.Z` | Vercel prod | Hetzner prod | Supabase Pro | live | pravi |

## CI/CD pipeline (GitHub Actions)

Na svaki PR (`ci.yml`):
1. `pnpm install --frozen-lockfile`
2. `pnpm lint` (eslint, uključujući naša pravila: nema `fetch` van `safeFetch`, nema
   servisnog ključa u `app/`)
3. `pnpm typecheck`
4. `pnpm test` (vitest, jedinični i integracijski s Postgres servisom u Actions)
5. RLS test (dvije agencije), SSRF lista
6. `pnpm build` za web i radnik
7. Storybook build i vizuelni test (Chromatic free ili Playwright screenshot diff)
8. `gitleaks` skeniranje tajni
9. `pnpm audit --audit-level=high`

Na merge u `main` (`deploy-staging.yml`):
1. sve gore
2. Drizzle migracije na staging bazu
3. Docker slika radnika → GitHub Container Registry, tag `sha`
4. Coolify webhook → deploy na staging radnik
5. Vercel automatski deploya `main` na staging domen
6. Smoke test: sintetički audit na stagingu mora proći

Na tag `v*` (`deploy-prod.yml`):
1. ručno odobrenje (GitHub Environment `production` s required reviewer, to smo mi)
2. migracije na prod (samo `expand` promjene, `contract` u sljedećem tagu)
3. Coolify deploy prod radnika (rolling: novi kontejner, health ok, stari se gasi;
   pg-boss posao u toku se završi jer stari dobije SIGTERM i ima 60 s grace)
4. Vercel promote
5. Smoke test na produkciji
6. Sentry release s tagom, source maps

Vraćanje unazad: Vercel "promote previous", Coolify "redeploy previous image", migracije
se ne vraćaju (zato expand/contract).

## Backup

| Šta | Kako | Gdje | Koliko često | Čuva |
|---|---|---|---|---|
| Postgres (Supabase) | Supabase dnevni backup uključen na Pro; PITR (100 $) od stepenice B | Supabase | dnevno / kontinuirano | 7 dana / 7 dana |
| Postgres, naša kopija | `pg_dump -Fc` iz radnika kroz cron, restic | Storage Box + B2 | dnevno 03:00 UTC | 30 dana, sedmični 6 mjeseci |
| Storage bucketi | `rclone sync` Supabase Storage → B2 | B2 | dnevno | 30 dana verzija |
| Coolify konfiguracija i volumeni | restic | Storage Box | dnevno | 14 dana |
| Repozitorij | GitHub plus lokalni klon | | | |
| Env tajne | ručno u password manageru, jednom mjesečno provjera | 1Password ili Bitwarden | | |

Restic repozitorij je šifrovan, ključ u password manageru. Healthchecks.io ping poslije
svakog uspješnog backupa.

**Restore vježba, jednom mjesečno, u kalendaru:** uzeti jučerašnji `pg_dump`, vratiti u
lokalni Docker Postgres, pokrenuti app lokalno protiv njega, otvoriti tri izvještaja.
Zapisati u `ops/restore-log.md` datum i koliko je trajalo. Backup koji nikad nije
vraćen ne postoji.

## Runbookovi (`ops/runbooks/`)

Kratki, jedan po problemu, koraci koje čovjek u 3 ujutro može pratiti:
- `worker-down.md`: Coolify → logs → restart → ako ne, redeploy previous → ako ne,
  novi server iz snapshot-a
- `queue-stuck.md`: `select state, count(*) from pgboss.job group by 1`; zaglavljeni
  `active` stariji od 5 min → `pg-boss` će ih vratiti poslije `expireInSeconds`; ako
  ne, ručno `update ... set state='retry'`
- `model-provider-down.md`: prebaci `feature_flags.model_provider` na drugog, prati
  trošak
- `email-provider-down.md`: `emails_paused` flag, red čuva poslove, poslije uključi
- `db-full.md`: odvoji stare `events` particije, obriši `exports`, provjeri `pgboss.archive`
- `restore-db.md`: koraci restore vježbe za pravi slučaj
- `rotate-secrets.md`: lista svih tajni i gdje se mijenjaju
- `abuse.md`: kako pauzirati ključ, agenciju, host; kako obavijestiti

## Sedmična i mjesečna higijena

Sedmično (30 min): Sentry nove greške, Axiom stopa `failed` po kodu, trošak modela,
bounce/complaint, Dependabot PR-ovi.

Mjesečno (2 h): restore vježba, `pg_stat_statements` top 10, disk i rast tabela, pregled
alarma koji su bili lažni (ugasi ili podesi), račun svih dobavljača protiv plana,
rotacija ključeva koji su na redu, ažuriranje `STATUS.md`.

## Cijena nadzora i ops po stepenicama

| Stepenica | Mjesečno |
|---|---|
| A | 0 (svi free planovi) plus 5 $ B2 |
| B | Sentry Team 26 $, Axiom Team 25 $, Better Stack 25 $, Grafana free, ~80 $ |
| C | ~200 $ |
