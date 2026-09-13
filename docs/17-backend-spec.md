# Specifikacija backenda

Šta radi server, koji API postoji, koji poslovi se izvršavaju u pozadini, i kako se
sve to drži pod kontrolom. Shema baze je u `18-data-model.md`. Sigurnost u
`22-security.md`.

## Dijelovi

```
                     Cloudflare (DNS, WAF, keš, Turnstile)
                                   |
        +--------------------------+---------------------------+
        |                          |                           |
  tidywright.com           app.tidywright.com          siteauditserver.com
  (marketing, static)      (Next.js app)               (Next.js, javne rute)
                                   |                           |
                                   +-------------+-------------+
                                                 |
                                       API rute u Next.js
                                                 |
                       +-------------------------+-------------------------+
                       |                         |                         |
                  Supabase                  Red poslova              Object storage
                  (Postgres, Auth,          (pg-boss u               (Hetzner ili R2:
                   Storage)                  Postgresu)               puni nalazi, PDF,
                       |                         |                    logo, snimci)
                       |                   Radnik (Node, Hetzner)
                       |                         |
                       |          +--------------+--------------+
                       |          |              |              |
                       |      Dohvat         Model (LLM)     Email (Resend)
                       |      stranice       JSON izlaz      i webhook
```

Dva procesa u kodu: `apps/web` (Next.js, sve tri domene kroz routing po hostu) i
`apps/worker` (Node, dugotrajan proces koji vuče poslove iz reda). Dijele `packages/*`.

## Princip

- Web nikad ne radi ništa što traje duže od sekunde. Sve što traje ide u red, web vrati
  identifikator, klijent gleda status.
- Radnik nikad ne prima HTTP. Samo vuče iz reda.
- Baza je izvor istine za sve. Red je u istoj bazi, pa se upis audita i upis posla
  dešavaju u istoj transakciji, i nema "posao postoji a red ne postoji".
- Svaka eksterna stvar (model, email, ciljni sajt) može pasti. Svaki poziv ima timeout,
  broj pokušaja, i jasan zapis kad odustane.

## API, faza 1

Sve rute su `app/api/...` u Next.js, JSON, verzija u putanji `/api/v1/`. Autentikacija:
sesija (kolačić) za app, embed ključ za javne rute, servisni ključ nikad izvana.

### Javne rute (siteauditserver.com)

| Metoda i ruta | Ko | Ulaz | Izlaz | Napomene |
|---|---|---|---|---|
| `POST /api/v1/audits` | visitor, embed ključ | `{key, url, email, consent_marketing, turnstile_token, host, variant?}` | `201 {audit_id, report_url, status}` ili `4xx {error: kod}` | validacija po redoslijedu iz `13-widget-spec.md`; idempotentno po `(key, normalized_url, email, dan)`: vraća postojeći |
| `GET /api/v1/audits/:id/status` | visitor, po tokenu izvještaja | | `{status, score?, report_url}` | za polling iz obrasca i izvještaja; 2 s interval, keš 1 s |
| `GET /api/v1/embed/:key/config` | visitor | | `{branding, cta, mode, hosts}` | keš 60 s na CDN-u; bez privatnih podataka |
| `POST /api/v1/unsubscribe/:token` | visitor | | `204` | |

### Rute aplikacije (app.tidywright.com)

