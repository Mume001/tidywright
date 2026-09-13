# Izbor baze, objašnjeno bez žargona

Ovaj dokument postoji zato što je izbor baze odluka koju je skupo mijenjati poslije, a
ne mora se razumjeti tehnika da bi se razumjelo zašto je odluka ovakva.

## Kratko

**Postgres, na Supabase, dok ne pređemo oko 5.000 aktivnih agencija.** Poslije toga
ista baza, ali na vlastitom Hetzner serveru ako računica kaže da se isplati. Ne MySQL,
ne MongoDB, ne "serverless baza".

## Šta je uopšte razlika

Sve ozbiljne baze rade istu osnovnu stvar: čuvaju tabele s redovima i vraćaju ih brzo.
Razlike su u tri stvari koje nama znače:

**1. Koliko baza može da uradi sama, bez naše aplikacije.**
Postgres ima ugrađena pravila "ko smije vidjeti koji red" (RLS). To znači da čak i ako
napravimo grešku u kodu, agencija A ne može vidjeti leadove agencije B, jer baza to
odbije. MySQL to nema u upotrebljivom obliku, pa svaka provjera mora biti u našem kodu,
na svakom mjestu, zauvijek. Za proizvod koji čuva tuđe leadove ovo je najvažnija
razlika.

**2. Kako se ponaša s podacima koji nemaju fiksni oblik.**
Rezultat audita je 29 provjera s različitim detaljima. To je prirodno JSON. Postgres ima
`jsonb` tip s indeksima koji rade na sadržaju. MySQL ima JSON tip, ali indeksiranje je
zaobilazno i sporije. MongoDB je cijeli od JSON-a, ali onda gubimo pravila, transakcije
i sve ostalo što nam treba za naplatu i uloge.

**3. Koliko ljudi to zna i koliko alata postoji.**
Postgres je zadnjih godina postao podrazumijevani izbor za nove SaaS proizvode. Supabase,
Neon, Drizzle, pg-boss, pg_partman, sve je pravljeno oko njega. Svaki AI asistent ga
poznaje najbolje. Kad nešto zapne, odgovor postoji.

## Zašto ne MySQL

MySQL nije loš. Radi ga pola interneta (WordPress ga koristi). Ali za nas:

- nema RLS, pa sigurnost izolacije agencija zavisi samo od koda
- JSON je slabiji, a pola naših podataka je JSON
- particionisanje tabela je ograničenije (a `events` i `audit_log` moramo sjeći po
  mjesecu da bi brisanje starih podataka bilo trenutno)
- nema `citext` (email bez razlike velikih i malih slova), nema `text[]` (liste u
  koloni), nema proširenja tipa `pg_partman`, `pgcrypto`, `pg_trgm` (pretraga po
  dijelu riječi)
- nema jednostavne `SKIP LOCKED` sheme koju pg-boss koristi za red poslova, pa bi trebao
  Redis od prvog dana

Jedina stvar u kojoj je MySQL prednost je što ga Mume već poznaje s WordPress hostinga.
To nije dovoljno.

## Zašto ne MongoDB ili druge "document" baze

Nemamo problem koji one rješavaju. Naši podaci su relacioni: agencija ima ključeve, ključ
ima leadove, lead ima audite, audit ima popravke, agencija ima plan koji ograničava sve
to. Kad se to modeluje kao dokumenti, ili se podaci dupliraju ili se radi join u kodu.
Naplata i uloge traže transakcije koje su tamo naknadno dodate. JSON nam treba, i Postgres
ga ima.

## Zašto ne SQLite / Turso / D1

Odlične za jednog korisnika ili edge. Na 100.000 korisnika s radnicima koji istovremeno
pišu, nisu izbor koji bismo branili.

## Zašto Supabase, a ne goli Postgres na serveru od prvog dana

Supabase je Postgres plus tri stvari koje bismo inače morali sami praviti i održavati:

