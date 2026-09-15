# Faza 3: konektori i primjena popravki

Kako popravka iz našeg sistema završi u klijentovom CMS-u ili repozitoriju, trajno,
s snimkom i vraćanjem. Ovo je odluka 0001 u praksi. Piše se sad da faza 1 ne napravi
ništa što ovo kasnije blokira.

## Tri načina isporuke

| Način | Za koga | Kako piše | Rollback |
|---|---|---|---|
| WordPress plugin | 43% weba | plugin prima potpisan zahtjev, piše u `postmeta` SEO plugina ili u vlastite meta ključeve | plugin čuva prethodnu vrijednost, vraća na zahtjev |
| GitHub App | statični sajtovi, Next/Astro/Hugo, Shopify teme u gitu | PR s izmjenama u fajlovima | zatvori PR ili revert commit |
| Patch izvoz | sve ostalo (Wix, Squarespace, custom CMS) | ZIP ili tekst s tačnim "zamijeni X sa Y" po stranici, plus HTML snippeti | ručno, uz priložen "before" |

Shopify App nije u planu (odluka iz istraživanja kanala, tržište zasićeno; Shopify teme
u gitu pokriva GitHub konektor).

## WordPress plugin

### Šta plugin radi
- Registruje REST rutu `tidywright/v1/*` s vlastitom autentifikacijom (HMAC potpis
  našim tajnim ključem po sajtu, plus WordPress Application Password kao drugi sloj).
- `GET /status`: verzija WP, verzija plugina, koji SEO plugin je aktivan, broj
  objava, može li pisati.
- `GET /pages?ids=`: trenutni title, meta, canonical, JSON-LD za date objave (da
  potvrdimo "before" prije pisanja).
- `POST /apply`: lista promjena `{post_id, field, before, after}`; plugin provjerava da
  je `before` još uvijek trenutna vrijednost (inače odbije, "changed since audit"),
  piše, upisuje u vlastitu tabelu `wp_tidywright_log`, vraća rezultat.
- `POST /rollback`: po `log_id`, vraća prethodnu vrijednost.
- Ne dira teme, ne dira fajlove, ne dodaje JS na front. Samo `postmeta` i opcije.

### Gdje se šta piše, po SEO pluginu

| SEO plugin | Title | Meta description | Canonical | Napomena |
|---|---|---|---|---|
| Yoast | `_yoast_wpseo_title` | `_yoast_wpseo_metadesc` | `_yoast_wpseo_canonical` | postmeta |
| Rank Math | `rank_math_title` | `rank_math_description` | `rank_math_canonical_url` | postmeta |
| All in One SEO | tabela `wp_aioseo_posts`, kolone `title`, `description`, `canonical_url` | | | nije postmeta, vlastita tabela |
| SEOPress | `_seopress_titles_title` | `_seopress_titles_desc` | `_seopress_robots_canonical` | postmeta |
| The SEO Framework | `_genesis_title` | `_genesis_description` | `_genesis_canonical_uri` | nasljeđe Genesis ključeva |
| Nijedan | naši `_tidywright_title`, `_tidywright_desc` i plugin ih ispisuje kroz `wp_head` | | | tada naš plugin postaje mali SEO plugin |

JSON-LD: Yoast i Rank Math generišu vlastiti graf; naš plugin ne dira njihov nego dodaje
zaseban `<script type="application/ld+json">` samo za tipove koje oni ne pokrivaju
(npr. `Product`, `FAQPage` ako ih nema), s opcijom da se isključi. Rizik duplog
`Organization` se provjerava prije pisanja (plugin vrati postojeći JSON-LD u `/pages`).

Alt tekst slika: `_wp_attachment_image_alt` postmeta na attachmentu. H1 i sadržaj:
ne diramo u fazi 3 (rizično, uređivač klijenta), samo predlažemo u patch izvozu.

### Distribucija plugina
- **Ne ide na WordPress.org** u prvoj verziji: pregled traje sedmice, a `Update URI`
  zaglavlje u pluginu je uzajamno isključivo s .org (plugin s `Update URI` ne može u
  direktorij, i obrnuto). Za ranu fazu koristimo vlastiti update server: plugin ima
  `Update URI: https://tidywright.com/wp/update`, WordPress pita taj URL za novu
  verziju, mi vratimo JSON s `version`, `download_url`, `requires`, `tested`.