| Metoda i ruta | Uloga | Svrha |
|---|---|---|
| `GET /api/v1/me` | svi prijavljeni | korisnik, agencije, aktivna agencija, uloge |
| `POST /api/v1/agencies` | novi korisnik | pravi agenciju pri registraciji, korisnik postaje owner |
| `PATCH /api/v1/agencies/:id` | admin, owner | ime, slug, sajt, vremenska zona |
| `GET/PUT /api/v1/agencies/:id/branding` | admin, owner | brendiranje; PUT vraća validirano stanje |
| `POST /api/v1/agencies/:id/branding/logo` | admin, owner | upload, do 500 KB, PNG ili SVG, sanitizacija SVG-a |
| `GET /api/v1/agencies/:id/embed-keys` | member+ | ključevi |
| `POST /api/v1/agencies/:id/embed-keys/rotate` | admin, owner | novi ključ, stari radi 24 h |
| `PUT /api/v1/agencies/:id/embed-keys/:key/hosts` | admin, owner | lista dozvoljenih hostova |
| `GET /api/v1/agencies/:id/leads` | member+ | paginacija, filter, pretraga |
| `GET /api/v1/agencies/:id/leads/:leadId` | member+ | detalj s tekstom pristanka |
| `PATCH /api/v1/agencies/:id/leads/:leadId` | admin, owner | status |
| `DELETE /api/v1/agencies/:id/leads/:leadId` | admin, owner | briše lead, audit, izvještaj (410), fajlove |
| `POST /api/v1/agencies/:id/leads/export` | admin, owner | CSV, generiše se u pozadini, link stiže emailom ako je veće od 1.000 |
| `GET /api/v1/agencies/:id/audits` | member+ | |
| `GET /api/v1/agencies/:id/audits/:auditId` | member+ | s događajima; cijena modela samo owner i staff |
| `POST /api/v1/agencies/:id/audits/:auditId/rerun` | admin, owner | novi audit, isti URL, bez emaila posjetiocu |
| `GET/PUT /api/v1/agencies/:id/settings` | admin, owner | obavještenja, webhook, zadržavanje |
| `POST /api/v1/agencies/:id/webhook/test` | admin, owner | šalje test događaj |
| `GET /api/v1/agencies/:id/stats?range=` | member+ | brojke za pregled |
| `POST /api/v1/agencies/:id/export` | owner | sav sadržaj naloga kao zip, u pozadini |
| `DELETE /api/v1/agencies/:id` | owner | brisanje naloga, s odgodom od 7 dana |

Faza 2 dodaje `/billing/*` (checkout session, portal session) i `/team/*` (pozivnice,
uloge). Faza 3 dodaje `/sites/*`, `/sites/:id/crawls`, `/sites/:id/findings`,
`/sites/:id/fixes`, `/sites/:id/fixes/:fixId/approve|reject|apply|rollback`,
`/sites/:id/connections/*`, `/sites/:id/search-console/*`.

### Webhook rute (primaju izvana)

| Ruta | Od koga | Provjera |
|---|---|---|
| `POST /api/webhooks/stripe` | Stripe | potpis na sirovom tijelu, dedupe po `event.id`, odgovor 200 odmah, obrada u redu |
| `POST /api/webhooks/resend` | Resend | Svix potpis, dedupe po `svix-id`; bounce i complaint upisuju na lead |
| `POST /api/webhooks/github` | GitHub App (faza 3) | HMAC potpis |

### Konvencije

- Greške: `{error: "kod", message: "za ljude", details?: {...}}`, HTTP status po smislu
  (400 validacija, 401 nije prijavljen, 403 nema pravo, 404 ne postoji ili nema pravo,
  409 sukob, 422 semantika, 429 limit, 5xx naše).
- Paginacija: `?cursor=&limit=` (do 100), odgovor `{items, next_cursor}`. Nikad offset
  na velikim tabelama.
- Idempotency: sve POST rute koje prave nešto primaju `Idempotency-Key` zaglavlje i
  čuvaju odgovor 24 h.
- Sve vrijeme u UTC, ISO 8601. Prikaz u vremenskoj zoni agencije radi klijent.
- Rate limit po ruti i po korisniku (Redis kad ga bude, do tada Postgres brojač):
  javne rute 60/min po IP, app rute 600/min po korisniku, izvoz 5/sat.

## Poslovi u pozadini (radnik)

Red je pg-boss u Postgresu, sa svojom šemom. Svaki posao ima ime, ulaz, broj pokušaja,
backoff, timeout i dead letter red.

