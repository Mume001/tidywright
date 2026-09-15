# Specifikacija frontenda

Svaka ruta, svaki ekran, svaka sekcija, svako dugme, i svako stanje. Frontend se gradi
prvi, s lažnim podacima (mock), i tek kad svaki ekran postoji i izgleda kako treba,
backend se spaja ispod. Razlog: dok se ne zna gdje koje dugme stoji, ne zna se ni koji
podatak treba, pa ni koji API.

Konvencije u ovom dokumentu:

- **Stanja** koja svaki ekran s podacima mora imati: `loading`, `empty` (nema podataka,
  s uputstvom šta da se uradi), `error` (s dugmetom pokušaj ponovo), `ready`.
- **Događaji** su imena za analitiku, u tabeli `events`.
- **Ko vidi** se odnosi na uloge iz `16-access-control.md`.
- Sve što piše korisniku je na engleskom. Tekstovi u ovom dokumentu su prijedlog, ne
  konačni.

## Raspored izvještaja kad ima 174 nalaza

Katalog je narastao sa 29 na 174 provjere (`05-checks.md`). To mijenja stranicu
izvještaja, jer lista od 174 reda je zid teksta kroz koji niko ne prolazi. Raspored je
obavezan i ide odozgo:

| Red | Šta | Zašto tu |
|---|---|---|
| 1 | Prsten ocjene, deset traka po grupama, jedna rečenica šta je najveći problem | broj prvo, objašnjenje odmah uz njega |
| 2 | Tri gotove popravke, otvorene | ovo je proizvod, ne smije biti ispod pregiba |
| 3 | "Prvo popravi ovo": šest nalaza iz `summary.priority` | odgovara na jedino pitanje koje posjetilac ima |
| 4 | Zamućeni ostatak plus CTA agencije | ovdje se lead pretvara u razgovor |
| 5 | Sve provjere, grupisane, **sklopljene** | dubina za onoga ko je hoće |

Pravila za peti red:
- Grupe su sklopljene po defaultu, s brojem u zaglavlju ("Speed, 4 od 16 palo").
- Grupa u kojoj je sve prošlo prikazuje samo zelenu liniju, bez rasklapanja.
- Unutar grupe redoslijed je: palo, upozorenje, prošlo. Prošlo ide na dno i sivo je.
- Provjera koja nije radila (nema slika na stranici) se ne prikazuje uopšte, ne
  prikazuje se kao prošla. Lažno zeleno je gore od ničega.
- Iznad liste stoji prekidač "Prikaži samo probleme", uključen po defaultu.

Deset traka umjesto četiri: dvije kolone po pet na desktopu, jedna kolona na telefonu.
Svaka traka ima ime grupe, broj, i rečenicu iz `GROUP_INTROS` ispod, jer "Accessibility
44" nikome ne znači ništa bez te rečenice.

PDF izvještaj (faza 2) je jedini gdje se sve rasklapa, jer se PDF štampa i prosljeđuje.

## 0. Dizajn sistem, kratko

Detalji u `27-design-system.md`. Ovdje samo šta frontend koristi:

- Stack: Next.js 16 App Router, TypeScript, Tailwind CSS 4, shadcn/ui (Base UI verzija),
  TanStack Table 9 i Query 5, react-hook-form 7 sa zod 4, Recharts 3 kroz shadcn charts,
  next-intl s jednim `en` fajlom od prvog dana.
- Tema aplikacije je tamna, iz `design/`. Izvještaj i marketing su svijetli, jer ih
  gledaju ljudi kojima nismo mi brend.
- Layout aplikacije: lijeva navigacija 232 px, gornja traka 60 px, sadržaj s paddingom
  24 px. Tačno kao na osam dizajniranih ekrana.
- Minimalna širina koju aplikacija podržava: 1024 px. Ispod toga se prikazuje poruka da
  se koristi veći ekran. Izvještaj i obrazac moraju raditi na 360 px.

---

## 1. Embed i obrazac (siteauditserver.com)

### 1.1 Skripta `/embed.js`

Nije ekran, ali ima ugovor:

```html
<script src="https://siteauditserver.com/embed.js" data-key="pk_live_..." async></script>
<div id="tw-audit"></div>
```

- Traži `div#tw-audit` (ili `data-target` selektor). Ako ga nema, ne radi ništa i upiše
  jednu poruku u konzolu.