- Download ZIP iz app-a, po agenciji, s ugrađenim site tokenom (ili token se unosi u
  WP admin poslije instalacije, sigurnije, biramo to).
- Kasnije, ako direktorij postane kanal, zaseban "lite" plugin bez `Update URI`.

### Autentifikacija
- Pri dodavanju sajta u app-u: preuzmi plugin, instaliraj, u WP admin unesi token
  (`tw_site_...`) koji app prikaže. Plugin pozove naš `POST /api/v1/connections/handshake`
  s tokenom i svojim URL-om, mi vratimo tajni HMAC ključ, plugin ga sačuva u
  `wp_options` (šifrovan ako WP ima `AUTH_KEY` salt, što uvijek ima).
- Svaki naš zahtjev ka pluginu: `X-TW-Timestamp`, `X-TW-Signature = HMAC-SHA256(secret,
  timestamp + body)`, plugin odbija starije od 5 min i pogrešan potpis.
- Application Password kao fallback za `GET` čitanja kroz standardni WP REST ako plugin
  ne može biti instaliran (hostinzi koji zabranjuju), tada samo čitanje, nema pisanja.

## GitHub App

- GitHub App "Tidywright" s dozvolama `Contents: write`, `Pull requests: write`,
  `Metadata: read`. Instalira se na jedan repozitorij (klijent bira).
- Tok: crawl nalazi problem na `/about` → mapiranje URL → fajl (heuristika: Next.js
  `app/about/page.tsx`, Astro `src/pages/about.astro`, Hugo `content/about.md`, Jekyll
  `_pages/about.md`, plain `about.html`; klijent može ručno mapirati u app-u) →
  generišemo diff → `createCommitOnBranch` GraphQL mutacija (potpisani commit u ime
  App-a, bez git klona) na granu `tidywright/fix-<id>` → PR s opisom (šta, zašto, before/
  after, link na nalaz) → klijent merge-a.
- Nikad push na `main`. PR je odobrenje (odluka 0003).
- Rollback: revert PR, koji možemo otvoriti jednim klikom.
- Frameworks čija se meta gradi iz podataka (CMS headless) ne prolaze mapiranje; tada
  patch izvoz.

## Patch izvoz

- Za svaku popravku: stranica, element (CSS selektor i XPath), `before`, `after`, i
  gotov HTML snippet.
- Format: Markdown dokument po sajtu plus JSON, plus ZIP sa `.html` fajlovima ako je
  sajt statičan i klijent ga je uploadovao (rijetko).
- Klijentov developer to primijeni. Mi poslije 7 dana re-crawlamo i označimo šta je
  stvarno primijenjeno (`findings.resolved_at`).

## Dokaz vlasništva sajta

Prije ikakvog pisanja sajt mora biti verifikovan:
| Način | Kako |
|---|---|
| DNS TXT | `tidywright-verify=<token>` na domeni |
| HTML fajl | `/tidywright-<token>.html` |
| Meta tag | `<meta name="tidywright-verify" content="...">` na naslovnoj |
| GSC | ako je GSC povezan i property odgovara, verifikovano automatski |
| WordPress | instaliran plugin s tokenom je dokaz |

## Google Search Console

- OAuth scope `https://www.googleapis.com/auth/webmasters.readonly`. To je **osjetljiv
  scope**: Google traži verifikaciju aplikacije (privacy policy, homepage, video demo,
  objašnjenje), traje oko 10 radnih dana, i dok nije verifikovano radi samo za 100
  korisnika s upozorenjem "unverified app". Podnijeti zahtjev na početku faze 3, ne na
  kraju.
- Šta povlačimo: `searchanalytics.query` po danu, `page` i `query` dimenzije, 16 mjeseci
  unazad pri prvom sync-u, pa dnevno. Kvota 1.200 zahtjeva na minutu po projektu, nije
  problem.