| Posao | Ulaz | Pokušaji | Timeout | Šta radi |
|---|---|---|---|---|
| `audit.run` | `{audit_id}` | 2 | 60 s | cijeli tok jednog audita (vidi ispod) |
| `audit.email_visitor` | `{audit_id}` | 5, eksponencijalno | 15 s | Resend poziv |
| `audit.notify_agency` | `{audit_id}` | 5 | 15 s | email agenciji plus webhook |
| `webhook.deliver` | `{agency_id, event, payload}` | 6 (1m, 5m, 30m, 2h, 6h, 24h) | 10 s | POST s HMAC potpisom, zapis isporuke |
| `export.leads_csv` | `{agency_id, filter, user_id}` | 1 | 5 min | fajl u storage, email s linkom koji traje 24 h |
| `export.account` | `{agency_id}` | 1 | 15 min | zip |
| `retention.sweep` | cron dnevno 03:00 UTC | 1 | 30 min | briše leadove, snimke i izvještaje po podešavanju agencije, briše obrisane naloge poslije 7 dana |
| `usage.reset` | cron dnevno 00:00 UTC | 1 | 1 min | dnevni brojači |
| `stats.rollup` | cron svaki sat | 1 | 5 min | `events` u `stats_daily` |
| `stripe.sync` | `{event_id}` | 5 | 30 s | ponovo čita subscription iz Stripea, upisuje entitlements |
| `stripe.reconcile` | cron dnevno | 1 | 10 min | prolazi sve pretplate i poravnava |
| `queue.archive` | cron dnevno | 1 | 10 min | briše završene poslove starije od 7 dana |

Faza 3: `crawl.site` (jedan posao po sajtu, frontier u memoriji, do 500 stranica, 2
zahtjeva u sekundi po hostu), `fix.generate`, `fix.apply`, `fix.rollback`, `gsc.sync`,
`psi.fetch`, `render.page` (Playwright, samo kad pre-check kaže da treba).

### Tok `audit.run`, korak po korak

```
1. učitaj audit, provjeri status = queued, postavi running, zapiši started_at
2. SSRF provjera hosta (opet, jer je vrijeme prošlo od upisa): razriješi DNS,
   provjeri sve adrese, zakači izabranu IP na dispatcher
3. paralelno:
   a. GET stranice: timeout 10 s, do 5 preusmjerenja (svako ponovo provjereno),
      do 2 MB, samo text/html, zapiši lanac i status
   b. GET robots.txt (timeout 5 s)
   c. HEAD http:// varijante
   d. HEAD www / bez www varijante
4. ako a. nije 2xx: status failed:fetch ili failed:blocked (403 s challenge potpisom,
   429), zapiši, pošalji email posjetiocu s objašnjenjem, kraj
5. parsiraj HTML (htmlparser2 kroz cheerio), izvuci: title, meta, og, twitter,
   canonical, robots meta, hreflang, html lang, h1..h6, slike s alt, linkove, JSON-LD,
   vidljivi tekst (bez nav i footer), naziv, adresu i telefon ako se prepoznaju
6. pokreni 29 provjera, svaka vrati {code, group, severity, passed, evidence, fixable}
7. izračunaj ocjenu po grupama i ukupnu
8. izaberi do 3 nalaza za popravku po prioritetu; ako varijanta = score_only, preskoči
   korak 9
9. jedan poziv modelu sa strukturiranim JSON izlazom; validacija; ako padne, jedan
   ponovni poziv s porukom greške; ako opet padne, zapiši i nastavi bez popravki
   (izvještaj i dalje vrijedi)
10. upiši: findings i fixes u storage (JSON), summary i score u audits, cost,
    duration, status done
11. u istoj transakciji: enqueue audit.email_visitor i audit.notify_agency
12. events: audit_done
```