- Ubaci `<iframe src="https://siteauditserver.com/e/<key>?mode=inline&host=<hostname>">`
  u div, širina 100 posto, visina se podešava porukama iz iframea (postMessage
  `tw:resize`).
- Rezerviše prostor unaprijed (`min-height: 220px`) da ne pomjera sadržaj sajta agencije.
- Ne postavlja kolačiće, ne čita ništa sa stranice domaćina, ne učitava fontove.
- Veličina: ispod 5 KB gzip. Bez frameworka.
- Verzionisanje: `/embed.js` je promjenjiv kanal s kratkim kešom (5 minuta), učitava
  `/embed/<verzija>/frame.js` koji je nepromjenjiv s godišnjim kešom.

### 1.2 Obrazac u iframeu `/e/[key]`

Jedna stranica, pet stanja. Stil iz brendiranja agencije: boja dugmeta, tekst poziva.

| Stanje | Šta se vidi | Akcije |
|---|---|---|
| `form` | naslov (podesiv, podrazumijevano "Get a free SEO check of your website"), polje URL, polje email, kvačica pristanka s linkom na politiku privatnosti agencije, Turnstile, dugme (podrazumijevano "Check my site"), i sitna linija "This form sets no cookies." u podnožju kartice | submit |
| `validating` | dugme u spinneru, polja zaključana | ništa |
| `queued` | "Checking your site…" s animacijom, tekst "Usually takes 5 to 10 seconds" | ništa; u `mode=redirect` se odmah otvara izvještaj u novom tabu |
| `done` | ocjena u krugu, jedna rečenica, dugme "See your full report" koje otvara `/r/<token>` | otvori izvještaj |
| `error` | poruka po kodu greške (vidi ispod), dugme "Try again" | vrati na `form` |

Kodovi grešaka i poruke korisniku:

| Kod | Poruka |
|---|---|
| `invalid_url` | "That doesn't look like a website address. Try something like example.com." |
| `blocked_target` | "We can't check that address." (privatne mreže, naša domena, blokirane) |
| `invalid_email` | "Please enter a valid email address." |
| `disposable_email` | "Please use a permanent email address." |
| `rate_limited` | "This site was already checked today. Your report is on its way." (i pošalje se postojeći) |
| `quota_exceeded` | "This check is temporarily unavailable." (agencija je na limitu; agencija dobije obavještenje) |
| `turnstile_failed` | "Please confirm you're not a robot." |
| `fetch_failed` | prikazuje se u izvještaju, ne ovdje |

Validacija na klijentu prije slanja: URL se normalizuje (dodaje https://, mala slova
host), email po obrascu. Sve se ponovo validira na serveru.

Događaji: `form_viewed`, `form_submitted`, `form_error:<kod>`, `result_viewed`,
`report_opened`.

### 1.3 Hostovani obrazac `/a/[slug]`

Ista komponenta kao 1.2, na cijeloj stranici, sa logom agencije iznad i njenim tekstom.
Za agencije koje nemaju pristup CMS-u ili hoće link u emailu.

---

## 2. Izvještaj (siteauditserver.com)

### 2.1 `/r/[token]`

Javna stranica, `noindex`, token od 32 znaka. Svijetla tema. Boje i logo agencije.

Redoslijed sekcija odozgo:

**Zaglavlje.** Logo agencije lijevo, ime agencije, desno datum i URL koji je skeniran.
Ako agencija ima `calendar_url`, dugme "Book a call" gore desno.

**Ocjena.** Krug 0 do 100 s bojom (crveno do 49, žuto do 79, zeleno od 80), pored njega
četiri podocjene kao horizontalne trake: Indexing, Page markup, Structured data, Content
and media. Ispod jedna rečenica koju generiše pravilo, ne model: "Your page has 3 issues
that are holding it back. We've written the fixes for the top 3 below."

**Tri popravke.** Svaka kao kartica:
- naslov nalaza (npr. "Your page title isn't working for you")
- oznaka ozbiljnosti
- dva bloka, **jedno pored drugog od 768 px naviše, jedno ispod drugog ispod toga**:
  "Now" (postojeće, monospace, na crvenkastoj podlozi) i "Suggested" (novo, monospace, na
  zelenkastoj), s dugmetom "Copy" na vrhu kartice. Pored je zato što je ovo poređenje, a
  poređenje se čita u paru. Tako je i nacrtano u `design/phase1/Report.dc.html`. Vidi
  `decisions/0009`.
- blokovi se poravnavaju po vrhu, ne rastežu na istu visinu, da jednoredni "Now" ne
  postane prazna kutija pored deset redova JSON-LD-a
