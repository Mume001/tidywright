# Gdje smo

Zadnja izmjena: 15. septembar 2026. (F1 spojen, backlog pretočen, odluke 0010 i 0011)

## Faza 1 je OTVORENA: gradnja widgeta

## Urađeno

- [x] Ručni audit stvarnog sajta (adconnecta.com) kao dokaz da jezgro radi
- [x] Istraživanje konkurencije, 7 proizvoda u kategoriji, `docs/02-market.md`
- [x] Troškovna analiza, provjerene cijene svih API-ja, `docs/03-economics.md`
- [x] Finansijski model, tri scenarija kroz 24 mjeseca, `model/`
- [x] Dizajn osam ekrana aplikacije, `design/`
- [x] Istraživanje kanala, 8 agenata, `docs/12-channel-research.md`
- [x] Četiri odluke zapisane u `decisions/`, uključujući prvi kanal

## Odlučeno u ovoj sesiji

- Prvi kanal: widget za audit s prikazom popravki, `decisions/0004`
- Opseg widgeta: tri gotove popravke, ocjena sa četiri podocjene, bez PageSpeeda, jedna
  stranica, `decisions/0005`
- Stack: Next.js, Supabase, zaseban radnik, `decisions/0006`
- Specifikacija za gradnju: `docs/13-widget-spec.md`
- Ime i domene: Tidywright, `decisions/0007`

## Urađeno 13. i 14.09. (noćna sesija, 19 novih dokumenata)

- [x] Mapa proizvoda, svaka ruta i ekran, matrica dozvola, API i poslovi
- [x] Model podataka za sve faze, izbor baze objašnjen, infrastruktura na Hetzneru u
      tri stepenice s cijenama, kapacitet za 100.000 agencija
- [x] Sigurnost, GDPR, naplata, nadzor i deploy, email, dizajn sistem, marketing sajt,
      faza 3 konektori, testiranje, plan gradnje, rječnik
- [x] Drugo dizajn platno: ekrani faze 1 (obrazac, izvještaj, dashboard, onboarding)
- [x] Promptovi za model napisani doslovno, s validacijom i test setom (`docs/33`)
- [x] Katalog provjera proširen sa 29 na **176**, od toga 174 radi u widgetu bez crawla
      i 68 posto dolazi s gotovom popravkom (`docs/05-checks.md`, generisan iz koda)
- [x] Ocjena prepravljena: deset grupa s težinama, grupa se ocjenjuje samo po
      provjerama koje su radile (`packages/shared/src/score.ts`)
- [x] Šest filtera nad izlazom modela: injection, izmišljene činjenice, spam, AI trag,
      generičnost, duplikat (`fix-guard.ts`, `specificity.ts`)
- [x] Pet od šest otvorenih pitanja zatvoreno odlukom `0008`

## F0 je GOTOV

Monorepo, dizajn sistem i mock podaci stoje. Provjereno prije commita: format, lint,
tipovi, testovi i buildovi prolaze, Storybook se builda.

- pnpm workspaces plus Turborepo, TypeScript 6.0.3 (ne 7, jer `typescript-eslint` još
  ne podržava 7), ESLint s tri naša pravila, Prettier, husky, gitleaks, GitHub Actions
- `packages/shared`: tipovi iz `18-data-model`, `PLANS` kao jedini izvor istine za
  cijene i limite, katalog od 29 provjera, i generator mock podataka sa seedom 42
  (3 agencije, 200 leadova, 500 audita; svako stanje je dostupno u pričama)
- `packages/ui`: tokeni za obje teme na istim imenima, 15 komponenti s pričama
- `apps/web`: Next.js 16, fontovi iz npm-a (ništa ne ide Googleu), `proxy.ts` dijeli
  domene, kontrast boje agencije se računa na serveru

Odstupanja od plana, oba namjerna: Storybook 10 umjesto 9 (verzija 9 više nije
aktuelna), i TypeScript 6 umjesto 7 zbog `typescript-eslint`.

## F1 je GOTOV

