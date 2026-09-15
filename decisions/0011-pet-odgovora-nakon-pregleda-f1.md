# 0011 Pet odgovora na pitanja iz backloga F1

Datum: 15.09.2026.
Status: prihvaćeno

## Kontekst

Odluka `0010` je zapisala ono što je već bilo odlučeno u pregledu F1. Ostatak backloga je
otišao u `docs/11-open-questions.md` kao pitanja 19 do 23. Ovo su odgovori na njih.

Četiri pitanja su zatvorena u cijelosti. Pitanje 19 je rascijepljeno: dio koji je blokirao
B1 je odlučen ovdje, dio koji traži mjerenje ostaje otvoren i prepisan je tako da traži
broj umjesto mišljenja.

Jedna odluka po sekciji, redoslijedom pitanja.

---

## 1. Model podataka nosi oba oblika od prvog dana (pitanje 19, prvi dio)

### Odluka

Model podataka od početka nosi i **organizaciju s više sajtova** i **korisnika s jednim
sajtom**. Tabela zakupca dobija kolonu `kind` sa vrijednostima `agency` i `solo`, i
pravila koja se po njoj razlikuju su zapisana prije nego što B1 napiše prvu migraciju.

Ovo odblokirava B1.

### Zašto

Iz `docs/37-self-serve-segment.md`, sekcija 6: agencija je organizacija koja posjeduje
trideset sajtova, sa klijentima kao pod-entitetima koji vide samo svoj. Self-serve je
jedan korisnik koji posjeduje jedan sajt. Oko 70 do 75 posto koda je zajedničko, a
razilaženje je u prezentaciji, dozvolama i naplati. Ako se oblik vlasništva ne postavi
ispravno na početku, migracija kasnije je bolna, a sada je jedna kolona i pet pravila.

Baza još ne postoji. Ovo je najjeftiniji trenutak koji će ikad postojati.

### Šta se nije mijenjalo, i zašto

Zakupac i dalje živi u tabeli `agencies`, i strani ključ je i dalje `agency_id`. Razmotrio
sam preimenovanje u `accounts` i odbacio ga:

- Ne donosi nijednu strukturnu sposobnost. `solo` nalog je red u istoj tabeli sa
  `kind = 'solo'`, sa ili bez preimenovanja.
- Košta 343 pojave u 53 fajla koda, plus JWT claim, plus svaku RLS politiku, plus
  `16-access-control.md` i pola ostalih dokumenata.
- U agencijskom proizvodu je "agencija" tačna riječ. Generičko ime bi pogoršalo dokument
  koji opisuje proizvod koji prvi naplaćuje.

**Kad bi se ovo promijenilo:** ako `solo` ikad dobije nešto što `agencies` ne može nositi
kao kolona, na primjer vlastiti cjenovnik s drugom strukturom ili vlastitu tabelu članova.
Tada se preimenuje, i tada je skupo, i to je prihvaćen rizik.

### Posljedice

Zapisano u `docs/18-data-model.md` i u B1 u `docs/31-build-plan.md`:

- `agencies.kind`: `agency` ili `solo`, CHECK, default `agency`.
- `solo` nalog ima **najviše jedan sajt**, i to je ograničenje u bazi, ne u UI-u.
- `solo` nalog nema embed ključeve, nema bijelu etiketu, nema `client` ulogu i nema
  hostovani obrazac na `/a/[slug]`. `slug` postaje nullable, jer solo nalog nema šta s njim.
- `branding` red za `solo` nalog ne postoji. Izvještaj koji solo korisnik gleda nosi naš
  brend, što je i tačno i jeftinije.
- Uloge se ne mijenjaju. `solo` nalog je jedna agencija s jednim članstvom u ulozi
  `owner`. Zato se vrijednost zove `solo` a ne `owner`, da se ne sudari s imenom uloge.
- `sites` i `site_members` ostaju faza 3 po sadržaju, ali njihov oblik je fiksiran sada,
  jer o njemu ovisi da li `solo` uopšte ima gdje da stane.
