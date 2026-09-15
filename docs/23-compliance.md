# Usklađenost: GDPR, email zakoni, uslovi

Šta zakon traži od nas i od agencija, i šta u proizvodu to pokriva. Ovo nije pravni
savjet; prije lansiranja jedan sat s advokatom za ToS i DPA, procjena 300 do 600 €.

## Ko je ko po GDPR-u

| Podatak | Kontrolor | Obrađivač |
|---|---|---|
| Lead (email, URL, IP) prikupljen kroz obrazac agencije | **agencija** (ona odlučuje zašto i šta s njim) | **mi** (obrađujemo u njeno ime) |
| Nalog agencije (email ownera, naplata) | **mi** | Supabase, Stripe, Resend (naši podobrađivači) |
| Sadržaj tuđe javne stranice | javno dostupan, legitimni interes za analizu, ne čuvamo trajno | |

Posljedice:
- Trebamo **DPA (Data Processing Agreement)** s svakom agencijom, po članu 28(3). Ne
  potpisuje se ručno: dio je uslova korištenja koje agencija prihvata pri registraciji,
  s posebnom stranicom `/legal/dpa` i verzijom. Šablon se pravi po uzoru na javne DPA
  (npr. Vercel, Resend), advokat pregleda.
- Trebamo **listu podobrađivača** javno (`/legal/subprocessors`): Supabase (Frankfurt),
  Vercel (SAD, edge EU), Hetzner (Njemačka), Cloudflare (globalno), Resend (SAD),
  Stripe (SAD), OpenAI ili Anthropic (SAD, samo sadržaj stranice, nikad email
  posjetioca). Promjena liste se najavljuje emailom 30 dana unaprijed, jer DPA to traži.
- **Prenos u SAD:** Vercel, Resend, Stripe, model dobavljači. Osnov: EU-US Data Privacy
  Framework (DPF) tamo gdje je dobavljač certificiran, plus standardne ugovorne
  klauzule (SCC) kao rezerva. Mi sami se DPF certificiramo tek ako imamo US kupce koji to
  traže (260 $ godišnje, jednostavno). U fazi 1 nije potrebno.
- **Email posjetioca nikad ne ide modelu.** Model dobija samo URL i sadržaj stranice.
  Time je krug podataka koji idu u SAD manji.

## Pristanak posjetioca

Agencija je kontrolor, ali mi pravimo obrazac, pa obrazac mora omogućiti pravilno
prikupljanje:
- Obavezno polje pristanka (checkbox, nije unaprijed čekiran) s tekstom koji agencija
  može prilagoditi, s podrazumijevanim: "I agree to receive my SEO report and follow-up
  from {agency name} by email. See their [privacy policy]({url})."
- Agencija unosi URL svoje politike privatnosti u onboardingu. Bez toga obrazac
  prikazuje upozorenje u app-u i link na naš generički tekst.
- Zapis pristanka u `leads.consent`: tekst, verzija, vrijeme, URL stranice, IP heš.
  Nepromjenjiv. To je dokaz i za agenciju i za nas.
- Link za odjavu u svakom emailu posjetiocu, radi bez prijave, jedan klik, i upisuje u
  `suppressions` za tu agenciju.

## Prava posjetioca

| Pravo | Kako radimo |
|---|---|
| Pristup, brisanje | posjetilac piše agenciji (kontroloru); agencija briše lead u app-u ili mi na njen zahtjev; brisanje je trenutno i tvrdo |
| Odjava od emaila | link u emailu, `/u/[token]` |
| Prigovor na obradu | isto što i brisanje |
| Prenosivost | izvoz leadova agencije sadrži i njegove podatke, agencija proslijedi |

Ako posjetilac piše nama direktno, odgovaramo u 72 h, uputimo na agenciju i, ako je
zahtjev jasan (brisanje), obrišemo i obavijestimo agenciju. Ne raspravljamo.

## Prava agencije (naš kupac)

