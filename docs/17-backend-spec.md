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
| `audit.retry` | `{audit_id, attempt}` | 4 (5m, 30m, 4h, 24h) | 60 s | ponovni dohvat za ponovljive klase kvara; poslije četvrtog odustaje i šalje djelimičan izvještaj |
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
3. paralelno, sloj 0 i sloj 1 (vidi kaskadu niže):
   a. GET stranice: timeout 10 s, do 5 preusmjerenja (svako ponovo provjereno),
      do 2 MB, samo text/html, zapiši lanac i status
   b. sloj 0: DNS, TLS i cert, RDAP, robots.txt, sitemap.xml, http:// varijanta,
      www i bez www varijanta. Uvijek se izvodi do kraja, i kad a. padne
4. klasifikuj ishod od a. u `failure_code` po tabeli klasa kvara. Ako klasa traži
   eskalaciju, idi na sloj 2 (headless). Ako je klasa ponovljiva, upiši posao u
   `audit.retry`. Ako HTML ostaje nedostupan, nastavi sa onim što je sloj 0 dao i
   isporuči djelimičan izvještaj sa pokrivenošću, ne poruku o grešci
5. parsiraj HTML (htmlparser2 kroz cheerio), izvuci: title, meta, og, twitter,
   canonical, robots meta, hreflang, html lang, h1..h6, slike s alt, linkove, JSON-LD,
   vidljivi tekst (bez nav i footer), naziv, adresu i telefon ako se prepoznaju
6. pokreni provjere iz kataloga koje imaju svoj ulaz (174 od 176 rade u widgetu, vidi
   `05-checks.md`), svaka vrati {code, group, severity, passed, evidence, fixable}
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

### Dohvat: kaskada, klase kvara i djelimičan izvještaj

**Obaveza za B2.** Izvor za svaku brojku i za cijeli katalog uzroka je
`docs/36-fetch-reliability.md`. Identitet agenta i prijava u Verified Bots su preduslov
za B2 i stoje u `docs/31-build-plan.md` i `docs/22-security.md`.

Razlog zašto ovo ne može čekati: procjena je da **12 do 20 posto** proizvoljnih malih
poslovnih sajtova neće dati upotrebljiv HTML iz prvog običnog GET zahtjeva. Uz punu
kaskadu i verifikovan status to pada na **4 do 7 posto**. Neuspio audit je često prvi
utisak koji prospekt dobije i o nama i o agenciji koja je widget stavila na svoj sajt, pa
poruka o grešci nije prihvatljiv ishod. Pravilo je jedno: **neuspio dohvat se pretvara u
nalaz, nikad u praznu stranicu s greškom.**

#### Klase kvara

`failed:fetch` i `failed:blocked` su dvije kante u koje stane dvadesetak bitno različitih
situacija, a od klase zavisi da li ponavljamo, koliko čekamo, da li idemo na headless, i
koju rečenicu vidi posjetilac. Klasa se upisuje u `audits.failure_code`
(`docs/18-data-model.md`), `audits.status` ostaje `failed` i ne širi se.

| `failure_code` | Značenje | Ponovljiv | Eskalacija |
|---|---|---|---|
| `dns` | ime se ne razrješava, NXDOMAIN, SERVFAIL, nema A ni AAAA | ne | probaj `www` i apex, pa RDAP |
| `connect` | TCP se ne uspostavlja, refused, reset, filtriran port | djelimično | druga IP iz A seta, pa `www` |
| `tls` | TCP radi, TLS ne: istekao cert, hostname mismatch, nepotpun lanac | ne | legacy TLS profil kao drugi pokušaj |
| `timeout` | server prihvata ali ne odgovara u budžetu | da | asinhroni red |
| `http_client` | 4xx koji nije bot odbrana: 404 na `/`, 410, 451 | ne | `www`, `/index.html`, sitemap za drugi URL |
| `http_server` | 5xx uključujući Cloudflare 520, 522, 524 | da | asinhroni red |
| `ratelimit` | 429 ili 503 sa `Retry-After` | da | poštuj `Retry-After` doslovno |
| `challenge` | interaktivna prepreka, `cf-mitigated: challenge`, Turnstile | djelimično | **headless sloj**, pa red na 4 h |
| `blocked` | tvrd blok bez prepreke: WAF 403, Cloudflare 1020, geo blok | ne | verifikacija vlasništva i uputstvo vlasniku |
| `robots` | sami smo odustali po pravilu | ne | nikad, namjerno |
| `content` | dohvatili smo nešto neupotrebljivo: prazan SPA, PDF, slika | djelimično | **headless sloj** |
| `too_large`, `ssrf`, `model`, `internal` | postojeći kodovi, ostaju | | |

Ključna razlika koja se mora mjeriti, a ne pogađati: `challenge` i `blocked` nisu isto.
Prvi se često rješava headless renderom, drugi skoro nikad. Razlikuju se po zaglavljima i
kolačićima: `cf-mitigated`, `cf-ray`, `x-amzn-waf-action`, `_abck` i `bm_sz` (Akamai),
`datadome`, `_px` i `_pxvid` (HUMAN), `incap_ses_*` i `visid_incap_*` (Imperva). Bez te
klasifikacije trošimo skupe headless sekunde na slučajeve koji nikad neće proći.