- Naplata: `entitlements` se računaju po planu i po `kind`, jer solo plan od 19 do 29
  dolara nije mali agencijski plan nego drugi proizvod.

---

## 2. Nema trake za kolačiće u widgetu, ali slojevi se razdvajaju (pitanje 20)

### Odluka

**Widget i izvještaj ne postavljaju nijedan kolačić i nemaju traku.** To što ne
postavljamo nijedan kolačić je prodajna tačka i piše se naglas.

**Aplikacija i marketinški sajt su drugi sloj.** Tamo hoćemo analitiku, i tamo pristanak
treba, po pravilima koja su sada zapisana unaprijed umjesto da se improvizuju kad zatreba.

### Zašto

Traka koja ne pristaje ni na šta je klik koji nikome ne treba. Gore od toga, agenciji bi
rekla da smo mi nešto što treba objašnjavati njenim posjetiocima, a cijela vrijednost
ugradnje je u tome što ne treba: agencija ne mora dirati svoj cookie banner da bi nas
stavila na sajt.

Ali proizvod ima tri domene i one nemaju isti odgovor. Aplikacija hoće analitiku proizvoda
i ona nije neophodna, pa traži pristanak. Marketinški sajt danas koristi analitiku bez
kolačića, za koju pristanak ne treba, ali čim self-serve lijevak krene doći će potreba za
oglasnim pikselom, i tada traka postaje obavezna. Bolje je to zapisati sada nego se
sjetiti poslije prvog piksela.

### Posljedice

Zapisano u `docs/23-compliance.md`, sekcija "Kolačići i pristanak":

- **siteauditserver.com**: nula kolačića, nikakva traka, u podnožju obrasca rečenica
  "this form sets no cookies". Ako ikad uvedemo kolačić koji nije nužan za rad obrasca,
  traka postaje obavezna i ovo pravilo pada, pa se zato ne uvodi.
- **app.tidywright.com**: sesija i CSRF su neophodni i ne traže pristanak. Analitika
  proizvoda traži pristanak, izbor se nudi jednom poslije onboardinga i mijenja u
  `/settings`, čuva se uz korisnika a ne u kolačiću. Dok pristanak nije dat, analitika se
  **ne učitava**, ne učitava pa gasi.
- **tidywright.com**: analitika bez kolačića, pa bez trake. Traka i `legal/cookie.md` se
  prave u istom PR-u kao i prvi piksel koji postavlja kolačić, ne poslije njega.
- Dvije stavke dodane u checklist prije lansiranja.

Evidencija pristanka je odvojena tema i ona već postoji: `leads.consent` čuva tekst,
verziju, vrijeme, URL i heš IP adrese.

---

## 3. Newsletter da, ali pristanak razdvojen (pitanje 21)

### Odluka

**Dva polja u obrascu.** Jedno obavezno, bez kojeg se izvještaj ne šalje. Jedno
neobavezno i **neoznačeno po defaultu**, za newsletter.

**Zasebna prijava samo na newsletter ide na našu domenu**, ne u agencijin widget.

### Zašto

Jedno polje za oboje je bundling. Pristanak po GDPR-u mora biti specifičan i dobrovoljan
za svaku svrhu, a "pošalji mi izvještaj koji sam upravo tražio" i "šalji mi reklame" nisu
ista svrha. Kvačica koja pokriva oboje pada na prvoj provjeri, i pada zasluženo.

Neoznačeno, a ne unaprijed označeno, jer unaprijed označena kvačica nije pristanak nego
propust da se odznači.

Zasebna prijava ne ide u agencijin widget iz istog razloga kao poziv na akciju u odluci
`0010`, tačka 1: posjetilac koji je došao kroz agencijin widget je **agencijin lead**. Naš
newsletter na tu adresu je isto uzimanje leada, samo sporije i teže primjetno.

### Posljedice

- `leads.consent` više nije jedan zapis nego dva: `service` i `marketing`, svaki sa svojim
  tekstom, verzijom, vremenom i stanjem. `checked: false` je jednako valjan dokaz kao i
  `true`, jer dokazuje da je izbor postojao. Upisano u `docs/18-data-model.md`.
