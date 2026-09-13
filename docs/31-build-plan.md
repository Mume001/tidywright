# Plan gradnje, frontend prvo

Redoslijed kojim Claude Code gradi. Zamjenjuje tabelu miljokaza iz `13-widget-spec.md`
(M1 do M6 tamo ostaju kao opis šta faza 1 sadrži, ovaj dokument kaže kojim redom).

## Zašto frontend prvo

1. Ekran se vidi. Mume može reći "ovo nije to" poslije dva dana, ne poslije šest sedmica.
2. Svaki ekran s mock podacima definiše tačno koje podatke backend mora dati. API se
   piše prema ekranu, ne obrnuto.
3. Storybook s četiri stanja po ekranu je istovremeno dizajn pregled, test i
   dokumentacija.
4. Backend faze 1 je manji od frontenda (jedan radnik, deset ruta). Kad frontend stoji,
   backend se ubacuje ekran po ekran.

Pravilo: **ništa u backendu dok svi ekrani faze 1 nemaju Loading, Empty, Error, Default
priču i dok ih Mume nije pregledao.**

## Miljokazi

Svaki miljokaz je jedan PR ili nekoliko malih. Kolona "gotovo kad" je test koji Mume
radi ručno. Procjene su za 20 sati sedmično.

### F0: temelj (3 do 4 dana)

| Šta | Detalj |
|---|---|
| Monorepo | pnpm workspaces, Turborepo; `apps/web`, `apps/worker`, `packages/ui`, `packages/shared`, `packages/checks`, `packages/crawler`, `packages/fixes`, `packages/email`, `db/` |
| Alati | TypeScript strict, ESLint (plus naša pravila), Prettier, Vitest, Storybook 9, Playwright, Husky + lint-staged, gitleaks |
| Next.js 16 | App Router, `next/font` lokalni fontovi, Tailwind 4 s `@theme` tokenima iz `27-design-system.md` |
| Dizajn sistem | sve komponente iz `27-design-system.md` u `packages/ui` s pričama |
| Mock sloj | `packages/shared/mocks/`: 3 agencije, 200 leadova, 500 audita, 5 ključeva, generisano deterministički (seed 42); MSW handleri za sve rute iz `17-backend-spec.md` |
| CI | `ci.yml` iz `25-observability-and-ops.md`, bez deploy koraka još |
| Gotovo kad | `pnpm storybook` otvori sve komponente, `pnpm test` zelen, CI zelen na PR |

### F1: embed i izvještaj, ekrani (4 do 5 dana)

| Šta | Detalj |
|---|---|
| `/e/[key]` | obrazac s 5 stanja, brendiranje iz mocka, Turnstile placeholder, postMessage resize |
| `/embed.js` | vanilla loader < 5 KB, iframe, resize, origin; test HTML stranica u `apps/web/public/test-embed.html` |
| `/a/[slug]` | hostovani obrazac |
| `/r/[token]` | izvještaj sa svim sekcijama: header, ScoreRing, 4 ScoreBar, 3 FixCard, blur + CTA, lista provjera, footer; stanja pending (s pollingom na mock), done, failed:fetch, failed:blocked, expired 410; `variant=score_only` |
| `/u/[token]` | odjava |
| Tema | `data-theme="report"`, boja agencije s kontrast računanjem |
| Gotovo kad | Mume otvori test-embed.html, pošalje obrazac, vidi mock izvještaj s tri popravke i Copy radi; na telefonu isto |

### F2: aplikacija, ekrani (6 do 8 dana)