- "Why this works": dva do tri razloga kao lista
- za JSON-LD: blok koda sa sintaksom, sklopiv

**Ostali nalazi.** Lista svih preostalih nalaza: naslov i ozbiljnost čitljivi, opis i
prijedlog zamagljeni CSS-om (ne zaista skriveni, jer je HTML javan; zamagljivanje je
poruka, ne zaštita). Preko liste jedan poziv: "Get the full fix pack from [Agency]" s
dugmetom na `cta_url` ili kalendar. Ako agencija nema ni jedno ni drugo, dugme otvara
`mailto:` na email agencije.

**Šta je provjereno.** Sklopiva sekcija sa svih 29 provjera i statusom prošlo/palo, za
one koji hoće detalje.

**Podnožje.** Ime agencije, adresa ako je unesena, link na politiku privatnosti agencije.
Na besplatnom paketu: "Powered by Tidywright" s linkom. Na plaćenom: ništa.

Stanja:

| Stanje | Šta se vidi |
|---|---|
| `pending` | zaglavlje, skeleton ocjene, tekst "We're checking your page now", stranica sama osvježava svakih 2 sekunde do 60 sekundi, pa pokazuje "Taking longer than usual, we'll email you when it's ready" |
| `done` | sve gore |
| `failed:fetch` | "We couldn't reach [url]. It returned [status] / took too long. This is itself worth fixing." s dugmetom "Try again" (novi audit) |
| `failed:blocked` | "This site blocks automated checks. [Agency] can still audit it manually." |
| `expired` / `deleted` | 410 stranica: "This report is no longer available." |

Varijanta za pilot: `variant=score_only` prikazuje sve osim tri gotove popravke (umjesto
njih samo naslovi nalaza). Bira se nasumično na serveru pri kreiranju audita i zapisuje.

Događaji: `report_viewed`, `fix_copied:<vrsta>`, `fixes_expanded`, `checks_expanded`,
`cta_clicked`, `calendar_clicked`, `powered_by_clicked`.

### 2.2 `/r/[token]/pdf`

Isti sadržaj kao PDF, A4, bez zamagljivanja (agencija odlučuje da li ga šalje). Generiše
se na zahtjev i kešira. Faza 2.

### 2.3 `/u/[token]`

Odjava s liste. Jedna stranica: "You've been unsubscribed from [Agency]." Bez prijave.
Upisuje `unsubscribed_at` na lead.

---

## 3. Aplikacija (app.tidywright.com)

### 3.0 Zajednički elementi

**Lijeva navigacija** (faza 1):

| Grupa | Stavka | Ruta | Brojač |
|---|---|---|---|
| | Overview | `/overview` | |
| WIDGET | Leads | `/leads` | novi leadovi od zadnjeg pregleda |
| | Audits | `/audits` | |
| | Embed code | `/embed` | |
| | Branding | `/branding` | |
| ACCOUNT | Billing | `/billing` | (faza 2) |
| | Team | `/team` | (faza 2) |
| | Settings | `/settings` | |

Faza 3 dodaje grupu SITES iznad WIDGET s listom sajtova, i navigacija dobija birač sajta
u gornjoj traci kao na dizajnu.

**Gornja traka.** Ime agencije lijevo (u fazi 3 birač sajta), pretraga (faza 2), desno
zvono obavještenja i avatar s menijem: Settings, Docs, Sign out.

**Prazna stanja** svuda imaju: ilustraciju od jedne linije, jednu rečenicu šta ovdje
dolazi, i jedno dugme koje vodi na akciju koja to popunjava.

**Toast poruke** za uspjeh i grešku, gore desno, nestaju za 4 sekunde, greška ostaje dok
se ne zatvori.

### 3.1 Prijava i registracija

| Ruta | Sadržaj | Napomene |
|---|---|---|
| `/login` | email, lozinka, "Forgot password?", dugme "Sign in", link "Create an account", opcija "Email me a magic link" | greške: pogrešni podaci, nepotvrđen email (s dugmetom pošalji ponovo), previše pokušaja |
| `/signup` | ime agencije, email, lozinka, kvačica uslova, dugme "Create account" | poslije: stranica "Check your email" s dugmetom pošalji ponovo |
| `/forgot-password` | email, dugme | uvijek ista poruka bez obzira da li email postoji |
| `/reset-password?token=` | nova lozinka dva puta | |
| `/invite/[token]` | "[Name] invited you to [Agency]", prihvati (traži prijavu ili registraciju) | faza 2 |