Prihvaćen 15.09.2026. i spojen u `master`. Dvanaest commita, jedan po cjelini. Sve na mock
podacima, bez ijednog reda pravog backenda.

### Šta radi

- **`/e/[key]`**, obrazac u iframeu, pet stanja iz `docs/15` 1.2. Svako stanje ima priču
  u Storybooku.
- **`/embed.js`** plus **`/embed/v1/frame.js`**. Promjenjivi kanal s kešom od 5 minuta
  učitava nepromjenjivi fajl s godišnjim kešom. **2,9 KB gzip za oba**, budžet je 5 KB.
  Bez kolačića, bez čitanja stranice domaćina, bez fontova, bez zavisnosti.
- **`/a/[slug]`**, hostovani obrazac, isti karton na cijeloj stranici.
- **`/r/[token]`**, izvještaj po rasporedu od pet redova iz `docs/15`: ocjena i deset
  traka, tri popravke otvorene, "Fix this first", zamućeni ostatak s pozivom agencije,
  pa sve provjere sklopljene. Stanja: pending s pravim pollingom, done, failed:fetch,
  failed:blocked, expired **s pravim HTTP 410**, i `variant=score_only`.
- **`/u/[token]`**, odjava.
- **`public/test-embed.html`**, lažni sajt agencije s ugrađenim obrascem i linkovima na
  svako stanje i svaku grešku.

### Šta ne radi i neće u F1

Nema baze, nema radnika, nema modela, nema Turnstilea (stoji kliktabilni placeholder),
nema emaila. Sve što `/api/mock/*` vrati dolazi iz `packages/shared/mocks`.

**Mock rute vraćaju 404 u produkciji** osim ako je `TW_ALLOW_MOCKS` postavljen.
Provjereno na produkcijskom buildu, u oba smjera.

### Provjereno, ne pretpostavljeno

Sve kroz Chrome protiv pokrenute aplikacije, s test stranicom na portu 4000 i
aplikacijom na 3000, dakle svaki skok prelazi granicu origina:

- div rezerviše 220 px prije nego što se išta učita, iframe se montira, poruka
  `tw:resize` ga raste na 500 px i prati karticu kroz stanja
- obrazac poslan, polling prošao kroz queued, stigao na done, dao link `target=_blank`
  na izvještaj na našem originu, izvještaj se otvorio
- izvještaj koji čeka sam pređe u gotov bez osvježavanja, polling na 2 s
- izvještaj koji nikad ne završi stane poslije 60 s i obeća email
- Copy stavi prijedlog na clipboard, ne staru vrijednost
- `/r/demo-expired` vraća **410 Gone** s punom brendiranom stranicom u tijelu
- ništa se ne pomjera bočno na 360 px, ni na jednom stanju
- **axe: nijedan ozbiljan ni kritičan prekršaj** ni na jednoj posjetilačkoj stranici, ni
  na 1280 ni na 360 px. Krenulo je od 48.
- `prefers-reduced-motion` gasi i prsten i spinner
- na `/e/` nema `X-Frame-Options` ni `frame-ancestors`, što je ono što uopšte dozvoljava
  ugradnju na tuđu domenu

### Dvije greške koje je ova provjera našla

1. Next daje rutama i server komponentama **zasebne instance modula**, pa audit napravljen
   kroz `POST /api/mock/audits` nije postojao u memoriji stranice koja renderuje
   `/r/<token>`, i svaki poslani izvještaj je vraćao 404. Stanje sada visi na
   `globalThis`. Isti obrazac će trebati svakom dijeljenom stanju u B4.
2. Boje ocjene su se koristile kao tekst. `#2E9E5B` na bijeloj je 3,4:1, a pilula
   "46 warnings" je bila 2,5:1. Traka smije biti 3:1, riječ mora 4,5:1, pa sada postoje
   `--color-score-*-ink` odvojeno od `--color-score-*`.

### Zatvoreno poslije prvog pregleda F1