| Šta | Detalj |
|---|---|
| Auth ekrani | `/login`, `/signup`, `/forgot`, `/reset`, `/verify` (UI samo, mock) |
| Onboarding | 3 koraka s Stepperom, embed kod, test audit dugme (mock) |
| Shell | sidebar, top bar, birač agencije, ⌘K, 404, error boundary |
| `/overview` | KPI kartice, graf 30 dana, zadnji leadovi, prazno stanje s uputstvom |
| `/leads`, `/leads/[id]` | DataTable s filterima, statusi, Sheet s detaljem, Timeline, bilješke |
| `/audits`, `/audits/[id]` | lista, detalj s ugrađenim izvještajem i tehničkim podacima (trošak vidi samo owner) |
| `/embed` | ključevi, kod, allowed origins, EmbedPreview uživo |
| `/branding` | obrazac, ColorPicker, FileUpload, živi pregled iframea |
| `/settings` | profil, notifikacije, zadržavanje, webhook (UI), izvoz (UI), brisanje |
| `/billing`, `/team` | UI s mockom, funkcionalnost u fazi 2, ali ekran postoji sada |
| Admin | `/admin/agencies`, `/admin/audits`, `/admin/costs`, `/admin/abuse`, `/admin/flags`, s mockom |
| Storybook | svaki ekran 4 priče, vizuelni snapshot |
| Gotovo kad | Mume prođe sve ekrane u Storybooku i u `next dev` s MSW, i potpiše "ovo gradimo" |

**Kontrolna tačka: pregled s Mumetom.** Sve ispravke dizajna se rade ovdje, prije
backenda.

### F3: marketing sajt (2 do 3 dana)

Naslovna, cijene, docs za ugradnju (6 platformi), legal stranice iz `legal/*.md`, bot,
changelog. Statičan. Može paralelno s B1 ako Mume piše tekstove.

### B1: baza, auth, brendiranje, ključevi (3 do 4 dana)

| Šta | Detalj |
|---|---|
| Supabase | projekat, Drizzle schema za faza 1 tabele iz `18-data-model.md`, migracija 0001, RLS politike, `audit_log` funkcija, trigger za JWT `agencies` |
| Auth | `@supabase/ssr`, `getClaims()`, email potvrda kroz Resend SMTP, reset, novi uređaj email |
| Rute | `agencies`, `branding`, `embed-keys`, `settings` iz `17-backend-spec.md`, zamjena MSW handlera pravim pozivima ekran po ekran |
| Storage | `branding` bucket, upload logotipa, SVG sanitizer |
| RLS test | prolazi za sve tabele |
| Gotovo kad | Mume se registruje na stagingu, prođe onboarding, promijeni boju, vidi je u `/e/[key]` (koji sad čita pravu bazu) |

### B2: radnik, provjere, ocjena (4 do 5 dana)

| Šta | Detalj |
|---|---|
| `packages/crawler` | `safeFetch` s cijelim SSRF obrascem, testovi na listi |
| `packages/checks` | 29 provjera iz `05-checks.md`, fixture HTML, testovi |
| Ocjena | težine, 4 grupe, `checks_catalog` seed |
| `apps/worker` | pg-boss, `audit.run` 12 koraka bez modela, Storage upis, `events` |
| CLI | `pnpm audit <url>` ispiše ocjenu i nalaze |
| Playwright | `audit.render` red, zaseban kontejner, samo za SPA detekciju |
| Gotovo kad | `pnpm audit https://adconnecta.com` daje ocjenu i nalaze koji se slažu s ručnim auditom od 12.09. |

### B3: popravke kroz model (2 do 3 dana)

| Šta | Detalj |
|---|---|
| `packages/fixes` | `FixGenerator` interfejs, dva dobavljača, structured output, validacija, filter, trošak, pragovi, circuit breaker |
| Izbor tri popravke | pravilo iz `13-widget-spec.md` |
| Gotovo kad | ista CLI komanda ispiše tri popravke, trošak ispod 0,01 $, 10 sajtova pregledano ručno i kvalitet ocijenjen |

### B4: API, izvještaj uživo, embed (3 do 4 dana)

| Šta | Detalj |
|---|---|
| Rute | `POST /api/v1/audits`, `/status`, `/embed/:key/config`, Turnstile verifikacija, limiti, dedup leada, kvota |
| Izvještaj | `/r/[token]` čita bazu i Storage, polling radi na pravom statusu, keš zaglavlja |
| Embed | origin provjera, CSP `frame-ancestors`, Cloudflare pravila na siteauditserver.com |
| Deploy | Vercel prod + Coolify radnik, `deploy-staging.yml`, `deploy-prod.yml`, health, heartbeat, Sentry, Axiom |
| Gotovo kad | audit pokrenut s tuđeg sajta (Mumetov test WordPress) otvori pravi izvještaj za manje od 20 s |

