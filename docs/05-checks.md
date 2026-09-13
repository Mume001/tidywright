# Katalog provjera

Status: **potvrđeno za prvu verziju widgeta 13.09.2026.** Vidi odjeljak "Prva verzija" na dnu.

Legenda ozbiljnosti: K kritično, V visoko, N nisko.
Legenda popravke: A automatska, R ručna (prikazujemo problem, ne popravljamo sami).

## A. Indeksiranje i duplikati

| # | Provjera | Ozb. | Popravka |
|---|---|---|---|
| A1 | www i verzija bez www obje vraćaju 200 | K | A |
| A2 | http ne preusmjerava na https | K | A |
| A3 | canonical oznaka nedostaje | V | A |
| A4 | canonical pokazuje na drugi host nego interni linkovi | V | A |
| A5 | URL u sitemapu vraća 404 ili preusmjerenje | K | A |
| A6 | sitemap ne postoji ili nije naveden u robots.txt | V | A |
| A7 | robots.txt blokira stranicu koja je u sitemapu | K | A |
| A8 | noindex na stranici koja izgleda kao da treba biti indeksirana | K | R |
| A9 | isti title na više stranica | V | A |
| A10 | isti meta opis na više stranica | N | A |
| A11 | lanac preusmjerenja duži od dva koraka | N | A |
| A12 | interni link vodi na 404 | V | A |

## B. Oznake stranice

| # | Provjera | Ozb. | Popravka |
|---|---|---|---|
| B1 | title nedostaje ili je prazan | V | A |
| B2 | title kraći od 15 ili duži od 60 znakova | N | A |
| B3 | title je generički (Home, Untitled, ime teme) | V | A |
| B4 | meta opis nedostaje | V | A |
| B5 | meta opis duži od 160 znakova | N | A |
| B6 | stranica nema H1 | V | A |
| B7 | stranica ima više od jednog H1 | V | A |
| B8 | preskočen nivo naslova, na primjer H2 pa H4 | N | A |

## C. Strukturirani podaci

| # | Provjera | Ozb. | Popravka |
|---|---|---|---|
| C1 | nema Organization ni LocalBusiness bloka | V | A |
| C2 | nema BreadcrumbList na dubljim stranicama | N | A |
| C3 | postojeći JSON-LD ne prolazi validaciju | V | A |
| C4 | naziv, adresa i telefon na sajtu se ne slažu sa schemom | V | R |

## D. Jezik i međunarodno

| # | Provjera | Ozb. | Popravka |
|---|---|---|---|
| D1 | og:locale:alternate postoji a hreflang ne | V | A |
| D2 | hreflang bez povratne veze s druge strane | V | A |
| D3 | html lang nedostaje ili se ne slaže sa sadržajem | N | A |
| D4 | dva jezika na istoj stranici | N | R |

## E. Mediji i sadržaj

| # | Provjera | Ozb. | Popravka |
|---|---|---|---|
| E1 | slika bez alt atributa | N | A |
| E2 | alt je ime fajla, na primjer IMG_2831.jpg | N | A |
| E3 | slika teža od 200 KB | N | R |
| E4 | stranica ispod 200 riječi | N | R |
| E5 | stranica na koju ne vodi nijedan interni link | V | A |

## F. Dijeljenje na mrežama

| # | Provjera | Ozb. | Popravka |
|---|---|---|---|
| F1 | og:title ili og:description nedostaju | N | A |
| F2 | og:image nedostaje ili je logo manji od 600 px | N | R |
| F3 | twitter:card nedostaje | N | A |

## G. Brzina, iz PageSpeed Insights

| # | Provjera | Ozb. | Popravka |
|---|---|---|---|
| G1 | LCP iznad 2,5 sekunde na mobilnom | V | R |
| G2 | CLS iznad 0,1 | V | R |
| G3 | slika bez zadatih dimenzija u HTML-u | N | A |

## Zbir

40 provjera, od toga 28 s automatskom popravkom. To je dovoljno za fazu 1 i pokriva sve
što je pronađeno u ručnom auditu adconnecta.com.

## Prva verzija: 29 provjera na jednoj stranici

Widget skenira jednu stranicu, bez crawla i bez PageSpeeda. Odluka `0005`.

**Ulazi (29):** A1, A2, A3, A4, A6, A7, A8, A11, B1, B2, B3, B4, B5, B6, B7, B8, C1, C2,
C3, D1, D3, D4, E1, E2, E4, F1, F2, F3, plus A6 se provjerava kroz robots.txt i postojanje
sitemap.xml jednim GET-om.

**Čeka fazu 3 (11):**

| # | Zašto ne sad |
|---|---|
| A5, A9, A10, A12, E5 | traže crawl cijelog sajta |
| D2 | traži dohvat svake alternativne jezične verzije |
| C4 | traži izvor istine za naziv, adresu i telefon izvan stranice |
| E3 | traži dohvat svake slike, usporava izvještaj |
| G1, G2, G3 | PageSpeed, 10 do 30 sekundi čekanja |

**Grupe za ocjenu:** Indeksiranje = A, Oznake stranice = B, Strukturirani podaci = C,
Sadržaj i mediji = D + E + F.

Provjere koje ne možemo popraviti (A8, D4, E4, F2) se prikazuju u listi i ulaze u ocjenu.
Kupac treba da vidi cijelu sliku, ne samo ono što mi znamo riješiti.
