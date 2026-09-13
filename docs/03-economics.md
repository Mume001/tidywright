# Brojke

Sve cijene provjerene 12. septembra 2026. na stranicama dobavljača.

## Trošak po sajtu mjesečno

| Stavka | Cijena | Napomena |
|---|---|---|
| Crawl, 4 puta mjesečno | 0,05 USD | vlastiti server, 500 stranica |
| Model piše popravke, ustaljeno | 0,25 USD | oko 50 promijenjenih stranica |
| Model, prvi mjesec za cijeli sajt | 2,25 USD | jednokratno, 500 stranica, Haiku klasa |
| Praćenje pozicija, 50 riječi sedmično | 0,13 USD | DataForSEO, opcionalno |
| Search Console i PageSpeed | 0,00 USD | Googleovi besplatni API-ji |

**Ustaljeno oko 0,45 USD po sajtu mjesečno. Prvi mjesec oko 2,45 USD.**

## Fiksni trošak

Hosting, baza, red poslova i domena: od 50 USD mjesečno na početku do oko 320 USD na
250 kupaca. Nema pretplata na alate.

## Cijene paketa, prijedlog

| Paket | Cijena | Šta sadrži | Ostaje nakon Stripea i podataka | Marža |
|---|---|---|---|---|
| Solo | 29 USD | 1 sajt, do 500 stranica | 27,41 USD | 94,5% |
| Studio | 69 USD | 3 sajta, do 2.000 stranica | 65,71 USD | 95,2% |
| Agency | 199 USD | 15 sajtova, bijela etiketa | 188,88 USD | 94,9% |

Stripe uzima 2,9 posto plus 0,30 USD po transakciji.

**Status: prijedlog, nije potvrđen.** Vidi otvoreno pitanje 3 u `docs/11-open-questions.md`.

## Tri scenarija kroz 24 mjeseca

Ulazne pretpostavke: 20 sati sedmično, bez budžeta za oglase, organski rast.

| Scenarij | Gradnja | Novih mjesečno | Odliv | Kupci m24 | MRR m24 | Ukupno 2 god | Po satu |
|---|---|---|---|---|---|---|---|
| Najgori | 6 mj | 2 | 8,0% | 19 | 711 USD | 6.098 USD | 2,92 USD |
| Osnovni | 4 mj | 7 | 5,5% | 81 | 4.147 USD | 40.912 USD | 19,59 USD |
| Najbolji | 3 mj | 16 | 4,0% | 207 | 13.756 USD | 135.157 USD | 64,73 USD |

Model je u `model/model.py`, brojke u `model/scenarios.json`, prezentacija u
`model/tidywright-scenariji.pdf`.

## Jedina formula koja je bitna

```
plafon kupaca = novi kupci mjesečno / stopa odliva
```

- 2 / 0,08 = 25 kupaca, i tu rast staje zauvijek
- 7 / 0,055 = 127
- 16 / 0,04 = 400

Prepoloviš odliv i plafon se udvostruči bez ijednog novog kupca. Posljedica za proizvod:
funkcija koja zadržava kupca vrijedi više od funkcije koja ga privlači. Zato popravka koja
ostaje u kupčevom sistemu nije marketinška priča nego finansijska odluka.

## Cijene dobavljača, za kasnije

| Dobavljač | Cijena | Smije li se preprodavati |
|---|---|---|
| DataForSEO SERP | 0,60 USD na 1.000 upita | da, uslovi ne zabranjuju |
| DataForSEO Backlinks | 0,024 USD po upitu plus 0,000036 po redu | da |
| Serper.dev SERP | 0,30 USD na 1.000 | da |
| SerpApi | 9,20 do 25 USD na 1.000 | ne, bez pismene dozvole |
| Ahrefs API | od 129 USD mjesečno | **ne**, uslovi zabranjuju gradnju konkurentskog proizvoda |
| Majestic API | 399,99 USD mjesečno | nepotvrđeno |

DataForSEO je jedini čiji uslovi jasno dozvoljavaju gradnju komercijalnog proizvoda.