- `types.ts` prati model u istom PR-u po svom pravilu: `ConsentRecord` i `Consent` s dva
  polja.
- Obrazac dobija drugu kvačicu, neobaveznu i neoznačenu, sa vlastitim tekstom.
  `docs/15-frontend-spec.md`.
- **Popravljena greška koju je ovo otkrilo:** `apps/web/components/audit-form.tsx` je slao
  `consent_marketing: true` kao konstantu, dakle svi su bili prijavljeni bez pitanja. Sada
  šalje ono što je posjetilac označio.
- Test u `packages/shared/src/__tests__/mocks.test.ts` pada ako dva pristanka ikad krenu
  zajedno, jer tada jedan od njih više nije izbor.
- Zasebna prijava na newsletter je stranica na tidywright.com i dolazi s F3. U agencijin
  widget ne ide nikad.

---

## 4. Odjava ostaje jedan klik, popust ide na otkazivanje pretplate (pitanje 22)

### Odluka

**Odjava s emailova je jedan klik, bez uslova i bez ponude.** Nikakav popust, nikakva
anketa, nikakav korak prije.

**Popust ide samo na otkazivanje pretplate**, i to je faza 2 uz Stripe.

**Godišnji plan se nudi pri kupovini, ne pri otkazivanju.**

### Zašto

U backlogu su bile pomiješane dvije radnje koje rade dvije različite osobe. Posjetilac se
odjavljuje s emailova. Kupac otkazuje pretplatu. Nemaju isti odnos prema nama i nemaju
ista pravila.

Odjava: traže je GDPR, CASL i CAN-SPAM, a CAN-SPAM izričito čini odgovornim i platformu i
agenciju. Ponuda na toj stranici nije prilika nego izloženost, i to naša i agencijina
istovremeno. Uz to, cilj koji je bio naveden, zadržati mogućnost slanja reklama na te
adrese, nije izvodiv ni sa najboljom ponudom: odjavljena adresa ide u `suppressions` i
više se ne koristi. To nije podešavanje nego obaveza.

Otkazivanje pretplate: ponuda je tu uobičajena i dozvoljena, i to je vjerovatno i bila
namjera.

Godišnji plan pri kupovini, a ne pri otkazivanju, iz jednostavnog razloga: ko je došao do
dugmeta za otkazivanje već je odlučio, i popust u tom trenutku je naplata pažnje koju više
nemamo. Mjesto gdje godišnja naplata stvarno radi je Checkout. Po
`docs/37-self-serve-segment.md`, za proizvode ispod 25 dolara mjesečno ona daje **62 posto
godišnjeg zadržavanja naspram 41 posto kod mjesečne**, razlika od 21 procentnog poena.
Kod viših cijena ta prednost ne postoji. Dakle godišnji plan nije popust nego mehanizam
preživljavanja, i vrijedi više od bilo čega ponuđenog na izlazu.

### Posljedice

- `docs/26-email.md`: `/u/[token]` odjavljuje jednim klikom, prima i `POST` za jednoklik
  iz mail klijenta, nema ponude ni ankete, adresa ide u `suppressions`. Zapisano kao
  pravilo koje se ne pregovara.
- `docs/24-billing.md`: ponuda pri otkazivanju je jedan ekran prije potvrde, jedna ponuda,
  dugme za otkazivanje uvijek vidljivo i nikad sivo, i ne pita se ponovo u istom periodu
  ako je odbijena.
- `docs/24-billing.md`: godišnja opcija stoji na ekranu cijena i u Checkoutu kao
  ravnopravan izbor, ne kao sitni prekidač.

---

## 5. Brend: tri sloja i nema četvrtog (pitanje 23)

### Odluka

