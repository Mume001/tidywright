# Backlog iz pregleda F1

Zapisano 14.09.2026. poslije Mumetovog vizuelnog pregleda F1. Ovo su njegove
primjedbe i ideje kako su rečene, razvrstane. Ništa odavde nije odlučeno i
ništa nije u planu gradnje dok se ne pretoči u odluku ili u zadatak.

## A. Izvještaj i poziv na akciju

- Dugme "Book a 20 min call" u podnožju izvještaja ne odgovara. Umjesto poziva
  na razgovor treba voditi na pretplatu, uz poruku da korisnik može spojiti
  svoj sajt pa da se popravke odrade umjesto njega.
- ODLUČENO 14.09.2026: poziv u izvještaju kroz agencijin widget ostaje
  agencijin. Pretplata i poruka "spoji svoj sajt pa da mi to odradimo" idu samo
  na auditu koji ide s našeg sajta. Agencija dobija lead koji je platila, mi
  imamo svoj lijevak. Pitanje 18 je time zatvoreno. Zapisano u `decisions/0010`, tačka 1.
- Pozadina odluke: čiji je taj poziv na akciju. U modelu iz
  `decisions/0004` izvještaj nosi brend agencije, posjetilac je njen lead i
  poziv vodi kod nje. Ako poziv vodi na našu pretplatu, uzimamo agenciji lead
  zbog kojeg je i stavila widget. Vidi pitanje 18 u `11-open-questions.md`.
- Zaglavlje izvještaja: ime agencije stoji na svakom izvještaju, a kad agencija
  nema upisan logo generiše se krug s početnim slovom (npr. "N" za Northwind
  Digital). To je namjerno i ostaje dok upload loga ne dođe u B1.

## B. Dizajn

- NIJE NAŠE: zaglavlje koje je izgledalo jeftino, i lomljenje stavki menija na
  390 px, pripada lažnom sajtu agencije u `apps/web/public/test-embed.html`.
  Ta stranica postoji samo da se widget isproba kao kod prave agencije i nikad
  se ne isporučuje. Ne dirati.
- Zahtjev za ozbiljnijim zaglavljem i za burger menijem na telefonu vrijedi za
  naša dva stvarna mjesta: marketinški sajt u F3 (`docs/28-marketing-site.md`)
  i hostovani obrazac `/a/[slug]`, koji danas nema zaglavlje uopšte.
- Podnožje izvještaja treba bolje izgledati. Danas je jedan red sitnog teksta:
  ime i adresa agencije, politika privatnosti, odjava, i "Powered by Tidywright"
  na besplatnom paketu.
- Crni krug sa slovom N u uglu snimaka je Next.js razvojna alatka, ne naš UI.
  Ne vidi se u produkcijskom buildu.

## C. Pouzdanost audita

- Stanja `failed:fetch` i `failed:blocked` su prihvatljiva kako izgledaju, ali
  cilj je da se do njih dolazi što rjeđe.
- Zadatak: popisati sve razloge zbog kojih audit može pasti ili biti blokiran,
  i za svaki naći način da se izvještaj ipak isporuči. Rezultat ide u zaseban
  dokument, ne ovdje.
- URAĐENO: `36-fetch-reliability.md`. Iz toga su izašla dva zadatka: preduslov za
  B2 u `31-build-plan.md` (kategorija prema Cloudflareu i Verified Bots), i
  kaskada dohvata s djelimičnim izvještajem u `17-backend-spec.md`.

## D. Djelotvornost popravki

- Pitanje: koliko naše popravke stvarno pomažu. Da se ne desi da kupac poslije
  mjesec dana vidi da se ništa nije pomjerilo.
- Treba istražiti koje od 176 provjera imaju mjerljiv uticaj na rangiranje i u
  kojem roku, i po čemu se rezultat mjeri. Rezultat ide u zaseban dokument.
- URAĐENO: `35-fix-effectiveness.md`. Iz toga je izašla odluka o tome šta smijemo
  obećati (`decisions/0010`, tačka 3) i oznaka uticaja po provjeri u `05-checks.md`.

## E. Vlastita vidljivost kroz kupčeve sajtove

- ODBAČENO 14.09.2026. Ideja je bila koristiti rad na kupčevim sajtovima da se
  gura naša vidljivost. Ubacivanje linkova prema nama radi rangiranja je shema
  linkova po Googleovim pravilima o spamu i nosi kaznu i nama i kupcu. Mi
  prodajemo SEO, pa bi nas to koštalo dvostruko. Ne radi se. Zapisano u `decisions/0010`,
  tačka 2.
- Ostaje dopušteno i nesporno: "Powered by" oznaka sa rel="nofollow sponsored",
  studije slučaja uz pristanak, javni popis agencija, recenzije.