**Pitanje 16, token za odjavu.** `leads` je dobio kolonu `unsubscribe_token`: 32
nasumična bajta kao base64url, jedinstveni indeks, nullable dok se ne pošalje prvi email.
Vlastita vrijednost, nikad izvedena iz `id`, jer link ide kroz tuđe mail servere i log
fajlove, pa ko ga ima ne smije time imati i primarni ključ reda. `/u/[token]` sada
razrješava po toj koloni i odbija `id`. `audits.token` je provjeren i već je bio zasebna
kolona, ali je mock pravio `id` iz tokena, pa je to popravljeno.

**Pitanje 17, neslaganja dokumenta i nacrta.** Zatvoreno odlukom `decisions/0009`:
**kad se dokument i nacrt ne slažu oko toga kako nešto izgleda, nacrt pobjeđuje i dokument
se ispravlja u istom PR-u.** Za činjenice (ime, brojka, pravilo pristupačnosti) pravilo ne
važi. Svih pet stavki razvrstano i ispravljeno u `docs/13`, `docs/15`, `docs/27`,
`docs/32` i u dva nacrta. Kartica popravke ostaje jedno pored drugog, a provjereno je da
se slaže u kolonu ispod 768 px, na 360, 500, 767, 768 i 1280 px.

**Novo pravilo u `docs/27-design-system.md`:** boja za površinu i boja za tekst su
odvojeni tokeni. Traka mora 3:1, riječ mora 4,5:1, nikad isti token za oboje. Napisano
prije F2, jer F2 donosi tabele, značke statusa i KPI kartice, to jest mnogo malog
obojenog teksta, i ista greška se tamo ponavlja u jednom potezu.

## Urađeno 15.09. (pregled F1 pretočen u odluke i zadatke)

F1 je prihvaćen i grana `feat/f1-embed-and-report` je spojena u `master` sa `--no-ff`, pa
miljokaz stoji kao jedan čitljiv raspon u historiji. Poslije toga sedam commita, jedan po
tački, svaki uz pun krug provjera.

- [x] Četiri dokumenta iz istraživačkog prolaza zapisana kakvi jesu: `34-backlog.md` i tri
      istraživanja (`35` djelotvornost popravki, `36` pouzdanost dohvata, `37` self-serve
      segment). Svaka brojka u njima nosi izvor.
- [x] **Odluka `0010`**, tri stvari koje su bile odlučene ali nezapisane: poziv na akciju
      u agencijinom izvještaju ostaje agencijin, ne guramo vlastitu vidljivost kroz
      kupčeve sajtove, i ne obećavamo rang ni promet nego izvršene ispravke i izmjerene
      tehničke ishode u prozoru od 90 dana.
- [x] **Preduslov za B2** u `31-build-plan.md`: deklarišemo se Cloudflareu kao kategorija
      **SEO**, nikad Agent ni Training, i prijavljujemo se u Verified Bots sa Web Bot Auth
      potpisom. Identitet agenta i granica koju ne prelazimo su u `22-security.md`.
- [x] **Kaskada dohvata** u `17-backend-spec.md` kao obaveza za B2: jedanaest klasa kvara,
      četiri sloja, ponovni pokušaji, politika prema `robots.txt` u tri režima, i
      djelimičan izvještaj iz sloja 0 kad HTML nije dostupan.
- [x] **Oznaka uticaja po provjeri** u `05-checks.md` i u katalogu: `blokator`, `prikaz`,
      `kvalitet`, `higijena`. `prioritise()` sada vodi po uticaju puta ozbiljnost, ne po
      težini grupe. `pnpm docs:checks` regeneriše dokument iz koda.
- [x] **Pet novih pitanja** (19 do 23) u `11-open-questions.md`, plus pitanje 18 zatvoreno
      odlukom `0010`. **Sva su odgovorena istog dana, vidi ispod.**
- [x] Usput ispravljeno: `20-infrastructure.md` je imao stariji plan za Cloudflare,
      `17-backend-spec.md` je tvrdio da faza 1 ne renderuje JavaScript dok je `31` imao
      Playwright u B2, `18-data-model.md` je imao stari rječnik za `failure_code`, a
      `types.ts` ga je pratio u istom commitu po svom pravilu.

### Šta ostaje u backlogu i nije nigdje drugo