### B5: leadovi, emailovi, webhook, zaštita (3 do 4 dana)

| Šta | Detalj |
|---|---|
| Email | React Email šabloni, Resend, domene i DNS, suppressions, odjava, bounce webhook, zagrijavanje limiti |
| Leadovi | `/leads` rute, statusi, bilješke, `first_viewed_at`, `lead_new` email, digest job |
| Webhook agencije | HMAC, retry, `webhook_deliveries` |
| Zaštita | blocklist, auto pauza ključa, admin ekrani prave podatke, feature flags |
| Statistike | `stats.rollup`, `/overview` iz `stats_daily` |
| Retention | `retention.sweep`, brisanje leada, 410 |
| Gotovo kad | Mume dobije email o leadu, vidi ga u dashboardu, webhook stigne na webhook.site, obriše lead i izvještaj vrati 410 |

### B6: lansiranje besplatnog plana (1 sedmica)

Legal stranice žive, DPA, k6 test, mail-tester 10/10, security checklist iz
`22-security.md`, backup i restore vježba, status stranica, sintetički monitor, 5 pilot
agencija (AdConnecta prva), instrumentacija pilota iz `13-widget-spec.md`.

**Ukupno faza 1: 32 do 42 radna dana, na 20 h sedmično 8 do 10 sedmica.** Prvobitna
procjena od 4 do 6 sedmica je bila optimistična; frontend-prvo dodaje sedmicu ali
štedi više kasnije.

### Faza 2 (poslije prvih 50 aktivnih agencija)

| Miljokaz | Sadržaj | Dani |
|---|---|---|
| P1 Stripe | Checkout, webhook sync, entitlements, portal, dunning, `/billing` uživo | 4 |
| P2 Tim | pozivnice, uloge, `/team` uživo, audit log UI | 3 |
| P3 PDF | Gotenberg, `/r/[token]/pdf`, `pdfs` bucket | 2 |
| P4 Izvoz i webhook UI | CSV, JSON, Zapier dokumentacija | 2 |
| P5 Agencijska email domena | Resend domains API, DNS ekran, verifikacija, fallback | 3 |
| P6 Marketing | `/for-agencies`, `/compare/*`, Product Hunt | 3 |

### Faza 3 (poslije prihoda)

| Miljokaz | Sadržaj | Dani |
|---|---|---|
| S1 Ekrani | 8 dizajniranih ekrana s mockom, `/sites/new` wizard, portal klijenta | 8 |
| S2 Sajtovi i crawl | verifikacija, crawl 500, `pages`, `findings`, fingerprint | 6 |
| S3 Popravke i red | generisanje s kontekstom, `fixes` stanja, odobravanje, snimak | 5 |
| S4 WordPress plugin | zaseban repo, PHP, REST, HMAC, update server, 5 SEO plugina | 8 |
| S5 GitHub App | mapiranje, `createCommitOnBranch`, PR, revert | 5 |
| S6 Patch izvoz | Markdown, JSON, ZIP | 2 |
| S7 GSC | OAuth, verifikacija scope-a (podnijeti na početku S1), sync, `gsc_daily`, grafovi | 5 |
| S8 Client uloga | pozivnice, `site_members`, odobravanje, MFA za ownera | 3 |

## Šta Claude Code radi na početku svake sesije

1. Pročita `CLAUDE.md`, `STATUS.md`, i miljokaz na kojem je.
2. Otvori dokumente na koje miljokaz pokazuje. Ne gradi ništa što tamo ne piše.
3. Napravi granu `feat/<miljokaz>-<kratko>`, radi, testovi, PR.
4. Na kraju sesije: `STATUS.md` (miljokaz, šta radi, šta ne), nova pitanja u
   `11-open-questions.md`.

## Definicija "gotovo" za bilo koji PR

- lint, typecheck, test, build zeleni
- nova ruta ima test, nova komponenta ima priču, nova tabela ima RLS politiku i RLS
  test
- nema `TODO` bez linka na pitanje u `11-open-questions.md`
- nema tajni, nema `console.log`
- `STATUS.md` ažuriran ako je miljokaz završen
