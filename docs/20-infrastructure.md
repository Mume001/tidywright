# Infrastruktura i hosting

Gdje šta radi, na kojem serveru, koliko košta, i kako se postavlja. Tri stepenice
(A, B, C) koje prate rast, s tačnim Hetzner tipovima i cijenama iz septembra 2026
(Hetzner je promijenio cjenovnik u junu 2026, pa stari članci na netu ne važe).

## Načelo

Web (Next.js) ide tamo gdje se najlakše deploya. Radnik (crawl, provjere, model) ide na
Hetzner jer je crawl dug, memorijski težak i ne pripada serverless okruženju gdje se
plaća po sekundi i ubija poslije 60 s. Baza je Supabase dok ne pređemo stepenicu B.
Ispred svega stoji Cloudflare.

## Šta gdje živi

| Komponenta | Gdje | Zašto |
|---|---|---|
| tidywright.com (marketing) | Cloudflare Pages ili Vercel Hobby | statičan, besplatno |
| app.tidywright.com (Next.js) | Vercel Pro (20 $) ili Hetzner s Coolify | vidi izbor dolje |
| siteauditserver.com (embed, izvještaji) | isti Next.js deploy, druga domena | jedna aplikacija, `middleware` bira temu po hostu |
| API rute | u Next.js | isti deploy |
| Radnik (pg-boss consumer) | Hetzner Cloud, Nürnberg ili Falkenstein | Docker kontejner, Coolify ili Kamal |
| Playwright render | isti radnik, poseban kontejner s limitom memorije | izolacija |
| Gotenberg (PDF) | isti Hetzner server, kontejner | faza 2 |
| Postgres, Auth, Storage | Supabase, region Frankfurt (eu-central-1) | blizu Hetznera, ~5 ms |
| Email | Resend | vidi `26-email.md` |
| DNS, CDN, WAF, Turnstile | Cloudflare | |
| Backup Storage objekata | Hetzner Storage Box BX11 (3,81 €) plus Backblaze B2 | dva mjesta, dva dobavljača |

### Vercel ili vlastiti server za Next.js

| | Vercel Pro | Hetzner + Coolify |
|---|---|---|
| Cijena start | 20 $ mjesečno po članu | 0 dodatno, isti server kao radnik |
| Deploy | git push, gotovo | git push, Coolify gradi, 2 do 4 min |
| Edge, ISR, image opt | uključeno | ručno ili isključeno |
| Rizik računa | egress i funkcije mogu rasti s prometom embed obrazaca | fiksna cijena |
| Rizik nas | nikakav | mi smo dežurni |

**Odluka:** Faza 1 na Vercel Pro zbog brzine. Embed skripta i statični dijelovi se
keširaju na Cloudflareu, pa Vercel funkcije rade samo API i izvještaje. Ako Vercel račun
pređe 100 $ mjesečno, Next.js se seli na Hetzner pored radnika (Docker slika već postoji
jer radnik ima istu).

## Tri stepenice

### Stepenica A: do 1.000 agencija (faza 1 i 2)

| Stavka | Tip | Cijena mjesečno |
|---|---|---|
| Radnik + Gotenberg + Coolify | Hetzner CX33 (4 vCPU, 8 GB, 80 GB) | 8,49 € |
| Supabase Pro | Micro compute uključen | 25 $ |
| Vercel Pro | | 20 $ |
| Cloudflare | Free, plus Pro za siteauditserver.com | 0 do 20 $ |
| Resend | Free do 3.000 emailova, pa Pro | 0 do 20 $ |
| Storage Box BX11 (backup) | | 3,81 € |
| Sentry, Axiom, Grafana, Better Stack | free tier | 0 |
| **Ukupno** | | **oko 32 € plus 45 do 85 $, oko 90 do 130 $** |

Kapacitet: CX33 s 4 vCPU radi 60 do 100 audita istovremeno, više nego što 1.000
agencija ikad pošalje u isto vrijeme.

### Stepenica B: do 10.000 agencija (faza 3 u toku)

| Stavka | Tip | Cijena mjesečno |
|---|---|---|
| Radnik 1 (auditi) | CX43 (8 vCPU, 16 GB) | 15,99 € |
| Radnik 2 (crawl faze 3, Playwright) | CX43 | 15,99 € |
| Coolify + Gotenberg + alati | CX23 (2 vCPU, 4 GB) | 5,49 € |
| Load balancer (ako Next.js dođe na Hetzner) | LB11 | 7,49 € |
| Object Storage (snimci, PDF) | Hetzner, 1 TB uključen | 6,49 € |
| Private network, firewall, snapshots | | ~5 € |
| Supabase Pro, Large compute | | 25 + 110 $ |
| Supabase PITR | | 100 $ |
| Vercel Pro | | 20 do 80 $ |
| Cloudflare Pro | | 20 $ |
| Resend Pro | 50.000 emailova | 20 do 90 $ |
| **Ukupno** | | **oko 60 € plus 300 do 400 $, oko 420 $** |