Tačka B, dizajn: podnožje izvještaja treba bolje izgledati, a `/a/[slug]` i marketinški
sajt trebaju ozbiljnije zaglavlje i burger meni na telefonu. To je posao za F2 i F3 i
stoji u `34-backlog.md`. Nije pitanje, nema šta da se odluči.

## Odluka `0011`: pet odgovora, istog dana

Mume je odgovorio na svih pet pitanja. Šest commita, jedan po tački, svaki uz pun krug
provjera. Sve je u `decisions/0011-pet-odgovora-nakon-pregleda-f1.md`.

| #   | Odgovor                                                                                                                                      | Gdje je upisano                                                                    |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1   | **Model podataka nosi oba oblika**, `agencies.kind` (`agency`, `solo`), solo ima tačno jedan sajt kroz ograničenje u bazi. **B1 odblokiran** | `18-data-model.md`, `31-build-plan.md` (B1), `16-access-control.md`                |
| 2   | **Nema trake za kolačiće u widgetu**, ali aplikacija i marketinški sajt dobijaju svoja pravila                                               | `23-compliance.md`, `15-frontend-spec.md`                                          |
| 3   | **Dvije odvojene kvačice pristanka**, druga neobavezna i neoznačena. Zasebna prijava na newsletter samo na našoj domeni                      | `18-data-model.md`, `15-frontend-spec.md`, `26-email.md`, `13-widget-spec.md`, kod |
| 4   | **Odjava ostaje jedan klik bez uslova.** Popust samo na otkazivanju pretplate, faza 2. Godišnji plan se nudi pri kupovini                    | `26-email.md`, `24-billing.md`                                                     |
| 5   | **Brend: tri sloja i nema četvrtog.** Posjetilac vidi agenciju, agencija vidi nas, dobavljači se ne vide nigdje                              | `27-design-system.md`, `29-phase3-connectors.md`                                   |
| 6   | **Ocjena se ne dira.** Zapisano kao zatvoreno pitanje 24, ne otvoreno, da se ne vuče kao dug                                                 | `11-open-questions.md`                                                             |

**Greška koju je tačka 3 otkrila:** `apps/web/components/audit-form.tsx` je slao
`consent_marketing: true` kao konstantu, dakle svi su bili prijavljeni na newsletter bez
pitanja. Popravljeno, i sada postoji test koji pada ako dva pristanka ikad krenu zajedno.

**Zadatak koji ostaje i može oboriti tačku 5:** prije B6 proći uslove korišćenja svakog
vanjskog servisa u lancu, jer neki traže vidljivo navođenje izvora.

### Snimci

`report-done-1280.png` i `report-done-paid-agency-1280.png` u `docs/review/f1/` su
obnovljeni. Promjena od `prioritise()` se vidi u redu "Fix this first": blokatori istiskuju
higijenu. Tri kartice popravki se **nisu** promijenile, jer ih u mocku pravi `buildFixes()`
kao fiksni set; izbor tri popravke po uticaju dolazi u B3.

`form-1-idle-*` i `form-x-field-errors-*` su takođe obnovljeni, na 1280 i 390 px, jer je
obrazac dobio drugu kvačicu. Na njima se vidi da je neobavezna kvačica neoznačena i da uz
nju nema greške kad se obrazac pošalje prazan, dok prva i dalje ima.

## Sljedeći korak

1. **Prijava u Cloudflare Verified Bots kreće odmah**, ne kad B2 dođe na red. Odobrenje
   traje od nekoliko sedmica do nekoliko mjeseci i nema SLA, a rok je prvi audit uživo.
   Vidi preduslov za B2 u `31-build-plan.md`.
2. **F2: aplikacija, ekrani** (6 do 8 dana po `31-build-plan.md`). Auth ekrani, onboarding
   u tri koraka, shell sa sidebarom i biračem agencije, `/overview`, `/leads`, `/audits`,
   `/embed`, `/branding`, `/settings`, `/billing`, `/team`, i pet admin ekrana. Svaki ekran
   četiri priče u Storybooku. **Gotovo kad Mume prođe sve ekrane i potpiše "ovo gradimo".**