- Izvoz svih svojih podataka (leadovi, auditi, podešavanja) kao CSV i JSON, `/settings`.
- Brisanje naloga: 30 dana meko, pa tvrdo, uključujući Storage i backup rotaciju
  (backup se čuva 30 dana, pa je poslije 60 dana sve nestalo). Ovo piše u DPA.
- Obavještenje o incidentu bez odlaganja (DPA kaže 48 h).

## Zadržavanje

| Podatak | Rok | Osnov |
|---|---|---|
| Lead | agencija bira 30 do 365 dana, default 90 | minimizacija |
| IP heš | 30 dana | zaštita od zloupotrebe |
| Audit bez leada (anonimizovan) | 13 mjeseci | statistika, legitimni interes |
| Dnevnik radnji | 24 mjeseca | sigurnost |
| Fakture i naplata | 10 godina | poreski zakon, Stripe ih čuva |
| Backup | 30 dana | |

## Email zakoni

Emailovi posjetiocu su transakcijski (tražio je izvještaj) plus jedan follow-up ako
agencija uključi. Emailovi koje agencija dalje šalje su njena stvar, ali mi savjetujemo.

| Zakon | Traži | Naše |
|---|---|---|
| GDPR / ePrivacy (EU) | pristanak za marketing, laka odjava | checkbox, odjava, suppressions |
| CAN-SPAM (SAD) | tačan pošiljalac, fizička adresa, odjava u 10 dana; **i platforma i agencija odgovaraju** | footer s adresom agencije (obavezno polje u brendiranju za plaćeni plan) i našom kao pošiljaoca, odjava trenutna |
| CASL (Kanada) | izričit pristanak, evidencija | isto kao GDPR |

Zato je adresa agencije obavezno polje u brendiranju kad se uključi "powered by"
sakrivanje, jer tada email izgleda kao da ga agencija šalje.

## Sadržaj tuđih stranica

- Dohvaćamo javno dostupne stranice na zahtjev posjetioca koji tvrdi interes za taj
  sajt. Poštujemo `robots.txt` (`User-agent: TidywrightBot` i `*`), ne dohvaćamo
  stranice iza prijave, ne čuvamo HTML duže od audita (izvodi u JSON-u rezultata,
  do 2 KB po provjeri).
- `/bot` stranica objašnjava ko smo i kako se blokirati.
- Vlasnik sajta može tražiti da njegov host bude na `blocklist` (globalno). Radimo isti
  dan.

## Uslovi korištenja, ključne tačke

- Ko smije: pravna lica i profesionalci (B2B), 18+, bez potrošača. Time izbjegavamo
  potrošačko pravo EU (pravo na odustajanje 14 dana i slično).
- Agencija garantuje da ima pravo prikupljati leadove i da će poštovati zakon prema
  posjetiocima; nadoknađuje nam štetu ako ne.
- Zabranjena upotreba: skeniranje sajtova bez legitimnog interesa, slanje neželjenih
  emailova, bilo šta nezakonito, pokušaj zaobilaženja limita.
- Odgovornost: ograničena na iznos plaćen u zadnjih 12 mjeseci. Bez garancije da će
  popravke poboljšati rangiranje (ne smijemo obećavati SEO rezultate).
- Faza 3: agencija potvrđuje da ima ovlaštenje klijenta da mijenja sajt, i da je
  pregledala popravku prije odobrenja. Snimak i vraćanje su naš alat, ne garancija.
- Promjene uslova: email 30 dana ranije.
- Mjerodavno pravo: gdje je firma registrovana. **Otvoreno:** registracija firme
  (BiH, ili Estonija e-Residency, ili Delaware LLC preko Stripe Atlas 500 $). Za Stripe
  i za DPA treba pravno lice. Odluka prije prve naplate, ne prije lansiranja besplatnog.

## Kolačići i pristanak

Odlučeno 15.09.2026., `decisions/0011`, tačka 2. Tri domene, tri različita odgovora, i
razlika među njima je namjerna.

### siteauditserver.com, widget i izvještaj: nula kolačića, nikakva traka

Ovo je jedini dio proizvoda koji živi na tuđoj stranici i zato ima najstrožije pravilo.