Nikad ne otkrivamo da li email postoji. Lozinka najmanje 10 znakova, bez drugih pravila.

### 3.2 Onboarding `/onboarding/[step]`

Tri koraka, traka napretka, može se preskočiti na kraju. Prikazuje se dok
`agency.onboarded_at` nije upisan.

| Korak | Polja | Dugmad |
|---|---|---|
| 1 Agency | ime agencije (unaprijed popunjeno), slug (generisan, uređiv, provjera zauzetosti uživo), web sajt agencije | Continue |
| 2 Branding | logo (upload, PNG ili SVG do 500 KB, pregled), boja (color picker, tri predložene), tekst poziva (podrazumijevano "Get the full fix pack"), link poziva, link na kalendar (opcionalno) | Back, Continue, Skip for now |
| 3 Embed | kod za kopiranje, prekidač inline/redirect, dugme "Copy code", link na hostovani obrazac, dugme "Test it" koje otvara hostovani obrazac u novom tabu, tekst "We'll show your first audit here as soon as one comes in" | Back, Finish |

Poslije Finish: `/overview` s praznim stanjem koje kaže "Waiting for your first audit".

### 3.3 Pregled `/overview`

Ko vidi: owner, admin, member.

**Red kartica (4):** Audits this week, Leads this week, Report views, CTA clicks. Svaka s
brojem, malim postotkom prema prošloj sedmici, i mini grafom zadnjih 7 dana. Ispod
kartica jedna linija: "Free plan: 23 of 50 audits used today" s linkom na Billing (samo
na besplatnom).

**Lijeva kolona (šira):** "Recent leads" tabela zadnjih 8: email, URL, ocjena, prije
koliko, dugme View. Link "All leads".

**Desna kolona:** "Your widget" kartica: status (Live na 2 sajtova / Not installed yet),
lista hostova s kojih su stigli auditi, dugme "Embed code". Ispod: "Pilot numbers" (samo
dok je agencija u pilotu): tri brojke koje tražimo.

Prazno stanje: sve kartice na nuli, umjesto tabele velika kartica s tri koraka (Add the
code, Test it, Share the link) i statusom svakog.

Događaji: `overview_viewed`.

### 3.4 Leadovi `/leads`

Ko vidi: owner, admin, member.

**Zaglavlje:** naslov, brojač ukupno, dugme "Export CSV" (owner, admin), filter po
datumu (7 dana, 30 dana, sve, prilagođeno), pretraga po emailu ili URL-u.

**Tabela** (TanStack, server-side paginacija po 25):

| Kolona | Sadržaj |
|---|---|
| Email | email, ispod ime hosta s kojeg je došao |
| Site | URL koji je skeniran, skraćen |
| Score | broj u boji |
| Consent | kvačica ili crtica (da li je označio marketing pristanak) |
| Status | New, Viewed, Contacted (ručno se postavlja) |
| When | relativno vrijeme |
| | dugme "View report", meni: Mark contacted, Delete |

Redovi s novim leadovima su podebljani dok se ne otvore.

Prazno stanje: "No leads yet. Leads appear here when someone completes your audit form."
s dugmetom Embed code.

**Detalj leada** `/leads/[id]`: lijevo kartica s emailom, datumom, izvornom stranicom,
IP državom, pristankom i tekstom pristanka koji je vidio (verzija), dugmad "Mark
contacted", "Copy email", "Delete lead" (s potvrdom, objašnjava da briše i izvještaj).
Desno ugrađen izvještaj (iframe na `/r/<token>`) s dugmetom "Open" i "Send again".

Događaji: `leads_viewed`, `lead_opened`, `lead_exported`, `lead_deleted`,
`lead_marked_contacted`.

### 3.5 Auditi `/audits`

Ko vidi: owner, admin, member.

Isto kao leadovi ali bez emaila, s kolonama: URL, Score, Status (queued, running, done,
failed), Duration, Variant (pilot), When, dugme View. Filter po statusu. Ovdje se vide i
auditi koji nisu postali lead (posjetilac nije ostavio email, u varijanti gdje je email
opcionalan; u fazi 1 email je obavezan pa je ovo isto što i leadovi bez emaila; tabela
ipak postoji jer u fazi 3 auditi dolaze i iz crawla).

