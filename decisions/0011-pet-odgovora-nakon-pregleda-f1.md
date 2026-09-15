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

## Šta ovo ne rješava

Sekvenca kanala. Ona ostaje otvorena kao pitanje 19 i traži mjerenje, ne sastanak.