Svaka klasa nosi `user_message_key`, a engleski tekst uz taj ključ živi u izvještaju.
Izvještaj zadržava svoja dva postojeća stanja kvara iz F1, klasa bira rečenicu unutar
njih. Ton je propisan: objasni šta se desilo, reci da je to i SEO nalaz, ponudi sljedeći
korak. Predlošci rečenica po klasi su u `docs/36-fetch-reliability.md`, 5.8.

#### Kaskada, četiri sloja

Eskalacija je uslovna, nikad automatska. Svaki sloj je skuplji od prethodnog.

**Sloj 0, bez HTTP-a. Uvijek se izvodi, paralelno sa slojem 1.** DNS (A, AAAA, CNAME, MX,
NS, TXT, CAA, DNSSEC), TLS handshake sa čitanjem certa (izdavač, istek, pokrivenost SAN-a
za apex i `www`, kompletnost lanca), RDAP za starost domene, zaglavlja odgovora, lanac
redirekcija, `robots.txt`, `sitemap.xml`, `/.well-known/security.txt`, `/favicon.ico`.
Traje 0,2 do 2 s i praktično nikad ne pada. **Ovo je jedini fallback koji faza 1 ima i
zato je obavezan dio B2.**

**Sloj 1, običan HTTP GET.** Pravilan HTTP/2 klijent, naš imenovani UA, kompletan set
realističnih zaglavlja (`Accept`, `Accept-Language`, `Accept-Encoding` samo za ono što
stvarno umijemo dekodirati), praćenje redirekcija, tolerantan HTML parser. Rješava 80 do
88 posto slučajeva.

Eskalacija na sloj 2 samo ako je ispunjen jedan od uslova:

- prisutno je `cf-mitigated: challenge`
- status je 403 sa poznatim WAF potpisom
- odgovor je 200, ali vidljivog teksta ima manje od 500 znakova uz tri ili više `script`
  tagova
- otkriven je meta refresh koji nismo mogli pratiti
- otkriven je potpis CMP-a (OneTrust, Cookiebot, Usercentrics, Quantcast, CookieYes,
  Complianz) a sadržaja nema

**Sloj 2, headless Chrome.** Već je u planu za B2 kao `audit.render`, zaseban kontejner,
samo za SPA detekciju. Kaskada mu daje još tri posla: JS izazove, TLS i HTTP/2 otisak, i
consent interstitial koji zamjenjuje stranicu. Pravi Chrome rješava sve to odjednom, bez
ijednog falsifikovanja, jer tada zaista jesmo browser. Dodaje 3 do 20 sekundi, pa se
rezultati slojeva 0 i 1 prikazuju odmah dok sloj 2 radi.

Bez stealth plugina, bez falsifikovanja otisaka, bez rješavanja CAPTCHA-a. Granica je
zapisana u `docs/22-security.md` i objavljena na `/bot`.

**Sloj 3, izvori koji ne traže naš dohvat. Nije u fazi 1.** PageSpeed Insights API, CrUX,
Search Console kroz OAuth vlasnika, Wayback CDX. Ovdje su zapisani da se zna kuda ide, ali
`decisions/0005` kaže da faza 1 ide **bez PageSpeeda**, a `decisions/0002` da ne kupujemo
tuđe podatke. PSI traži i vlastiti API ključ i do 120 sekundi analize, dakle asinhroni
red. Otvaranje sloja 3 traži novu odluku, ne usputni commit.

#### Djelimičan izvještaj

Procjena je da se **35 do 50 od 176 provjera**, dakle 20 do 28 posto ocjene, može izvesti
bez ijednog bajta HTML-a, samo iz sloja 0. To je dovoljno da izvještaj ne bude prazan.

Obaveze koje iz toga slijede:

- Svaka provjera u katalogu dobija oznaku `requires:` (`none`, `headers`, `html`,
  `rendered_html`, `field_data`). Kolona `needs` u `packages/shared/src/checks-catalog.ts`
  to već radi i treba je samo dovesti do kraja za sloj 0.
- **Pokrivenost je zaseban broj** i prikazuje se uz ocjenu, nikad umjesto nje:
  `pokrivenost 42 od 176, ocjena za izvršene provjere 71`. Ocjena podskupa se ne
  prikazuje kao da je potpuna. Upisuje se u `audits.summary` kao `coverage: {ran, total}`.
- Blokada se obrće u nalaz. Sajt koji blokira imenovan, deklarisan, verifikovan SEO alat
  vrlo vjerovatno blokira i druge legitimne alate, a u nekim konfiguracijama i Googleove.
  To je stavka izvještaja ozbiljnosti "visoko", ne naša greška.
