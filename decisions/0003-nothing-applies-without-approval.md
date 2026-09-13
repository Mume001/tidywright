# 0003 Ništa ne ide uživo bez odobrenja čovjeka

Datum: 12.09.2026.
Status: prihvaćeno

## Kontekst

Pišemo po tuđem produkcijskom sajtu. Rank Math je 31.08.2026. morao pauzirati svoju AI
funkciju jer je tiho pravila WordPress aplikacijske lozinke bez jasne dozvole korisnika.
Kod SearchAtlasa je automatska primjena podrazumijevana, a odobravanje je prekidač koji se
uključuje.

## Odluka

U verziji 1 nema tihe automatske primjene. Svaka popravka čeka odobrenje čovjeka. Prije
svake primjene se pravi snimak, koji se čuva 90 dana i vraća jednim klikom.

## Zašto

- Jedan slomljen produkcijski sajt bez vraćanja unazad uništava proizvod prije nego što
  je počeo.
- Povjerenje je jedina stvar koju prodajemo agencijama, jer one stavljaju svoje ime na
  naš rad.
- Automatska primjena je funkcija koja se uvijek može dodati kasnije, kad postoji istorija
  odobrenih izmjena po pravilima. Obrnuto ne ide.

## Posljedice

- Red popravki i ekran za odobravanje su dio jezgra, ne dodatak.
- Svaka izmjena mora imati zapisan snimak prije i poslije, i dnevnik.
- U marketingu se ovo prodaje kao prednost, ne izvinjenje.