3. Mume otvara naloge iz pitanja 15, redom kako trebaju.
4. Otvoreno je i dalje pravno lice za Stripe (pitanje 9), smjer je Estonija, treba do
   kraja F2.

Jedino otvoreno pitanje koje ostaje je **19, sekvenca kanala**, i ono ne čeka odluku nego
mjerenje: koliko posto ljudi koji dobiju besplatan izvještaj na našoj domeni poveže svoj
sajt, prag 25 posto. Mjerljivo tek poslije F3.

Za pokretanje lokalno: `corepack enable && pnpm install`, pa `pnpm dev`, pa
`http://localhost:3000/test-embed.html`. Za pravi test ugradnje, u drugom terminalu
`python3 -m http.server 4000 --directory apps/web/public` i otvori
`http://localhost:4000/test-embed.html`. `pnpm storybook` daje sva stanja bez klikanja.

## Miljokazi (iz `docs/31-build-plan.md`)

Frontend s mock podacima:

- [x] F0 monorepo, alati, dizajn sistem, mock sloj, CI
- [x] F1 embed obrazac, `/embed.js`, izvještaj sa svim stanjima
- [x] Kontrolna tačka: pregled s Mumetom, F1 prihvaćen i spojen u `master`
- [ ] F2 aplikacija: auth, onboarding, svi ekrani, admin, Storybook
- [ ] F3 marketing sajt

Backend:

- [ ] **Preduslov za B2, kreće odmah:** kategorija SEO prema Cloudflareu, `/bot` stranica,
      ekskluzivne izlazne adrese, Web Bot Auth, prijava u Verified Bots
- [ ] B1 Supabase, schema, RLS, auth, brendiranje, ključevi
- [ ] B2 radnik, safeFetch, katalog provjera, kaskada dohvata, ocjena, CLI
- [ ] B3 popravke kroz model
- [ ] B4 API, izvještaj uživo, embed, deploy
- [ ] B5 leadovi, emailovi, webhook, zaštita, statistike, retention
- [ ] B6 lansiranje besplatnog plana, pet pilot agencija

## Dnevnik

| Datum       | Šta se desilo                                                                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 12.09.2026. | Ideja nastala iz ručnog audita adconnecta.com                                                                                      |
| 12.09.2026. | Istraživanje konkurencije i troškova, dizajn ekrana                                                                                |
| 13.09.2026. | Finansijski model i tri scenarija, postavljen ovaj folder                                                                          |
| 13.09.2026. | Istraživanje kanala s 8 agenata, odluka: widget prvi                                                                               |
| 13.09.2026. | Opseg widgeta i stack odlučeni, specifikacija napisana, faza 1 otvorena                                                            |
| 13.09.2026. | Ime Tidywright, domene kupljene, folder i dizajn preimenovani                                                                      |
| 14.09.2026. | Noćna sesija: 19 dokumenata (14 do 32), plan gradnje frontend prvo, drugo dizajn platno                                            |
| 14.09.2026. | Promptovi modela (`docs/33`), odluka 0008 zatvara pet otvorenih pitanja                                                            |
| 14.09.2026. | F0 napravljen i verifikovan: monorepo, dizajn sistem, mock podaci, Next.js                                                         |
| 14.09.2026. | Katalog 29 -> 176 provjera, nova ocjena s težinama, šest filtera kvaliteta, 72 testa                                               |
| 14.09.2026. | F1: embed obrazac, loader od 2,9 KB, izvještaj sa svim stanjima, 156 testova                                                       |
| 14.09.2026. | Pregled F1 s Mumetom, primjedbe u `docs/34`, tri istraživanja (`35`, `36`, `37`)                                                   |
| 15.09.2026. | F1 spojen u master. Backlog pretočen: odluka 0010, preduslov za B2, kaskada dohvata, oznaka uticaja po provjeri, pet novih pitanja |
| 15.09.2026. | Odluka 0011: pet odgovora. Model podataka nosi oba oblika i B1 je odblokiran, dva pristanka umjesto jednog, brend u tri sloja      |
