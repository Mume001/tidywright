# Mapa proizvoda

Sve površine, svi tipovi korisnika, i koja faza donosi koji ekran. Ovo je dokument koji
odgovara na pitanje "šta je sve unutra". Detalji svakog ekrana su u `15-frontend-spec.md`.

## Tri domene

| Domena | Šta služi | Brend vidljiv |
|---|---|---|
| tidywright.com | marketing sajt, prijava, dokumentacija za ugradnju | da |
| app.tidywright.com | aplikacija za agencije, kasnije i za vlasnike sajtova | da |
| siteauditserver.com | embed skripta, obrazac u iframeu, hostovani obrazac, izvještaji, PDF, odjava s liste | **nikad**, osim "powered by" na besplatnom paketu |

Razlog za treću domenu: na plaćenom paketu agencija prodaje izvještaj pod svojim imenom.
Posjetilac ne smije nigdje vidjeti naš brend, ni u URL-u, ni u naslovu kartice, ni u
emailu. SEOptimer to radi na websiteauditserver.com.

## Tipovi korisnika

| Uloga | Ko je | Gdje živi | Faza |
|---|---|---|---|
| Posjetilac (visitor) | anonimna osoba na sajtu agencije koja unese URL i email | siteauditserver.com | 1 |
| Vlasnik agencije (owner) | osoba koja je napravila nalog, plaća, upravlja svime | app | 1 |
| Administrator agencije (admin) | član kojem je vlasnik dao sva prava osim naplate i brisanja naloga | app | 2 |
| Član agencije (member) | vidi leadove i audite, ne mijenja podešavanja | app | 2 |
| Klijent agencije (client) | vlasnik sajta kojeg je agencija pozvala da gleda svoj sajt i odobrava popravke | app | 3 |
| Osoblje (staff) | mi, interno: pregled naloga, troškova, zloupotrebe | app/admin | 1 |

## Površine po fazi

### Faza 1: widget (4 do 6 sedmica)

| Površina | Ekrani |
|---|---|
| Embed | skripta, obrazac u iframeu sa 5 stanja, hostovani obrazac |
| Izvještaj | javna stranica izvještaja, stanje u toku, stanje greške, odjava |
| App | prijava, registracija, zaboravljena lozinka, onboarding (3 koraka), pregled, leadovi, lead, auditi, audit, kod za ugradnju, brendiranje, podešavanja |
| Admin | lista agencija, lista audita, troškovi, zloupotreba, prekidači |
| Marketing | naslovna, cijene, dokumentacija za ugradnju, uslovi, privatnost, DPA |

### Faza 2: naplata i tim (2 do 3 sedmice)

| Površina | Ekrani |
|---|---|
| App | naplata (plan, promjena, fakture, portal), tim (članovi, pozivnice, uloge), webhook, izvoz |
| Izvještaj | bez "powered by" na plaćenom, PDF |
| Marketing | stranica za agencije, stranica poređenja s konkurencijom |

### Faza 3: primjena popravki (6 do 8 sedmica)

| Površina | Ekrani |
|---|---|
| App, sajtovi | lista sajtova, dodavanje sajta (čarobnjak), pregled sajta, nalazi, red popravki, pregled jedne popravke, search podaci, konekcije, istorija |
| App, klijent | portal klijenta: njegov sajt, odobravanje popravki, izvještaji |
| Konektori | WordPress plugin (zaseban repozitorij), GitHub App, patch izvoz |

Ovih osam ekrana je već dizajnirano u `design/`.

### Faza 4: zadržavanje (poslije prihoda)

| Površina | Ekrani |
|---|---|
| App | mjesečni izvještaji, zakazivanje, bijela etiketa s vlastitom domenom, API ključevi, praćenje pozicija ako ga traže |

## Glavni tokovi

### Tok 1: posjetilac dobije izvještaj (faza 1)

```
sajt agencije  ->  obrazac (iframe)  ->  URL + email + pristanak  ->  Turnstile
   ->  POST /api/audits  ->  redirect ili inline na /r/<token>  (stanje: u toku)
   ->  radnik: fetch, provjere, ocjena, 3 popravke  ->  izvještaj gotov
   ->  email posjetiocu (link)  ->  email agenciji (lead)  ->  webhook agenciji
```

### Tok 2: agencija se registruje i ugradi widget (faza 1)

```
/signup  ->  potvrda emaila  ->  /onboarding/1 ime i slug
   ->  /onboarding/2 logo, boja, poziv  ->  /onboarding/3 kod za ugradnju + test
   ->  /overview (prazno stanje s uputstvom)
```

### Tok 3: agencija plati (faza 2)

```
/billing  ->  Stripe Checkout  ->  webhook  ->  entitlements  ->  "powered by" nestaje
```

### Tok 4: agencija spoji klijentov sajt i primijeni popravke (faza 3)

```
/sites/new  ->  URL  ->  dokaz vlasništva (DNS ili GSC ili fajl)  ->  način isporuke
   ->  crawl 500 stranica  ->  nalazi  ->  generisanje popravki  ->  red
   ->  odobrenje (agencija ili klijent)  ->  snimak  ->  primjena  ->  dnevnik
   ->  Search Console pokazuje efekat
```

## Šta nikad ne ulazi

Indeks backlinkova, volumen ključnih riječi, procjena prometa tuđih domena, tiha
automatska primjena. Vidi `decisions/0002` i `0003`.
