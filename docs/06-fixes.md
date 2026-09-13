# Kako se popravka pravi

Popravke se dijele na dvije vrste, i ta podjela je važna za trošak i za povjerenje.

## Determinističke popravke, bez modela

Ove se računaju iz pravila. Nema modela, nema troška, nema nepredvidivosti.

| Oznaka | Šta radi | Iz koje provjere |
|---|---|---|
| D-REDIRECT | Generiše 301 pravilo za jednu adresu | A1, A2, A11 |
| D-CANONICAL | Upisuje canonical prema izabranoj adresi | A3, A4 |
| D-SITEMAP | Ponovo gradi sitemap samo od URL-ova koji vraćaju 200 | A5, A6 |
| D-ROBOTS | Čisti robots.txt, uklanja pravila koja blokiraju indeksirane stranice | A6, A7 |
| D-HREFLANG | Gradi potpun skup hreflang oznaka s povratnim vezama | D1, D2 |
| D-HEADING | Spušta višak H1 na H2, popravlja preskočene nivoe | B7, B8 |
| D-LANG | Postavlja html lang | D3 |
| D-DIMS | Dodaje width i height slikama | G3 |
| D-TWITTER | Dodaje twitter:card iz postojećih og oznaka | F3 |

## Popravke koje piše model

| Oznaka | Šta radi | Iz koje provjere |
|---|---|---|
| M-TITLE | Piše title | B1, B2, B3, A9 |
| M-META | Piše meta opis | B4, B5, A10 |
| M-H1 | Piše H1 kad ga nema | B6 |
| M-ALT | Piše alt tekst | E1, E2 |
| M-SCHEMA | Gradi LocalBusiness, Organization ili BreadcrumbList | C1, C2, C3 |
| M-LINKS | Predlaže interne linkove ka stranici siročetu | E5 |
| M-OG | Piše og:title i og:description | F1 |

## Pravila za sve popravke koje piše model

1. **Model ne smije izmisliti činjenicu.** Ulaz je samo ono što postoji na stranici:
   vidljivi tekst, postojeće oznake, imena fajlova slika, okolni pasus, i podaci iz Search
   Consolea za tu stranicu. Ako podatak ne postoji, popravka se ne nudi.
2. **Izlaz je uvijek struktura, ne proza.** Model vraća JSON s poljima, ne rečenicu.
3. **Validacija prije nego što se popravka uopšte pokaže kupcu:**
   - title između 15 i 60 znakova, jedinstven na cijelom sajtu
   - meta opis između 70 i 160 znakova, jedinstven
   - alt tekst do 125 znakova, bez fraze "slika od"
   - JSON-LD mora proći schema.org validaciju
   - nijedno preusmjerenje ne smije praviti petlju
4. **Obrazloženje je dio popravke.** Svaka popravka nosi dva do tri razloga, i bar jedan
   mora biti vezan za stvarni podatak, na primjer poziciju iz Search Consolea.

## Trošak

Cijeli sajt od 500 stranica jednom: oko 2,25 USD na Haiku klasi modela, oko 0,50 USD na
jeftinijem modelu. Poslije toga samo promijenjene stranice, oko 0,25 USD mjesečno.
Grupna obrada je upola jeftinija i početni prolaz nije hitan, pa ide kroz nju.

Alt tekstovi su zamka: ako se rade s vidom po slici, 1.500 slika je dodatnih 2,40 USD.
Pisanje alt teksta iz imena fajla, naslova i okolnog pasusa je gotovo besplatno i dovoljno
dobro za većinu slika. Vid po slici je dodatna opcija koja se plaća, ne podrazumijeva se.

## Otvoreno

- Koji model za koji zadatak. Jeftini za masovne alt tekstove, jači za title i meta?
- Da li kupcu dati da uređuje popravku prije primjene, ili samo da odobri ili odbije?