**Detalj audita** `/audits/[id]`: zaglavlje s URL-om, statusom, trajanjem, cijenom
modela (samo owner), varijantom. Ispod: izvještaj kako ga posjetilac vidi (iframe).
Desno: vremenska linija događaja (submitted, fetched, checked, generated, done,
report_viewed, cta_clicked) s vremenima. Dugme "Re-run" (pravi novi audit istog URL-a).

### 3.6 Kod za ugradnju `/embed`

Ko vidi: owner, admin.

**Sekcija 1, Script:** blok koda s dugmetom Copy, prekidač inline/redirect s
objašnjenjem, polje "Target element id" (podrazumijevano tw-audit).

**Sekcija 2, Hosted form:** link `siteauditserver.com/a/<slug>` s dugmetom Copy i Open.

**Sekcija 3, Preview:** živi pregled obrasca u iframeu sa trenutnim brendiranjem.

**Sekcija 4, Allowed hosts:** lista domena s kojih obrazac smije raditi (uređiva, do 10
na besplatnom). Nova domena se automatski dodaje pri prvom auditu ako je lista prazna.

**Sekcija 5, Keys:** javni ključ, dugme "Rotate key" s potvrdom (stari ključ radi još 24
sata).

### 3.7 Brendiranje `/branding`

Ko vidi: owner, admin.

Forma s pregledom uživo desno (izvještaj u malom):