## F. Kolačići i pristanak

- Treba dodati traku za kolačiće i evidenciju pristanka.
- Veže se na `docs/23-compliance.md` i na to da widget danas namjerno ne pravi
  kolačiće.
- ZATVORENO 15.09.2026. odlukom `decisions/0011`, tačka 2: nema trake u widgetu, ali
  aplikacija i marketinški sajt dobijaju svoja pravila. Pitanje 20.

## G. Newsletter

- Kad posjetilac pošalje obrazac, prijava ide i na newsletter.
- Treba postojati i zasebna prijava samo na newsletter, bez audita.
- Veže se na pristanak iz F, jer marketinški pristanak mora biti odvojen od
  slanja izvještaja.
- Otvoreno kao pitanje 21 u `11-open-questions.md`.

## H. Zadržavanje na odjavi

- Na stranici odjave ponuditi popust da korisnik ostane još mjesec ili dva.
- Cilj koji je naveden: zadržati mogućnost slanja reklama na te adrese.
- Napomena: popust pri odjavi je u redu, ali odjava mora ostati moguća u jednom
  koraku i bez uslova. Ovo treba provjeriti uz `docs/23-compliance.md`.
- Otvoreno kao pitanje 22 u `11-open-questions.md`.

## I. Brending

- Cijeli brend mora biti na naše ime. Ime treće firme se ne spominje, bez
  obzira što koristimo tuđe servise za dijelove audita.
- Treba razlučiti na koji sloj se ovo odnosi: izvještaj koji vidi posjetilac
  nosi brend agencije po modelu bijele etikete, aplikaciju koju vidi agencija
  nosi naš brend, a imena dobavljača se ne vide nigdje.
- Provjeriti uslove korišćenja svakog vanjskog servisa, jer neki traže vidljivo
  navođenje izvora.
- Otvoreno kao pitanje 23 u `11-open-questions.md`.

## J. Dva segmenta umjesto samo agencija

Mume 14.09.2026: fokus ne smiju biti samo agencije, treba i vlasnici sajtova
koji hoće sami sebi urediti sajt, jer ih ima daleko više.

Istraživanje je u `37-self-serve-segment.md`. Sažetak nalaza:

- Vlasnika sajtova ima 10 do 20 puta više. Oko 10 do 13 miliona sajtova na
  WordPressu i Shopifyju u engleskom govornom području, naspram oko 80 do 150
  hiljada agencija koje stvarno kupuju alate.
- Ali dozvoljeni trošak sticanja kupca je oko 137 dolara za vlasnika sajta i
  oko 2.100 dolara za agenciju, razlika od petnaest puta. Agencije se mogu
  aktivno prodavati, vlasnici sajtova samo organski.
- Zadržavanje: AI proizvodi ispod 50 dolara mjesečno imaju bruto zadržavanje
  prihoda od 23 posto godišnje. Godišnji plan umjesto mjesečnog diže godišnje
  zadržavanje sa 41 na 62 posto u toj cjenovnoj klasi.
- Rupa na tržištu je stvarna i tačno tamo gdje smo mi: alat od 19 do 39 dolara
  koji zaista upisuje izmjenu u CMS, sa pregledom i poništavanjem. Search Atlas
  OTTO to radi ali na agencijskoj cijeni i sa ocjenom 1,8 od 5 na Shopify App
  Storeu zbog nenadzirane primjene.

PREPORUKA koja čeka Mumetovu odluku: agencije ostaju prvi kanal koji naplaćuje,
ali besplatni javni audit na našem domenu se pravi odmah i služi oba segmenta.
Self-serve pretplata se otvara tek kad primjena ispravki ima izmjerenu stopu
neuspjeha ispod praga. Vidi "Preporuka" u `37-self-serve-segment.md`.

Test koji mijenja preporuku, i koji je jeftin: ako besplatni audit na našem
domenu pretvori više od 25 posto korisnika u povezan sajt, ide se self-serve
prvo. Treba samo audit stranica i oko 2.000 posjetilaca.

Pitanje 19 u `11-open-questions.md`. Model podataka je ODLUČEN 15.09.2026.
(`decisions/0011`, tačka 1) i B1 je odblokiran. Sekvenca kanala ostaje otvorena
i čeka mjerenje, ne odluku: prag od 25 posto, mjerljiv tek poslije F3.

## K. Vezano istraživanje

- `35-fix-effectiveness.md` - koliko popravke stvarno vrijede, koliko traje da
  se vidi rezultat, šta smijemo obećati.
- `36-fetch-reliability.md` - svi razlozi zašto audit pada ili biva blokiran i
  rješenje za svaki.
- `37-self-serve-segment.md` - vlasnici sajtova naspram agencija.
