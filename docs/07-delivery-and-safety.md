# Kako popravka stiže na sajt i šta ako pukne

Ovo je najosjetljiviji dio proizvoda. Pišemo po tuđem produkcijskom sajtu. Jedan slomljen
sajt bez mogućnosti vraćanja i priča je gotova.

## Prije ičega, dokaz vlasništva

Sajt se ne crawla ozbiljno ni ne dira dok vlasništvo nije dokazano. Tri načina:

1. DNS TXT zapis
2. Odobren pristup Search Consoleu za taj domen
3. Fajl postavljen u korijen sajta

Bez ovoga radi samo plitki javni skener, ograničen na naslovnu i nekoliko stranica.

## Četiri načina isporuke

### 1. WordPress plugin, preporučeno
Piše u bazu sajta kroz postmeta i options. Izmjena postoji u kupčevom sistemu i ostaje kad
se plugin ukloni ili pretplata otkaže. Ovo je glavni put jer je i glavni kanal.

### 2. Pull request u repozitorij
Otvaramo PR na granu, njihov CI se pokreće, njihov tim pregleda, njihov deploy objavljuje.
Ništa se ne upisuje bez spajanja grane. Za sajtove koje vode programeri.

### 3. Patch fajl za preuzimanje
Zip promijenjenih fajlova plus popis izmjena napisan ljudskim jezikom. Za sajtove kojima
nam nije dozvoljen pristup. Ovo je i put za fazu 2, prije nego što plugin postoji.

### 4. Edge worker, zadnja opcija
Prepisuje HTML na CDN-u. Brzo se postavi, ali izmjena živi kod nas i nestaje kad se worker
ukloni. Ovo je tačno ono što radi konkurencija i zato je kod nas posljednje, ne prvo.

## Sigurnosna pravila

1. **Snimak prije svake izmjene.** Čuva se 90 dana. Vraćanje unazad jednim klikom.
2. **Ništa se ne primjenjuje bez odobrenja čovjeka** u verziji 1.
3. **Nikad ne diramo:** fajlove teme, druge pluginove, strukturu baze, sadržaj tijela
   stranice bez izričitog odobrenja, bilo šta izvan potvrđenog domena.
4. **Grupna primjena ide u koracima,** ne sve odjednom, i staje na prvoj grešci.
5. **Svaka izmjena se zapisuje** u dnevnik s vremenom, korisnikom i razlogom. Dnevnik se
   može izvesti.
6. **Plugin traži dozvolu jasno i unaprijed.** Rank Math je u avgustu 2026. morao pauzirati
   funkciju jer je tiho pravio aplikacijske lozinke. To je upozorenje, ne anegdota.

## Šta obećavamo i šta ne

Obećavamo da će izmjene biti tačne, reverzibilne i da ostaju kupcu. **Ne obećavamo
poziciju u pretrazi.** To mora biti u uslovima korištenja i u prodajnom razgovoru, jer je
to obećanje koje je uništilo reputaciju pola ove industrije.

## Otvoreno

- Ograničenje odgovornosti u uslovima korištenja. Treba pravnik, ili bar ozbiljan predložak.
- Šta ako kupac otkaže a izmjene ostanu. Ostaju, to je poenta. Ali treba odlučiti da li
  mu ostaje i mogućnost vraćanja unazad poslije otkazivanja.
- Treba li osiguranje od profesionalne odgovornosti prije prvog agencijskog kupca.
