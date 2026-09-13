# 0002 Ne kupujemo tuđe podatke

Datum: 12.09.2026.
Status: prihvaćeno

## Kontekst

Konkurencija naplaćuje 129 do 139 dolara mjesečno jer plaća indekse backlinkova, baze
volumena ključnih riječi i dnevno struganje rezultata pretrage. Ahrefs ima 493 milijarde
stranica u indeksu linkova i 28,7 milijardi ključnih riječi.

## Odluka

Verzija 1 koristi samo tri izvora: crawl kupčevog sajta, kupčev Search Console preko
OAuth-a, i Googleov besplatni PageSpeed Insights.

## Zašto

- Varijabilni trošak pada na oko 0,45 dolara po sajtu mjesečno, što daje bruto maržu od
  oko 95 posto.
- Search Console daje kupčeve stvarne upite, klikove i pozicije. Za njegov sajt je to
  tačnije od bilo čije procjene.
- Ahrefs u uslovima korištenja izričito zabranjuje gradnju konkurentskog proizvoda na
  njihovom API-ju.
- Sitebulb i Screaming Frog dokazuju da proizvod koji radi samo od crawla može biti posao.

## Posljedice

- Ne možemo prikazati backlinkove, procjenu prometa tuđih domena, ni volumen ključnih
  riječi. To mora biti jasno na cjenovniku, da se ne obećava ono čega nema.
- Ako kupci to budu tražili, DataForSEO je jedini dobavljač čiji uslovi dozvoljavaju
  preprodaju, po 0,60 dolara na 1.000 upita. To je odluka za fazu 4, ne prije.