| Sloj | Čiji brend |
|---|---|
| Posjetilac: obrazac, izvještaj, email s izvještajem | **agencijin.** To je bijela etiketa i to je proizvod |
| Agencija: aplikacija, emailovi o leadovima, fakture, dokumentacija | **naš.** Tidywright, svugdje |
| Dobavljači: model, hosting, Turnstile, email, sve u lancu | **ne vide se nigdje**, ni agenciji ni posjetiocu |

### Zašto

Backlog je tražio da cijeli brend bude na naše ime. Pročitano doslovno, to bi ukinulo
bijelu etiketu, a bijela etiketa je razlog zbog kojeg agencija plaća. Pročitano kako je
mišljeno, odnosi se na treći red: ime treće firme se ne spominje bez obzira što koristimo
tuđe servise. Taj red je sada zapisan kao pravilo umjesto da bude pretpostavka.

Agencija zna s kim radi i tu naš brend stoji bez ustezanja. Posjetilac ne treba znati ni
nas ni naše dobavljače. Kupac kupuje ishod, ne lanac nabavke.

### Posljedice

`docs/27-design-system.md` dobija tabelu i tri pravila koja se provjeravaju u pregledu:
u posjetilačkom sloju nema naše boje (lime je boja aplikacije), nema naših fontova, i ime
dobavljača se ne pojavljuje ni u jednom tekstu koji korisnik vidi, ni u tooltipu, ni u
poruci greške, ni u `<title>`. Ako greška mora imati identifikator, to je naš `request_id`.

`docs/29-phase3-connectors.md` dobija strožu verziju za jedino mjesto gdje naš kod piše po
tuđem sajtu: nikakav vidljiv trag našeg brenda u markupu, nikakav link prema nama (već
zabranjeno odlukom `0010`, tačka 2), nikakvo ime dobavljača u tekstu popravke. Trag u
`wp_tidywright_log` i u `audit_log` ostaje, jer bez njega nema vraćanja unazad, ali to je
zapis u bazi a ne oznaka na stranici. Ime plugina u WordPress adminu ostaje Tidywright,
jer ga vidi onaj ko ga je instalirao, dakle drugi sloj.

**Zadatak ostaje, i može oboriti treći red.** Prije B6 se prolaze uslovi korišćenja svakog
vanjskog servisa u lancu. Neki traže vidljivo navođenje izvora. Ako neki od naših to
traži, ugovor pobjeđuje pravilo, i tada se mijenja dobavljač, ne pravilo.

---

## 6. Ocjena se ne dira (napomena uz pitanja, zatvoreno bez otvaranja)

### Odluka

Ponderisanje ocjene po sloju uticaja se **ne radi**. Ocjena ostaje ponderisani prosjek
grupa, kako jeste.

### Zašto

`docs/35-fix-effectiveness.md` predlaže da blokatori nose oko 50 posto ocjene. Argument je
dobar: klijent koji popravi 140 od 176 stavki i vidi skok sa 42 na 88 bez ijedne promjene
u pretrazi ima pravo da se osjeća prevarenim.

Ali ta izmjena mijenja **svaki broj koji smo ikom pokazali**, uključujući mock podatke,
snimke iz pregleda, primjere u dokumentaciji i sve što ide na marketinški sajt. To je
zasebna odluka i donosi se kad za nju bude vremena i razloga, ne usput uz oznaku uticaja.

Oznaka uticaja je već uzela ono najvrednije iz tog prijedloga: **redoslijed** onoga što
izvještaj ističe. Redoslijed je ono što klijent čita, ocjena je ono što pamti. Prvo je
popravljeno, drugo čeka.

### Posljedice

- `prioritise()` vodi po uticaju puta ozbiljnost. To je već urađeno.
- `scoreChecks()` i `GROUP_WEIGHTS` ostaju netaknuti.
- Zapisano u `docs/11-open-questions.md` kao **zatvoreno** pitanje, ne otvoreno, da se ne
  vuče kao dug. Ako se ikad otvori, otvara ga nova odluka.

---

## Šta ovo ne rješava

Sekvenca kanala. Ona ostaje otvorena kao pitanje 19 i traži mjerenje, ne sastanak.
