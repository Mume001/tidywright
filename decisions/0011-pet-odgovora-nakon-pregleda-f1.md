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

## Šta ovo ne rješava

Sekvenca kanala. Ona ostaje otvorena kao pitanje 19 i traži mjerenje, ne sastanak.