- Refresh token šifrovan (envelope), vidi `22-security.md`.
- Koristi se za: dokaz efekta popravki (klikovi i pozicije po stranici prije i poslije),
  prioritet nalaza (stranice s impresijama prvo), i za verifikaciju vlasništva.

## Crawl faze 3

- Do 500 stranica po sajtu (limit plana), BFS od naslovne plus sitemap, poštovanje
  robots.txt, 2 istovremena zahtjeva po hostu, 500 ms pauza, `TidywrightBot`.
- Statični HTML prvo; Playwright render za stranice gdje statični nema sadržaja, ili
  za cijeli sajt ako klijent uključi "JS site".
- Rezultati u `pages`, `findings` s fingerprintom (isti problem = isti red).
- Ponovni crawl: ručno, sedmično ili mjesečno; diff u odnosu na prethodni pokazuje
  novo/riješeno.

## Generisanje popravki u fazi 3

Isti `FixGenerator` kao u fazi 1, ali s više konteksta: cijeli sajt (ostali naslovi da
se ne dupliraju), GSC upiti za stranicu (koje riječi ljudi kucaju), tip stranice. Izlaz
validiran: dužina, bez duplikata na sajtu, JSON-LD validan protiv schema.org tipova iz
naše dozvoljene liste (`Organization`, `LocalBusiness`, `Product`, `Article`, `FAQPage`,
`BreadcrumbList`, `WebSite`), bez URL-ova van domene.

## Snimak i vraćanje

- Prije svake primjene: `fix_applications.snapshot_path` sa `before` vrijednostima svih
  polja koje diramo, plus screenshot stranice (Playwright) za vizuelnu potvrdu.
- Rollback dugme radi 90 dana, poziva konektor s `before`, provjerava da je trenutno
  stanje jednako našem `after` (inače upozorenje "changed since, roll back anyway?").
- Sve u `audit_log` s ko je odobrio i ko je primijenio.

## Brend na kupčevom sajtu i u lancu dobavljača

Odluka `0011`, tačka 5. Tri sloja i nema četvrtog, vidi `docs/27-design-system.md`. Faza 3
je jedino mjesto gdje naš kod piše po tuđem sajtu, pa je pravilo ovdje strože i
konkretnije.

**Šta plugin i konektori ne smiju upisati na kupčev sajt:**

- Nikakav vidljiv trag našeg brenda. Ni komentar u HTML-u, ni `<meta generator>`, ni
  klasa u markupu, ni ime u `wp_head`.
- Nikakav link prema nama. To je već zabranjeno odlukom `0010`, tačka 2, i tamo je razlog:
  shema linkova po Googleovim pravilima o spamu, sa kaznom i za kupca.
- Nikakvo ime dobavljača. Tekst popravke koji je napisao model ne spominje model, ni u
  sadržaju ni u komentaru uz izmjenu.

**Šta smije, i mora, ostati:** trag u `wp_tidywright_log` i u našem `audit_log`, jer bez
njega nema vraćanja unazad i nema odgovora na pitanje ko je šta promijenio. To je zapis u
bazi, ne oznaka na stranici.

**Ime plugina je izuzetak koji nije izuzetak.** Plugin se u WordPress admin listi zove
Tidywright, jer ga instalira agencija ili vlasnik, dakle drugi sloj, gdje je naš brend na
mjestu. Posjetilac sajta ga ne vidi nigdje.

**Zadatak prije B6, i može oboriti treći red pravila:** proći uslove korišćenja svakog
vanjskog servisa u lancu (model, hosting, Turnstile, email, i sve iz liste podobrađivača u
`docs/23-compliance.md`). Neki traže vidljivo navođenje izvora. Ako neki od naših to
traži, ugovor pobjeđuje pravilo, i tada se mijenja dobavljač, ne pravilo.

## Šta faza 1 mora ostaviti spremno

- `audits.site_id` nullable kolona postoji od početka.
- `FixGenerator` prima opcioni kontekst sajta.
- `safeFetch` i crawler su u `packages/crawler`, ne u radniku, da ih faza 3 proširi.
- `fixes` shema (kind, before, after, state) je ista koju widget koristi za svoje tri
  popravke, samo bez `state` toka.