Sve od 2 do 10 mora stati u 60 sekundi ili se posao ubija i označava failed:timeout.
Cilj: 90 posto audita gotovo za 8 sekundi.

### Ugovor s modelom

Tačan tekst promptova, šema izlaza, osam koraka validacije i test set za kvalitet su u
`33-model-prompts.md`.

- Jedan dobavljač u kodu iza interfejsa `FixGenerator` s implementacijama za OpenAI,
  Anthropic i Gemini, da se prebacivanje svodi na konfiguraciju.
- Strukturirani izlaz (JSON schema) uvijek, temperatura niska, reasoning isključen ili
  minimalan (bitno: reasoning tokeni se naplaćuju kao izlaz i mogu utrostručiti cijenu).
- Ulaz ograničen na oko 2.000 tokena: vidljivi tekst se reže na 1.500 znakova.
- Izlaz se validira zod šemom, pa pravilima iz `06-fixes.md` (dužine, jedinstvenost,
  JSON-LD parsiranje i obavezna polja).
- Trošak se računa iz `usage` u odgovoru i upisuje po auditu. Dnevni prag: ako prosjek
  pređe 0,03 USD po auditu, upozorenje staffu; ako pređe 0,10 USD, model se gasi
  prekidačem i auditi idu bez popravki dok neko ne pogleda.
- Za ponovno pokretanje audita istog URL-a unutar 24 h, keširani odgovor modela se
  ponovo koristi ako se HTML nije promijenio (hash).

## Email

Resend, s naše domene u fazi 1. Dva predloška:

| Predložak | Kome | Sadržaj |
|---|---|---|
| `visitor_report` | posjetilac | "Your report for [url] is ready", ocjena, dugme, ime i logo agencije, u podnožju adresa agencije i link za odjavu; na plaćenom paketu bez našeg imena |
| `agency_lead` | agencija | "New lead: [email] checked [url]", ocjena, dugme na lead, dugme na izvještaj |

Faza 2: `agency_daily_digest`, `agency_quota_warning`, `billing_*`, `team_invite`.

Bounce i complaint webhook: hard bounce označava lead kao `email_invalid`, complaint
označava `complained` i agencija ga ne može ponovo emailovati kroz nas.

## Webhook prema agenciji

- Događaji: `lead.created`, `audit.completed`, `audit.failed`, `lead.unsubscribed`.
- Tijelo: `{id, type, created_at, data: {...}}`, zaglavlje `X-Tidywright-Signature:
  t=<ts>,v1=<hmac_sha256(secret, ts + "." + body)>`.
- Isporuka kroz `webhook.deliver`, s pokušajima, i tabelom `webhook_deliveries` koju
  agencija vidi u podešavanjima (status, kod odgovora, vrijeme, dugme pošalji ponovo).
- Timeout 10 s, prihvata se samo 2xx.

## Keširanje

- Konfiguracija embeda: 60 s na Cloudflareu i u memoriji radnika.
- Izvještaj: HTML se generiše na serveru i kešira na Cloudflareu dok je status done, s
  invalidacijom po tokenu pri brisanju.
- Statistika za pregled: `stats_daily` tabela, ne upit po `events` uživo.
- Bez Redisa u fazi 1. Uvodi se kad rate limiting u Postgresu postane usko grlo, što po
  računici u `21-capacity.md` nije prije 10.000 audita dnevno.

## Feature flags

Tabela `flags` s ključem i vrijednošću, čita se s kešom od 30 s. Faza 1 ključevi:
`audits_enabled`, `model_enabled`, `pilot_variant_enabled`, `maintenance_mode`,
`signup_enabled`. Mijenjaju se iz admin panela i zapisuju u audit log.

## Šta backend ne radi u fazi 1

Crawl, render JavaScripta, PageSpeed, Search Console, pisanje po tuđem sajtu, PDF,
Stripe. Sve to ima svoje mjesto u kasnijim fazama i ništa od toga ne smije "usput" ući.
