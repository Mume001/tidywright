# 0004 Prvi kanal je ugradbeni widget za audit s prikazom popravki

Datum: 13.09.2026.
Status: prihvaćeno

## Kontekst

Osam paralelnih istraživanja kanala, sažetak u `docs/12-channel-research.md`. WordPress
direktorij je zatvoren za nove bez postojeće distribucije i ima nestabilno upravljanje.
Hladan kontakt s agencijama daje jednog do dva kupca mjesečno uz četvrtinu radnog vremena.
Shopify traži podršku i mašinu za ocjene. AI citiranje se ne može proizvesti. Hostovi ne
partneruju s malima.

Preživjeli su widget, vertikala advokata na WordPressu, i Wix.

## Odluka

Prvi proizvod i prvi kanal je isti: obrazac koji agencija ugradi na svoj sajt, posjetilac
unese URL, dobije brendirani izvještaj u kojem su tri najvažnije popravke prikazane gotove
(napisan title, meta opis, JSON-LD), ostatak zamagljen iza poziva agenciji. Besplatan paket
nosi vidljiv "powered by". Plaćeni ga uklanja.

## Zašto

- Potvrđena potražnja na našoj cijeni: SEOptimer 59 USD, MySiteAuditor 79 USD, SE Ranking
  u paketu od 69 USD, sve za istu stvar, 13 godina.
- Potvrđena rupa: 12 provjerenih proizvoda daje ocjenu i listu. Nijedan ne prikazuje
  gotovu popravku. To je tačno naša faza 2.
- Rješava agenciji problem broj jedan (novi klijenti, 30 posto u AgencyAnalytics n=494),
  a ne dira ono čega se boji (klijentski sajtovi).
- Nema čuvara kapije. Nema reda za pregled, nema platforme koja može ugasiti listing.
- Svaki widget na sajtu agencije je čvor distribucije koji se ne plaća. "Powered by" na
  besplatnom paketu je jedini mehanizam prepoznatljivosti koji kategorija ima, i
  konkurencija ga baca.
- Isti kod kao faza 1 i 2. Ništa se ne baca.

## Šta ovo nije

Ovo nije promjena cilja. Cilj ostaje sve u jednom oko popravke: nađi, napiši, prikaži,
primijeni, dokaži. Widget je prvi ulaz u tu kuću, ne druga kuća. Kad agencija u
izvještaju vidi gotove popravke i poželi ih primijeniti klijentu, to je prelaz na primjenu
(faza 3), a advokati na WordPressu su prvi kandidati za taj korak.

## Posljedice

- Faza 1 i 2 se spajaju u jedan proizvod od 4 do 6 sedmica: skener, generator popravki,
  obrazac za ugradnju, brendirani izvještaj, dostava leadova.
- WordPress plugin i primjena popravki idu u fazu 3, tek kad agencije to zatraže.
- Cijena widgeta: besplatno s "powered by", oko 39 USD bez, ispod MySiteAuditora.
- Prvih pet agencija dobija widget besplatno u zamjenu za tri brojke koje niko u
  kategoriji nije objavio: audita mjesečno, postotak koji ostavi email, i da li prospekti
  koji vide gotove popravke zakazuju više poziva od onih koji vide ocjenu.
- Kontrola zloupotrebe od prvog dana, jer svaki audit košta inferenciju: Turnstile,
  dnevni limit po agenciji, jedan audit po domenu dnevno, blokada privremenih emailova.