- Logo (upload, pregled, ukloni)
- Primary color (picker, kontrast se provjerava prema bijeloj i upozorava)
- Agency name as shown to visitors
- Report intro text (jedna rečenica, opcionalno)
- CTA text, CTA link
- Calendar link
- Privacy policy link (obavezno za obrazac; bez njega obrazac pokazuje upozorenje)
- Postal address (za podnožje emaila, obavezno kad agencija šalje marketing)
- Prekidač "Show 'Powered by'" (zaključan na besplatnom paketu, s tekstom "Upgrade to
  remove")

Dugme Save, s toastom. Promjene se odmah vide na obrascu (kešira se 60 sekundi).

### 3.8 Podešavanja `/settings`

Ko vidi: owner (sve), admin (sve osim opasne zone).

Tabovi:

| Tab | Sadržaj |
|---|---|
| General | ime agencije, slug (promjena s upozorenjem da se mijenja link hostovanog obrasca), web sajt, vremenska zona, jezik izvještaja (samo en u fazi 1) |
| Notifications | email za leadove (može više adresa), obavijest o svakom leadu ili dnevni sažetak, obavijest kad se dostigne limit |
| Webhook | URL, tajni ključ (prikaži jednom), dugme "Send test", lista zadnjih 10 isporuka sa statusom |
| Data | zadržavanje leadova (30, 90, 365 dana, zauvijek), zadržavanje snimka stranice (7 ili 30 dana), dugme "Export all data", link na DPA |
| Danger zone | obriši sve leadove, obriši nalog (traži upis imena agencije) |

### 3.9 Naplata `/billing` (faza 2)

Ko vidi: owner.

Kartica trenutnog plana s limitima i potrošnjom (audita danas, sajtova). Dugmad
"Upgrade" (otvara Stripe Checkout), "Manage billing" (Stripe Customer Portal). Ispod
tabela faktura (datum, iznos, status, PDF). Ako je plaćanje palo: crvena traka na vrhu
svake stranice s dugmetom "Update card".

### 3.10 Tim `/team` (faza 2)

Ko vidi: owner, admin.

Tabela članova: ime, email, uloga (dropdown, owner ne može promijeniti sebe), zadnja
aktivnost, dugme ukloni. Dugme "Invite" otvara dijalog s emailom i ulogom. Lista
pozivnica na čekanju s dugmetom otkaži.

---

## 4. Faza 3: sajtovi

Osam ekrana je dizajnirano u `design/`. Ovdje su rute i ono što dizajn ne pokazuje.

| Ruta | Dizajn | Ko vidi |
|---|---|---|
| `/sites` | Sites.dc.html | owner, admin, member |
| `/sites/new` | čarobnjak, nije dizajniran (vidi 4.1) | owner, admin |
| `/sites/[id]` | Main.dc.html | owner, admin, member, client (svoj sajt) |
| `/sites/[id]/findings` | Findings.dc.html | isto |
| `/sites/[id]/fixes` | FixQueue.dc.html | isto; client odobrava ako mu je dozvoljeno |
| `/sites/[id]/fixes/[fixId]` | FixReview.dc.html | isto |
| `/sites/[id]/search` | SearchData.dc.html | isto |
| `/sites/[id]/connections` | Connections.dc.html | owner, admin |
| `/sites/[id]/reports` | Reports.dc.html | owner, admin, member |
| `/sites/[id]/history` | nije dizajniran; tabela primijenjenih i vraćenih | isto |

### 4.1 Dodavanje sajta `/sites/new`

Čarobnjak od četiri koraka:

1. **URL.** Polje, provjera da sajt odgovara, prikaz naslova i favicona.
2. **Ownership.** Tri kartice: DNS TXT (prikaže zapis, dugme Verify), Search Console
   (dugme Connect Google, OAuth), HTML file (preuzmi fajl, dugme Verify). Sajt ostaje
   "unverified" dok jedno ne prođe; može se preskočiti i verifikovati kasnije, ali se
   bez verifikacije ne crawla više od 5 stranica.
3. **Delivery.** Četiri kartice iz Connections dizajna. WordPress: uputstvo za
   instalaciju pluginova i polje za ključ. GitHub: dugme Install app. Patch: ništa.
   Edge: uputstvo. Može se preskočiti (sajt u read-only režimu).
4. **Scan.** Dugme "Start first scan", pokazuje napredak (stranica po stranica), po
   završetku vodi na `/sites/[id]`.

### 4.2 Portal klijenta

Klijent kojeg agencija pozove vidi isti app s navigacijom svedenom na svoj sajt (ili
više njih), bez Leads, Embed, Branding, Billing, Team. Brend u navigaciji je agencijin,
ne naš (bijela etiketa, faza 4 za vlastitu domenu, u fazi 3 samo logo i boja).

---

## 5. Admin `/admin` (interno)

Ko vidi: staff. Odvojen layout, bez brendiranja.

| Ruta | Sadržaj |
|---|---|
| `/admin/agencies` | tabela: ime, plan, audita danas, leadova, registrovana, zadnja aktivnost; klik otvara nalog u read-only s dugmetom "Impersonate" (zapisuje se u audit log) |
| `/admin/audits` | svi auditi sa filterima po statusu, agenciji, hostu; detalj pokazuje sirove nalaze i odgovor modela |
| `/admin/costs` | trošak modela po danu i po agenciji, prosjek po auditu, upozorenje iznad praga |
| `/admin/abuse` | hostovi s najviše audita, emailovi s najviše audita, blokada hosta ili emaila, lista blokiranih |
| `/admin/flags` | prekidači: novi auditi on/off, model on/off (fallback na determinističke popravke), pilot varijanta on/off, održavanje |

---

## 6. Marketing sajt (tidywright.com)

Detalji u `28-marketing-site.md`. Rute: `/`, `/pricing`, `/for-agencies`, `/docs`,
`/docs/embed`, `/docs/webhooks`, `/legal/terms`, `/legal/privacy`, `/legal/dpa`,
`/legal/subprocessors`, `/compare/[competitor]` (faza 2).

---

## 7. Komponente koje se dijele

Lista koju Claude Code pravi prije ekrana, u `packages/ui`:

| Komponenta | Gdje se koristi |
|---|---|
| `ScoreRing` | izvještaj, obrazac done, detalj audita, sajt |
| `GroupBars` | podocjene |
| `SeverityPill` | nalazi svuda |
| `FixCard` (now / suggested / reasons / copy) | izvještaj, pregled popravke |
| `DiffView` | pregled popravke faza 3 |
| `DataTable` (TanStack omotač sa server paginacijom, praznim stanjem, greškom) | leadovi, auditi, sajtovi, članovi |
| `StatTile` (broj, delta, sparkline) | pregled, sajt |
| `EmptyState` | svuda |
| `CodeBlock` (copy) | embed, JSON-LD |
| `BrandPreview` | onboarding, brendiranje |
| `UploadImage` | logo |
| `ColorField` | boja |
| `ConfirmDialog` | brisanja, rotacija ključa |
| `PlanBadge` i `UsageMeter` | pregled, naplata |

## 8. Mock podaci

Faza frontenda radi sa fajlom `packages/mocks` koji ima: 2 agencije, 40 leadova, 60
audita s punim nalazima (uključujući 5 s greškom i 3 u toku), 1 sajt sa 38 nalaza i 12
popravki u redu (uzorak iz adconnecta audita). Svaki ekran se može otvoriti u Storybooku
u sva četiri stanja. Tek kad to prođe pregled, spaja se backend.
