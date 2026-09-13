# 0005 Opseg prve verzije widgeta

Datum: 13.09.2026.
Status: prihvaćeno

## Kontekst

Odluka 0004 je widget stavila kao prvi proizvod. Ostala su tri pitanja opsega: koje
popravke se prikazuju gotove, kako izgleda ocjena, i da li se zove PageSpeed.

## Odluka

1. **Tri gotove popravke: title, meta opis, JSON-LD blok.** Ako je neka od te tri na
   stranici već u redu, na njeno mjesto ulazi sljedeća po prioritetu: H1, Open Graph
   oznake, alt tekstovi za do tri slike.
2. **Ocjena 0 do 100 sa četiri podocjene** iste težine: Indeksiranje, Oznake stranice,
   Strukturirani podaci, Sadržaj i mediji. Unutar grupe kritičan nalaz nosi 3, visok 2,
   nizak 1.
3. **PageSpeed se ne zove u prvoj verziji.** Dolazi u fazi 3 uz nalog vlasnika sajta.
4. **Widget skenira jednu stranicu**, onu koju posjetilac unese. Bez crawla.

## Zašto

- Svih 12 provjerenih konkurenata daje jednu glavnu ocjenu i obojene podocjene. Agencije
  to već znaju objasniti klijentu. Ne mijenjamo oblik koji tržište zna, mijenjamo sadržaj.
- Title, meta i schema su tri stvari koje skoro svaki mali sajt ima pokvarene, koje se
  mogu napisati iz sadržaja same stranice bez izmišljanja, i koje izgledaju najuvjerljivije
  kad ih prospekt vidi gotove pored svojih starih.
- Žalbe na konkurenciju su "generične preporuke" i "previše tehnički za klijenta".
  Gotova popravka rješava oboje.
- PageSpeed dodaje 10 do 30 sekundi čekanja na izvještaj. Widget živi ili umire na tome
  da posjetilac ostavi email i vidi rezultat prije nego što ode. Uz to, brzina je jedina
  stvar koju ne možemo popraviti, pa u izvještaju koji prodaje popravke nema šta tražiti.
- Jedna stranica umjesto crawla: izvještaj za 5 sekundi umjesto za minutu, deset puta
  manji trošak po auditu, i nema robots.txt dileme oko sajta koji nam nije dao dozvolu.

## Posljedice

- Iz kataloga od 40 provjera u prvu verziju ulazi 29 koje rade na jednoj stranici. Lista
  je u `docs/05-checks.md`, odjeljak "Prva verzija".
- Grupa G (brzina) i sve provjere koje traže crawl (A5, A9, A10, A12, D2, E5) čekaju
  fazu 3.
- Specifikacija za gradnju je u `docs/13-widget-spec.md`.