- Isto važi za sve što sloj 0 nađe usput: istekao ili nepotpun cert, `www` koji ne radi
  dok apex radi, petlja redirekcija, `robots.txt` sa `Disallow: /`, domen bez A zapisa,
  parkirana stranica. To su najvredniji nalazi u cijelom izvještaju i tako se i
  prikazuju.

#### Ponovni pokušaji

**Nikad ne ponavljaj:** 401, 403 bez `cf-mitigated`, 404, 405, 410, 451, NXDOMAIN,
Cloudflare 1020, 521, 523, nevalidan cert, `robots`.

**Sinhrono, unutar istog posla:** 408, 425, 429 sa `Retry-After` ispod 10 s, 500, 502,
503, 504, 520, 522, 524, connection reset, TLS timeout, DNS SERVFAIL. Osnovni razmak 1 s,
faktor 2, **puni jitter** (`sleep = random(0, base * 2^attempt)`), najviše 3 pokušaja.
Puni jitter nije detalj: bez njega se paralelni poslovi sinhronizuju i udaraju isti
origin u istom trenutku.

**Timeouti se razdvajaju**, jer jedan ukupan timeout ne sprečava da viseći server drži
slot radnika minutama: DNS 2 s, konekcija 5 s, zaglavlja 10 s, tijelo 20 s, ukupni budžet
sinhrone putanje 25 s.

**Asinhroni red** kad sinhrona putanja padne sa ponovljivom greškom: 5 min, 30 min, 4 h,
24 h, pa odustajanje. Za `challenge` sa signalom Under Attack Mode preskoči prva dva
koraka, jer to stanje traje u epizodama. Izvještaj tada stiže emailom. To je istovremeno
i alat za zadržavanje leada: "poslat ćemo ti izvještaj čim sajt bude dostupan" je bolji
ishod od poruke o grešci.

**Prekidač strujnog kola.** Brojač neuspjeha po hostu i po ASN-u, prozor 15 minuta. Pet
neuspjeha na istom hostu pauzira taj host na sat. Pedeset neuspjeha na istom ASN-u (veliki
shared hosting) usporava sve prema njemu. Ovo štiti našu IP reputaciju, a ona je poslije
verifikacije najvredniji resurs koji imamo.

#### Politika prema `robots.txt`, tri režima

Objavljuje se na `/bot` i sprovodi u kodu. Bez ove politike nas Cloudflare izbacuje iz
programa verifikovanih botova, a to košta više od bilo kojeg pojedinačnog audita.

- **Režim A, audit koji je pokrenuo verifikovani vlasnik sajta** (faza 3). Poštujemo
  `Disallow` samo ako imenuje `TidywrightBot`. Opšti `Disallow: /` za `*` ne poštujemo,
  ali ga prijavljujemo kao nalaz prvog reda. Vlasnik imovine daje pristanak, i Google isti
  obrazac koristi za svoje user-triggered fetchere i za Chrome-Lighthouse.
- **Režim B, audit koji je pokrenulo treće lice na tuđem sajtu.** Ovo je faza 1 i widget.
  Poštujemo `robots.txt` u potpunosti, uključujući pravilo iz RFC 9309 da nedostupan
  `robots.txt` (5xx ili mrežna greška) znači potpunu zabranu. Ako je `Disallow: /`, ne
  dohvatamo stranicu, nego isporučujemo djelimičan izvještaj iz sloja 0 i kažemo zašto.
- **Režim C, naš demo ili marketinški audit.** Kao B, samo strože: najviše 3 zahtjeva po
  sajtu.

Za sve režime: `Crawl-delay` se poštuje do 10 sekundi, najviše 1 zahtjev u sekundi po
hostu, najviše 20 zahtjeva po sajtu za jedan audit, `robots.txt` se kešira 24 sata. 4xx na
`robots.txt` znači slobodno (RFC 9309, 2.3.1.3), ali 429 se tretira kao 5xx, ne kao 4xx.

#### Telemetrija

Bez ovoga svaka procjena iznad ostaje procjena. Događaj za svaki neuspjeh, sa hostom,
klasom kvara, detektovanim WAF provajderom, detektovanim CMS-om, slojem na kojem je
kaskada stala i konačnim ishodom. Poslije mjesec dana stvarnog saobraćaja imamo tačne
brojke za našu publiku umjesto industrijskih prosjeka, i procjena od 12 do 20 posto se
zamjenjuje mjerenjem.

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

Crawl, PageSpeed, CrUX, Wayback, Search Console, pisanje po tuđem sajtu, PDF, Stripe.
Sve to ima svoje mjesto u kasnijim fazama i ništa od toga ne smije "usput" ući.

Render JavaScripta je izuzetak koji je ranije ovdje pisao kao zabrana, a u
`31-build-plan.md` je oduvijek bio dio B2. Ispravljeno: headless sloj postoji u fazi 1,
ali samo kao **uslovna** eskalacija po pravilima iz kaskade, nikad kao podrazumijevana
putanja. Sloj 3 (PSI, CrUX, Wayback) ostaje van faze 1.