Ranija procjena od 117 € za Hetzner dio je uključivala i CAX31 za bazu; ovdje je baza
još na Supabase, pa je Hetzner dio manji, a Supabase veći.

### Stepenica C: 100.000 agencija (cilj plana)

Ovdje se baza seli na Hetzner jer Supabase 2XL (410 $) plus PITR i egress prelazi
1.000 $ mjesečno, a dedicated server s NVMe radi isti posao za 100 €.

| Stavka | Tip | Cijena mjesečno |
|---|---|---|
| Postgres primarni | AX42 dedicated (Ryzen 7 PRO 8700GE, 64 GB ECC, 2×512 GB NVMe) | 97,30 € (plus jednokratno postavljanje) |
| Postgres replika (standby, čitanje) | AX42 | 97,30 € |
| Radnici auditi × 3 | CX53 (16 vCPU, 32 GB) | 3 × 29,49 € |
| Radnici crawl/Playwright × 2 | CX53 | 2 × 29,49 € |
| Next.js × 2 (ako više nije Vercel) | CX43 | 2 × 15,99 € |
| Load balancer | LB21 | 14,49 € |
| Object Storage | 5 TB | ~30 € |
| Storage Box BX21 | 5 TB backup | 12,10 € |
| Private network, floating IP, snapshots | | ~15 € |
| Supabase Auth ostaje (Pro) | | 25 $ |
| Cloudflare Pro + for SaaS | | 20 $ + 0,10 $ po custom domeni preko 100 |
| Resend Scale | 100.000 plus po agencijskoj domeni | 90 do 300 $ |
| Sentry Team, Axiom Team, Better Stack | | ~100 $ |
| **Ukupno** | | **oko 460 € plus 250 do 450 $, oko 800 do 950 $** |

Na 100.000 registrovanih s 15% aktivnih to je ispod 0,07 $ po aktivnoj agenciji
mjesečno. Prihod po aktivnoj plaćenoj je 39 $. Infrastruktura nikad nije problem u
ovom poslu, prodaja jeste.

## Hetzner: šta treba znati

- **Lokacija:** Nürnberg (nbg1) ili Falkenstein (fsn1). Isti data centar za sve naše
  servere jer je privatna mreža besplatna samo unutar lokacije. Frankfurt Supabase je
  na 5 do 8 ms.
- **CX linija (Intel/AMD shared)** je najjeftinija po vCPU. **CAX (ARM Ampere)** je
  jeftiniji po jezgru ali Playwright i neki npm paketi na ARM-u znaju zapeti, pa ARM
  samo za bazu ako ikad. **CCX (dedicated vCPU)** je 2 do 3 puta skuplji, ne treba nam
  dok radnici ne budu stalno na 80%.
- **Portovi 25 i 465 su blokirani** na novim cloud nalozima. Zato se email ne šalje sa
  servera nego kroz Resend API (port 443). Ne tražiti otključavanje.
- **Hetzner IP opsezi Cloudflare često izaziva.** Kad naš radnik dohvaća tuđe sajtove iza
  Cloudflarea, dio će vratiti 403 ili challenge. Plan: pristojan `User-Agent`
  (`TidywrightBot/1.0 (+https://tidywright.com/bot)`), poštovanje `robots.txt`, retry s
  Playwrightom, pa `failed:blocked` s porukom posjetiocu. Za fazu 3 (sajt klijenta) se
  klijenta uputi da doda naš UA u dozvoljene. Ne kupujemo proxy mrežu.
- **Firewall** kroz Hetzner Cloud Firewall: ulaz samo 22 (samo s naše IP liste), 80, 443
  (samo Cloudflare IP opsezi). Sve ostalo zatvoreno. Radnik nema ni 80 ni 443, samo
  odlazni promet.
- **Snapshots** 0,0119 €/GB mjesečno, sedmični snimak Coolify servera.
- **Backup opcija** servera je 20% cijene servera, uključiti na serveru s bazom u
  stepenici C. Nije zamjena za `pg_dump` na drugi dobavljač.
- **Nema managed Postgres.** Kad pređemo na Hetzner bazu, mi smo DBA. Za to je plan u
  `25-observability-and-ops.md` (backup, restore vježba, Patroni tek ako treba failover
  bez ruku).