- Nula kolačića, ni vlastitih ni trećih strana. Turnstile ne postavlja kolačić za
  praćenje.
- Analitika ide kroz naš `events` na serveru, bez ijednog klijentskog praćenja.
- **Trake za kolačiće nema i neće je biti.** Traka koja ne pristaje ni na šta je klik koji
  nikome ne treba, a agenciji bi rekla da smo mi nešto što treba objašnjavati.
- Ovo je prodajna tačka i piše se naglas: **agencija ne mora dirati svoj cookie banner da
  bi nas ugradila.** U podnožju obrasca stoji "this form sets no cookies", i to je tačno.

Uslov koji ovo drži: ako ikad uvedemo bilo kakav kolačić koji nije nužan za rad obrasca,
traka postaje obavezna i ovo pravilo pada. Zato se ne uvodi.

### app.tidywright.com, aplikacija: neophodni bez pristanka, analitika s pristankom

- Sesija i CSRF su neophodni kolačići i za njih pristanak ne treba, po ePrivacy izuzetku
  za ono bez čega usluga koju je korisnik tražio ne radi.
- **Analitika proizvoda traži pristanak**, jer nije neophodna. Prijavljen korisnik dobija
  izbor jednom, pri prvom ulasku poslije onboardinga, i mijenja ga u `/settings`. Izbor
  se čuva uz korisnika, ne u kolačiću, pa prati nalog kroz uređaje.
- Dok pristanak nije dat, analitika se ne učitava. Ne učitava se pa gasi, nego se ne
  učitava.

### tidywright.com, marketinški sajt: analitika bez kolačića, pa bez trake

- Plausible ili Umami, bez kolačića i bez otiska uređaja. Za takvu analitiku pristanak po
  ePrivacy ne treba, jer se ništa ne sprema na korisnikov uređaj.
- **Ako se ikad pređe na analitiku s kolačićima** (Google Analytics, Meta pixel, bilo
  kakav oglasni piksel radi mjerenja kampanja), traka postaje obavezna prije prvog takvog
  piksela, ne poslije. To je vjerovatna potreba kad self-serve lijevak krene, pa je
  zapisana unaprijed: `legal/cookie.md` i traka se prave u istom PR-u kao i prvi piksel.

### Evidencija pristanka, odvojeno od kolačića

Pristanak posjetioca na obrascu je druga stvar od kolačića i on postoji od F1:
`leads.consent` čuva tekst, verziju, vrijeme, URL stranice i heš IP adrese. Marketinški
pristanak je zasebno polje, vidi `decisions/0011`, tačka 3.

## Osiguranje

Cyber liability osiguranje se razmatra kad MRR pređe 5.000 $ ili kad prvi klijent to
traži u ugovoru. U fazi 1 nije potrebno.

## Šta se čuva u repozitoriju

`legal/` folder: `terms.md`, `privacy.md`, `dpa.md`, `subprocessors.md`, `cookie.md`,
`bot.md`, svaki s `version` i `effective_date` u zaglavlju. Aplikacija prikazuje
Markdown, verzija se čuva uz prihvatanje u `audit_log`.

## Checklist prije lansiranja besplatnog plana

- [ ] privacy, terms, DPA, subprocessors stranice objavljene
- [ ] checkbox pristanka na obrascu, tekst prilagodljiv, zapis u `leads.consent`
- [ ] odjava jednim klikom radi i upisuje suppression
- [ ] brisanje leada je trenutno i tvrdo, izvještaj vraća 410
- [ ] izvoz podataka agencije radi
- [ ] `/bot` stranica i `robots.txt` poštovanje
- [ ] podobrađivači svi pod DPF ili SCC (provjeriti Supabase, Vercel, Resend, Cloudflare, Stripe, model dobavljač)
- [ ] kontakt email za privatnost (privacy@tidywright.com) prima poštu
- [ ] widget i izvještaj ne postavljaju nijedan kolačić, provjereno u DevTools na
      `test-embed.html` s drugog porta
- [ ] analitika aplikacije se ne učitava dok pristanak nije dat