| Šta | Bez Supabase | Sa Supabase |
|---|---|---|
| Prijava, lozinke, email potvrda, MFA, OAuth | 2 do 3 sedmice posla, plus rizik | uključeno |
| Backup, PITR, nadogradnje verzije | naš posao, naša greška u 3 ujutro | uključeno (PITR je doplata 100 $) |
| Storage za fajlove s pravilima pristupa | S3 plus kod | uključeno |
| Nadzor, metrike, logovi upita | naš posao | uključeno |
| Cijena na startu | Hetzner CX23 5,49 € plus naše vrijeme | 25 $ Pro |

Na 20 sati sedmično, tri sedmice na auth i backup je više od mjesec dana proizvoda. To
je cijela razlika.

Rizik Supabase-a: cijena raste s računarom (Large je 110 $, 2XL je 410 $ mjesečno) i
Supabase Auth kao gotov proizvod ima svoje granice. Oba su prihvatljiva jer je ispod sve
običan Postgres i može se preseliti `pg_dump`-om.

## Kad se seli sa Supabase

Tri okidača, dovoljan je jedan:

1. **Računica.** Supabase račun pređe oko 400 $ mjesečno, a Hetzner ekvivalent (AX42
   dedicated 97 € plus naš rad na Patroni ili bar automatskom backupu) je jeftiniji i
   imamo bar 4 sata sedmično za održavanje.
2. **Potreba za nečim što Supabase ne dozvoljava.** Neka ekstenzija, poseban tuning,
   posebna replikacija.
3. **Pouzdanost.** Dva incidenta u kvartalu koja Supabase prouzrokuje, ne mi.

Selidba: novi server, `pg_basebackup` ili logička replikacija, promjena connection
stringa, Auth ostaje na Supabase (može raditi odvojeno od baze), Storage se prebaci na
Cloudflare R2 (isti S3 API).

Procjena kad se to dešava: oko 5.000 aktivnih agencija, ili 300.000 audita mjesečno.
Vidi `20-infrastructure.md` faza C.

## Kako se baza koristi u kodu

- **Drizzle ORM.** Tabele su opisane u TypeScriptu, upiti su tipizirani, migracije se
  generišu iz razlike. Nije "magija", vidi se SQL koji ide u bazu.
- **Dvije konekcije:** aplikacija ide kroz Supabase klijent s korisnikovim JWT-om (RLS
  važi), radnik ide direktno s `DATABASE_URL` servisnim korisnikom (RLS ne važi, jer radnik
  radi u ime sistema).
- **Pooler.** Supabase Supavisor u `transaction` modu za Next.js (serverless traži puno
  kratkih konekcija), `session` mod za radnika i pg-boss (traži `LISTEN/NOTIFY`).
- **Nikad `select *`** u produkcionom kodu, jer velike JSONB kolone stižu i kad ne
  trebaju.
- **Svaki upit koji čita listu ima `limit`** i cursor paginaciju po `(created_at, id)`.

## Pravila koja čuvaju bazu zdravom

1. Nema dugih transakcija. Radnik otvara transakciju samo za upis rezultata, ne za cijeli
   audit.
2. `events` i `audit_log` primaju samo INSERT, nikad UPDATE. Tabele koje samo rastu ne
   trebaju `VACUUM` skoro nikad.
3. Statistike se čitaju iz `stats_daily`, ne računaju iz `events` na svaki pregled.
4. Puni JSON audita ide u Storage, ne u tabelu.
5. Jednom mjesečno se pogleda `pg_stat_statements` top 10 po ukupnom vremenu.
6. Indeks se dodaje kad upit u produkciji to traži, ne unaprijed "za svaki slučaj". Svaki
   indeks košta na svakom upisu.

## Rječnik

| Riječ | Znači |
|---|---|
| RLS | Row Level Security, pravilo u bazi ko vidi koji red |
| JSONB | JSON sačuvan u binarnom obliku koji se može indeksirati |
| particija | jedna logička tabela fizički podijeljena na dijelove, npr. po mjesecu |
| PITR | Point In Time Recovery, vraćanje baze na tačnu minutu |
| pooler | posrednik koji dijeli mali broj pravih konekcija među mnogo klijenata |
| migracija | skripta koja mijenja strukturu baze, verzionisana kao kod |
| ORM | biblioteka koja prevodi kod u SQL i nazad |