- **Storage Box** je jeftin backup cilj s SFTP i restic podrškom.

## Postavljanje servera, korak po korak (stepenica A)

1. Hetzner Cloud projekat `tidywright-prod`, SSH ključ dodan, API token za Coolify.
2. Server CX33, Ubuntu 24.04, lokacija nbg1, privatna mreža `tw-net` 10.0.0.0/16,
   firewall `tw-fw` (22 s naše IP, 80/443 s Cloudflare opsega).
3. Prvi login: novi korisnik `deploy` s sudo, ključ, `PasswordAuthentication no`,
   `unattended-upgrades` uključen, `fail2ban`, vremenska zona UTC.
4. Coolify instalacija jednom komandom (`curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash`).
   Coolify UI iza Cloudflare Access (samo naš email), ne na javnoj IP.
5. U Coolify: Git izvor (GitHub App), aplikacija `worker` iz `apps/worker/Dockerfile`,
   env varijable iz Coolify secreta, health check na `/healthz`, restart uvijek.
6. Servis `gotenberg` iz zvanične slike, samo na privatnoj mreži, limit 1 GB RAM.
7. Cloudflare: DNS A zapis na server samo za Coolify hostname (proxy uključen), radnik
   nema DNS.
8. Backup: `restic` cron svaku noć za Coolify volumene na Storage Box, provjera restora
   jednom mjesečno.
9. Nadzor: Better Stack heartbeat koji radnik pinga svakih 60 s, Sentry DSN u env,
   Axiom za logove kroz `pino` transport.

Stepenica B dodaje servere u istu privatnu mrežu i Coolify ih vidi kao dodatne
destinacije. Stepenica C je zaseban runbook koji pišemo kad dođe, jer će se detalji
(Hetzner tipovi, Postgres verzija) do tada promijeniti.

## Cloudflare postavke

| Domena | Plan | Zašto |
|---|---|---|
| tidywright.com | Free | marketing, app; Bot Fight Mode ne smeta prijavljenim korisnicima |
| siteauditserver.com | Pro (20 $) | embed obrazac i iframe primaju promet s tuđih sajtova; na Free planu Bot Fight Mode ne može da se isključi po ruti i blokira dio posjetilaca u iframeu; Pro daje WAF pravila po ruti, Page Rules, i bolje keširanje |

Zajedničke postavke:
- SSL Full (strict), origin cert od Cloudflarea na serveru, HSTS uključen poslije mjesec
  dana.
- Cache: `/embed.js` i `/embed/v1/*` s `Cache-Control: public, max-age=31536000,
  immutable` (verzija u putanji), ostalo ne keširati.
- Rate limiting pravila: `POST /api/v1/audits` 10 po minuti po IP, `/e/*` 60 po minuti
  po IP.
- Turnstile widget za obrazac, Managed mod, jedan widget po planu (Free plan Turnstile
  ima limit 10 hostnamea po widgetu, mi koristimo naš hostname jer obrazac je u iframeu
  s našeg domena, pa je to jedan hostname).
- Cloudflare Access ispred Coolify i admin ruta `/admin/*` (dodatni sloj uz naš auth).
- R2 se koristi tek u stepenici C za selidbu sa Supabase Storage (nula egress).

## Okruženja

| Okruženje | Šta | Baza |
|---|---|---|
| `local` | Docker Compose: Postgres, Supabase CLI, Mailpit, radnik | lokalna |
| `staging` | Vercel preview + Hetzner CX23 radnik | zaseban Supabase projekat (Free) |
| `prod` | opisano gore | Supabase Pro |

Staging dobija svaki merge na `main`, prod dobija tag `vX.Y.Z`. Vidi
`25-observability-and-ops.md` za pipeline.

## Tajne i konfiguracija

- Sve tajne u Coolify (radnik) i Vercel (web) env, nikad u repozitoriju. Lokalno
  `.env.local` iz `.env.example` bez vrijednosti.
- Rotacija: Supabase service key, Stripe webhook secret, Resend API key, jednom godišnje
  ili na incident.
- Konvencija imena: `TW_` prefiks za naše, dobavljači svoje (`STRIPE_SECRET_KEY`).

## Šta se ne radi

- Kubernetes. Ne u ovom planu ni na stepenici C, Coolify plus Docker Compose je dovoljno
  za 10 servera.
- Više regija. Sve u Njemačkoj. Posjetilac iz SAD čeka 100 ms više na izvještaj koji se
  ionako pravi 10 sekundi.
- Vlastiti SMTP.
- Vlastiti proxy pool za crawl.
