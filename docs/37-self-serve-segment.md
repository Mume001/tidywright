# 37. Self-serve segment: vlasnici sajtova naspram agencija

Datum: 14. septembar 2026.
Status: istraživanje za odluku o sekvenci kanala
Autor: research pass, izvori navedeni uz svaku brojku

## Kratak odgovor

Da, agencije treba da ostanu prvi kanal koji naplaćujemo, ali ne zato što je taj segment veći, nego zato što je jedini koji može da plati dovoljno i da podnese nezreo apply engine. Vlasnici sajtova jesu deset do dvadeset puta brojniji, ali brojke o zadržavanju su nemilosrdne: AI proizvodi ispod 50 dolara mjesečno imaju bruto zadržavanje prihoda od svega 23 posto godišnje, a 22,1 posto novih američkih firmi se ugasi u prvoj godini poslovanja. Ono što za self-serve treba uraditi odmah nije poseban proizvod nego jedna zajednička stvar: besplatni javni audit na našem domenu, koji istovremeno hrani agencijski lead widget i budući self-serve funel. Self-serve pretplatu otvoriti tek kada apply engine ima izmjerenu stopu neuspjeha ispod praga i kada postoje preview, odobravanje i undo, jer prvi slomljeni sajt kod netehničkog vlasnika košta više nego deset agencijskih pretplata. Dakle: agencije prve za prihod, self-serve infrastruktura paralelno od prvog dana, self-serve naplata u drugoj fazi, najranije za šest do devet mjeseci.

---

## 1. Veličina segmenata

### 1.1 Agencije u engleskom govornom području

Ovdje je najveći problem to što zvanične statistike broje registrovane subjekte, a ne firme koje zaista kupuju softver. IBISWorld kategorija "SEO & Internet Marketing Consultants" u SAD-u uključuje svakog samostalnog konsultanta sa registrovanim poslom.

| Tržište | Registrovani subjekti | Godina i izvor | Procjena realnih kupaca alata |
|---|---|---|---|
| SAD, SEO i internet marketing konsultanti | 362.753 | 2025, [IBISWorld](https://www.ibisworld.com/united-states/number-of-businesses/seo-internet-marketing-consultants/4523/), rast 19,1 posto godišnje | 60.000 do 120.000 (uključujući solo operatere) |
| Velika Britanija, digitalne agencije | 7.636 | 2023, IBISWorld preko [Aqueous Digital](https://www.aqueous-digital.co.uk/articles/how-many-digital-marketing-agencies-are-there-in-the-uk/), rast 6 posto godišnje -> oko 9.000 u 2026 (procjena) | 6.000 do 9.000 |
| Australija, digitalne ad agencije | 9.418 | 2026, IBISWorld preko [Brightlabs](https://www.brightlabs.com.au/insights/digital-marketing-agencies-australia) | 5.000 do 8.000 |
| Kanada | nema direktne objavljene cifre | procjena po odnosu BDP-a i broja firmi prema SAD-u | 6.000 do 12.000 |
| Irska, Novi Zeland, ostalo | nema direktne cifre | procjena | 2.000 do 4.000 |
| **Ukupno** | **oko 400.000 registrovanih** | | **oko 80.000 do 150.000 realnih kupaca softvera** |

Sve osim prva tri reda su moje procjene, ne izvorne brojke. Nesigurnost je ogromna i ide u oba smjera.

Struktura segmenta je važnija od veličine. Prema zbirnim podacima u [Arvow pregledu SEO agencijske industrije](https://arvow.com/blog/seo-agency-statistics-2026):

- 70 posto SEO agencija ima ispod 50.000 dolara mjesečnog ponavljajućeg prihoda
- 35,6 posto su solo operacije, 37 posto ima 2 do 10 zaposlenih
- prosječan mjesečni retainer po Ahrefs anketi (439 profesionalaca) je 3.209 dolara, ali po Backlinko anketi (300+ profesionalaca) najčešći retainer je 501 do 1.000 dolara, a 64 posto je ispod 1.000 dolara mjesečno
- 86 posto agencija ima retainere ispod 10.000 dolara mjesečno (SparkToro, 376 agencija)

Zaključak: agencijski segment je uzak i siromašniji nego što izgleda. Prava meta je agencija sa 5 do 50 klijenata, to jest gornjih 20 do 30 posto registrovanih subjekata.

### 1.2 Mali biznisi i njihovi sajtovi

| Tržište | Broj malih firmi | Godina i izvor |
|---|---|---|
| SAD | 36,2 miliona | 2025, [SBA Office of Advocacy](https://advocacy.sba.gov/2025/06/30/new-advocacy-report-shows-the-number-of-small-businesses-in-the-u-s-exceeds-36-million/) |
| Velika Britanija | 5,7 miliona privatnih firmi, od toga 5,4 miliona mikro | 1. januar 2025, [House of Commons Library](https://commonslibrary.parliament.uk/research-briefings/sn06152/) |
| Kanada | 1,08 miliona malih firmi sa zaposlenima (bez samozaposlenih) | decembar 2024, [ISED Key Small Business Statistics 2025](https://ised-isde.canada.ca/site/sme-research-statistics/en/key-small-business-statistics/key-small-business-statistics-2025) |
| Australija | oko 2,5 miliona (procjena) | ABS, procjena |
| Novi Zeland, Irska | oko 0,9 miliona (procjena) | procjena |
| **Ukupno** | **oko 46 do 48 miliona** | mješavina zvaničnih i procijenjenih |

Prema [Clutch anketi State of Small Business Websites 2025](https://clutch.co/resources/state-of-small-business-websites-2025), 83 posto malih firmi ima sajt. Taj uzorak je nagnut ka većim malim firmama, pa za cijelu populaciju uključujući samozaposlene realnije je 55 do 70 posto. To daje **oko 26 do 33 miliona sajtova malih firmi u engleskom govornom području**. To je procjena, ne mjerenje.

### 1.3 Sajtovi po platformi

Ukupan kontekst: [Netcraft preko Siteefy](https://siteefy.com/how-many-websites-are-there/), jul 2026, navodi 1,49 milijardi registrovanih sajtova, ali samo 216,7 miliona aktivnih (14 posto). Ostalo su parkirani domeni.

| Platforma | Udio među sajtovima sa CMS-om ([W3Techs](https://w3techs.com/technologies/overview/content_management), 14.9.2026) | Apsolutan broj živih sajtova | Može li treća strana pisati izmjene |
|---|---|---|---|
| WordPress | 58,8 posto (40,3 posto svih sajtova) | 37,3 miliona aktivnih ([BuiltWith preko WPZOOM](https://www.wpzoom.com/blog/wordpress-statistics/)) | Da, potpuno, preko plugina ili REST API-ja |
| Shopify | 7,8 posto | 6,9 miliona detektovanih, realno 2,5 do 3,5 miliona živih ([ecomm.design](https://ecomm.design/how-many-shopify-stores-are-there/)) | Da, preko Admin API-ja i metafields, ali ne slobodno u temu |
| Wix | 6,2 posto | oko 8 do 9 miliona premium pretplata (procjena; posljednji objavljeni podatak je 6 miliona iz 2022) | Vrlo ograničeno, zatvorena platforma |
| Squarespace | 3,5 posto | 5,82 miliona pretplata (procjena 2026, [Backlinko](https://backlinko.com/squarespace-users)) | Vrlo ograničeno |
| Joomla | 1,6 posto | | Da |
| Webflow | 1,2 posto | oko 0,8 do 1,2 miliona (procjena) | Da, preko API-ja |
| Drupal | 0,9 posto | | Da |
| Bez CMS-a, custom | 31,5 posto svih sajtova | | Ne, osim preko JS overlay-a ili edge rewrite-a |

Geografija Shopify-a je povoljna: SAD 3.748.162 detektovanih prodavnica, UK 245.285, Australija 171.387, Kanada 137.174.

WooCommerce ima oko 4,08 miliona živih prodavnica, 29,7 posto e-commerce tržišta.

**Stvarno adresabilno tržište za proizvod koji PIŠE izmjene**, uz pretpostavku da ciljamo samo WordPress i Shopify na engleskom jeziku:

- WordPress: od 37,3 miliona živih, oko 55 do 60 posto na engleskom, od toga oko 40 do 50 posto poslovni sajtovi -> **8 do 11 miliona**
- Shopify: od 2,5 do 3,5 miliona živih, oko 70 posto u engleskim tržištima -> **1,8 do 2,4 miliona**
- Ukupno: **oko 10 do 13 miliona sajtova**

To su moje procjene sa dva sloja pretpostavki. Ali čak i pesimistična verzija je red veličine veća od agencijskog segmenta.

### 1.4 Ko radi SEO sam, a ko plaća nekoga

Ovo je najslabije dokumentovano pitanje u cijelom istraživanju i tu je najveća nesigurnost.

Šta imamo:

- [Clutch 2025](https://clutch.co/resources/state-of-small-business-websites-2025): sajt gradi agencija u 45 posto slučajeva, interno u 37 posto, freelancer u 9 posto, sam vlasnik u 9 posto. Platforme: 41 posto no-code (Wix, Squarespace), 34 posto low-code (WordPress, Shopify), 12 posto custom. **37 posto planira investirati u SEO u narednih 12 mjeseci.**
- [Backlinko SEO Services Report](https://backlinko.com/seo-services-statistics): 65 posto vlasnika malih firmi je bar jednom radilo sa SEO pružaocem usluge, 25 posto sa tri ili više. Prosječan boravak kod jednog pružaoca je 2 do 3 godine. **Samo 30 posto bi preporučilo svog trenutnog pružaoca.**
- Isti izvor: prosječna potrošnja malih firmi na SEO usluge bila je 497,16 dolara mjesečno, ali polovina troši ispod 1.000 dolara godišnje, a 14 posto preko 5.000 dolara godišnje.

Spojeno u grubu sliku, i ovo je izvedeno a ne izmjereno:

| Grupa | Procijenjen udio malih firmi sa sajtom |
|---|---|
| Nikada nije radila ništa oko SEO-a | 35 do 45 posto |
| Radi nešto sama, povremeno, bez plana | 25 do 35 posto |
| Plaća agenciju ili freelancera trenutno | 15 do 25 posto |
| Plaća, ali je nezadovoljna i traži zamjenu | veliki dio prethodne grupe (70 posto ne bi preporučilo svog pružaoca) |

Prva i druga grupa su self-serve meta. Treća je agencijska. Četvrta je najzanimljivija: to su ljudi koji su platili 500 do 3.000 dolara mjesečno, nisu zadovoljni, i spremni su probati alat od 29 dolara.

---

## 2. Spremnost i sposobnost plaćanja

### 2.1 Kontekst budžeta

- Prosječna mala firma troši oko **534 dolara mjesečno na kompletan marketing** ([Revenue Memo zbirka](https://www.revenuememo.com/p/small-business-marketing-budget-statistics)). Firme sa 10 ili manje zaposlenih su 31 posto vjerovatnije u grupi ispod 500 dolara mjesečno.
- Marketinška tehnologija je 27,9 posto ukupne marketinške potrošnje. To znači oko 150 dolara mjesečno za sav softver, od CRM-a do email alata.
- SEO je jedan od najmanje pet alata koji se takmiče za tih 150 dolara.

To je najvažnija brojka u cijelom dokumentu. **Realan prostor za jedan SEO alat kod netehničkog vlasnika jednog sajta je 15 do 40 dolara mjesečno.**

### 2.2 Cjenovne tačke konkurencije, self-serve traka

| Alat | Besplatno | Ulazna cijena | Sljedeći nivo | Napomena |
|---|---|---|---|---|
| Yoast SEO | Da, 10 miliona+ instalacija | 118,80 dolara godišnje (oko 9,90 mjesečno) | jedan nivo | [Yoast shop](https://yoast.com/shop/) |
| Rank Math | Da, 4 miliona+ instalacija | 7,99 eura mjesečno (godišnje) | 24,99 i 54,99 eura | [Rank Math pricing](https://rankmath.com/pricing/) |
| Squirrly SEO | Da, 30.000+ instalacija | 9,99 dolara mjesečno | 51,20 i 71,99 dolara | [Squirrly pricing](https://plugin.squirrly.co/squirrly-seo-pricing/) |
| SEOptimer | Ne, samo demo | 29 dolara mjesečno (DIY) | 39 i 59 (white label, embed) | [SEOptimer pricing](https://www.seoptimer.com/pricing) |
| Screpy | Ograničeno | 6 dolara mjesečno | 15 i 30 dolara | [Screpy pricing](https://screpy.com/pricing) |
| Seobility | Da, 1 projekat, 1.000 stranica | 49,90 eura mjesečno | 179,90 eura (agencija) | [Seobility](https://www.seobility.net/en/pricing/) |
| SEOJuice | Da, ispod 100 stranica uz backlink | 24 eura mjesečno | | [SEOJuice](https://seojuice.com/) |
| Seona AI | 7 dana probno | 64,99 dolara mjesečno | 129,99 dolara | [pregled](https://insights.velocityaipartners.co/tools/seona-ai) |
| Surfer | Ne | 49 dolara mjesečno (godišnje) | 99, 182, 299 dolara | [Surfer pricing](https://surferseo.com/pricing/) |
| Sitechecker | Probno | 99 dolara mjesečno | 249 i 449 dolara | [Sitechecker](https://www.xpay.sh/saas-pricing/sitechecker/) |
| Search Atlas OTTO | Ne | 99 dolara mjesečno | 199, 399, 999 dolara | [OTTO review](https://crawlraven.com/blog/otto-seo-review) |
| Shopify SEO aplikacije (TinyIMG, Smart SEO, Booster, AVADA) | Da, skoro sve | 10 do 24 dolara mjesečno | 35 do 99 dolara | [pregled](https://searchatlas.com/blog/shopify-seo-apps/) |
| BrightLocal | 14 dana probno | od 39 dolara mjesečno | Managed SEO 1.299 dolara | [BrightLocal](https://www.brightlocal.com/pricing/) |

### 2.3 Cjenovne tačke, agencijska traka

| Alat | Cijena | Šta agencija dobija |
|---|---|---|
| SEOptimer White Label + Embedding | 59 dolara mjesečno | embed audit widget, 50 crawlova, 5 korisnika, 10 sajtova |
| MySiteAuditor Professional | 79 dolara mjesečno | neograničeni embed formati, CRM integracije. [MySiteAuditor](https://mysiteauditor.com/) |
| AgencyAnalytics | 20 dolara po klijentu mjesečno (godišnje), 25 mjesečno | white label, neograničeni korisnici, 85+ integracija. [AgencyAnalytics](https://agencyanalytics.com/pricing) |
| Seobility Agency | 179,90 eura mjesečno | 15 projekata, 1.500 ključnih riječi |
| Semrush (nova struktura od 2026) | 139, 199, 299, 549 dolara mjesečno | white label je sada dodatak Pro Report za 20 dolara, Agency Growth Kit 69 do 249 dolara. [pregled](https://ecommerceparadise.com/semrush-pricing/) |
| Search Atlas Agency | 999 dolara mjesečno | 10 projekata, white label |
| Insites | cijena na upit, enterprise | widget, lead kvalifikacija. [Insites](https://insites.com/lead-generation-seo-audit-widget) |

### 2.4 Gdje je plafon

Za netehničkog vlasnika jednog sajta:

- **0 do 15 dolara mjesečno**: potpuno komforan. Ovdje su Yoast, Rank Math, Squirrly, Shopify aplikacije. Ali ovo je i zona gdje je besplatno stvarni konkurent.
- **19 do 39 dolara mjesečno**: realna zona za proizvod koji radi nešto što besplatni plugin ne radi. SEOptimer je tačno tu sa 29 dolara. Ovo je naša zona.
- **49 do 79 dolara mjesečno**: moguće, ali samo ako je proizvod pozicioniran kao **zamjena za agenciju**, a ne kao alat. Seona AI radi na 64,99 dolara upravo tako. Konverzija će biti znatno niža i očekivanja klijenta znatno veća.
- **99 dolara i više**: praktično nemoguće za jedan sajt bez ljudske usluge uz njega. Tu OTTO i Sitechecker prodaju agencijama, ne vlasnicima.

Za agenciju plafon je sasvim drugi: agencija koja naplaćuje 1.000 do 3.000 dolara mjesečno po klijentu i ima 15 klijenata bez problema plaća 150 do 400 dolara mjesečno za alat koji joj štedi 10 sati. Odnos vrijednosti je 10 do 30 puta bolji.

---

## 3. Konkurencija u self-serve traci za ne-eksperte

### 3.1 Tabela pozicioniranja

| Proizvod | Pozicija | Cijena | Šta AUTOMATIZUJE | Šta NE radi |
|---|---|---|---|---|
| **Yoast SEO** | Standard za WordPress, edukativan, "zeleno svjetlo" | Besplatno + 118,80 dolara godišnje | Sitemap, canonical, schema, breadcrumbs, redirecti (premium), interni linkovi kao prijedlozi | Ne piše sadržaj za tebe. Kaže ti da je meta description predug, ne prepravi ga i ne objavi. Nema crawl cijelog sajta. Radi samo unutar WordPress-a |
| **Rank Math** | Jeftinija i tehnički bogatija alternativa Yoastu | Besplatno + 7,99 eura mjesečno | Sve kao Yoast plus IndexNow, automatske schema, 404 monitor, Content AI kao dodatak | Isto: dijagnoza i polja, ne autonomna primjena. Samo WordPress |
| **Squirrly SEO** | "SEO za ljude koji ne znaju SEO", AEO i GEO pozicioniranje | Besplatno + 9,99 dolara mjesečno | Live Assistant vodi kroz optimizaciju, auto canonical, Open Graph, llms.txt, IndexNow | Živi asistent i dalje traži da čovjek kuca. Samo 30.000 instalacija, dakle distribucija nije uspjela uprkos dobroj poziciji |
| **SEOptimer** | Audit alat sa dva lica: DIY za vlasnika i white label za agenciju | 29 / 39 / 59 dolara | Crawl, skor, PDF izvještaj, embed widget | **Ne primjenjuje ništa.** Čisti audit i izvještaj. Ovo je tačno model koji smo planirali za agencije |
| **Sitechecker** | Tehnički SEO monitoring, srednji do viši segment | 99 / 249 / 449 dolara | Monitoring, segmentacija stranica, Looker Studio | Ne primjenjuje izmjene. Previše skup za vlasnika jednog sajta |
| **Seobility** | Njemački, solidan audit, izdašan free tier | Besplatno + 49,90 eura | Crawl do 25.000 stranica, rang praćenje, uptime | Ne primjenjuje izmjene |
| **Screpy** | Ekstremno jeftin AI SEO monitoring | 6 / 15 / 30 dolara | Monitoring, generisanje članaka, Core Web Vitals | Ne primjenjuje tehničke ispravke. Cijena signalizira nisku vrijednost |
| **Surfer** | Content optimization za pisce i agencije | 49 do 299 dolara | Guideline za pisanje, AI vidljivost | Nije tehnički SEO uopšte. Ne dira postojeći sajt |
| **Search Atlas / OTTO** | Najbliži konkurent po namjeri: "AI koji primjenjuje ispravke" | 99 / 199 / 399 / 999 dolara | **Zaista primjenjuje**: JS pixel, Cloudflare Worker, CMS konektori za WordPress, Shopify, Webflow, GitHub pipeline | Cijena je agencijska, ne vlasnička. Default pixel je JS overlay koji GPTBot i ClaudeBot ne izvršavaju. Trustpilot 3,3 od 5, Shopify App Store 1,8 od 5 sa žalbama na naplatu. Recenzija navodi da je "nenadzirana primjena mijenjala sajtove na neodobrene načine" |
| **Seona AI** | "SEO tim u pozadini" za vlasnike malih firmi | 64,99 / 129,99 dolara | Meta tagovi, headinzi, automatske tehničke ispravke, AI blog postovi, Google Business Profile | Cijena je iznad komfornog plafona. Malo javnih dokaza o kvalitetu |
| **SEOJuice** | Script tag ili plugin, automatski interni linkovi i meta | Besplatno ispod 100 stranica uz backlink, od 24 eura | Interni linkovi, meta rewrite, alt tekst, schema patch, pristupačnost | Overlay pristup kod script varijante ima iste probleme kao OTTO pixel |
| **Shopify aplikacije (Booster, Smart SEO, TinyIMG, AVADA)** | Najjača dokazana potražnja, hiljade recenzija po aplikaciji | Besplatno + 10 do 99 dolara | **Zaista primjenjuju**: bulk alt tekst, bulk meta, JSON-LD, popravka broken linkova, AutoPilot mod | Zaključane u Shopify. Rade samo ono što Shopify Admin API dozvoljava. Ne razumiju sadržaj, samo polja |
| **Wix ugrađeni SEO (SEO Wiz)** | Besplatno, u platformi | 0 | Checklist, meta tagovi, mobilna optimizacija, strukturirani podaci | Zatvorena platforma. Treće strane praktično ne mogu pisati. Nema crawl analize konkurencije |
| **Squarespace ugrađeni SEO** | Besplatno, u platformi | 0 | Meta opisi, čisti URL-ovi, automatska mobilna optimizacija | Najzatvorenija. Postoje alati tipa SEOSpace, ali kao vodiči, ne kao izvršioci |

### 3.2 Gdje je rupa

Podijelimo tržište po dvije ose: **cijena** i **da li alat zaista primjenjuje izmjenu**.

| | Ne primjenjuje, samo izlistava | Primjenjuje izmjenu |
|---|---|---|
| **Ispod 40 dolara mjesečno** | Yoast, Rank Math, SEOptimer DIY, Screpy, Seobility free, Shopify free tierovi | **Skoro prazno.** SEOJuice od 24 eura i Shopify aplikacije unutar Shopify-a. Nema ničega što radi cross-platform, upisuje u CMS, i objašnjava laiku šta je uradilo |
| **Preko 60 dolara mjesečno** | Sitechecker, Surfer, Semrush | OTTO (99+), Seona (65+), Search Atlas Agency (999) |

Rupa je jasna i uska:

**Cross-platform alat od 19 do 39 dolara mjesečno koji piše izmjene direktno u CMS (ne kao JS overlay), sa preview-om i undo-om, na jeziku koji razumije neko ko ne zna šta je canonical tag.**

Tri stvari koje niko ne radi dobro istovremeno:

1. **Trajnost izmjene.** OTTO default i SEOJuice script pišu overlay. Izmjena ne postoji u izvornom kodu. Ako otkažeš pretplatu, sve nestaje. To je tehnički dug koji korisnik ne razumije dok ne bude kasno. Pisanje direktno u WordPress bazu ili Shopify metafields je teže, ali je to prava vrijednost.
2. **Objašnjenje na ljudskom jeziku.** Svi alati pišu "Missing H1 on 14 pages". Niko ne piše "Na 14 stranica Google ne zna koji je glavni naslov. Predlažemo ove naslove. Pogledaj i klikni Primijeni."
3. **Undo koji radi.** Ovo je odsutno gotovo svugdje. Recenzije OTTO-a eksplicitno kažu da i zadovoljni korisnici drže approval mod uključen jer se ne usuđuju drugačije.

---

## 4. Akvizicija

### 4.1 Kanali, šta zaista radi

| Kanal | Realnost za ovaj segment | Dokazi |
|---|---|---|
| **Besplatni audit alat na vlastitom domenu** | Najjači kanal, jer je alat istovremeno i marketing i proizvod. Neil Patel tvrdi da mu Ubersuggest generiše **najmanje 100.000 novih leadova mjesečno**, u dobrim i lošim mjesecima | [Neil Patel](https://x.com/neilpatel/status/1726960395708248390), [Ubersuggest](https://neilpatel.com/ubersuggest/) navodi 250.000+ korisnika i 500.000 firmi koje koriste besplatni keyword alat |
| **Programatski SEO** | Radi izuzetno dobro kada je stranica sama po sebi alat. Studija slučaja: sa 67 na 2.100 mjesečnih registracija za 10 mjeseci, organski saobraćaj sa 102 na 8.500 klikova, konverzija posjeta u registraciju sa 10,4 na 24,81 posto | [omnius case study](https://www.omnius.so/blog/programmatic-seo-case-study) |
| **Shopify App Store** | Najbolja marketplace mehanika. Posjeta u instalaciju 19,34 posto, instalacija u probni period 29,89 posto, posjeta u plaćeno oko 2,12 posto. Mjesečni churn aplikacija 2,8 posto. 87 posto trgovaca se oslanja na aplikacije, prosječno 6 do 8 po prodavnici | [craftberry Shopify App Store statistika](https://craftberry.co/articles/shopify-app-store-statistics), brojke treba uzeti kao indikativne |
| **WordPress.org repozitorij** | **Loš kanal za novog igrača.** Algoritam pretrage favorizuje broj instalacija, pa se stvara samopojačavajuća petlja. Nove pluginove više ne prelaze 100.000 instalacija. Autor analize kaže da "vrlo rijetko preporučuje rast preko WordPress.org" | [Ellipsis analiza](https://getellipsis.com/blog/org-is-ineffective-plugin-distribution/) |
| **Wix App Market** | Mali i zatvoren. Malo pisanja moguće, pa i mala vrijednost proizvoda | |
| **YouTube i zajednice** | Radi za edukativni sadržaj, ali sporo i teško se mjeri. Pogodno za agencije (koje gledaju tutorijale), manje za vlasnike malih firmi koji ne traže SEO edukaciju nego rješenje | |
| **Plaćeni oglasi** | Skoro neisplativo na ovoj cjenovnoj tački, vidjeti računicu ispod. SEO ključne riječi su među najskupljim u Google Adsu jer se za njih bore alati sa 10 do 100 puta većim ARPA | |

### 4.2 Konverzija, brojke

Iz [ChartMogul SaaS Conversion Report](https://chartmogul.com/reports/saas-conversion-report/):

| Model | Dobro | Odlično |
|---|---|---|
| Freemium, obična registracija | 3 do 5 posto | 8 do 12 posto |
| Besplatni probni period bez kartice | 4 do 6 posto | 10 do 15 posto |
| Besplatni probni period **sa karticom** | 25 do 35 posto | 50 do 60 posto |
| Ungated freemium | 7 do 9 posto | 8 do 12 posto |
| AI-native proizvod | 6 do 8 posto | 15 do 20 posto |

Medijana kroz sve proizvode je 8 posto. Traženje kartice daje **preko pet puta veću konverziju** (oko 30 posto naspram oko 5 posto).

Ključna brojka za našu cjenovnu tačku: **za proizvode ispod 50 dolara ARPA, freemium daje 90 registracija na 1.000 posjetilaca i 5,5 posto konverzije u plaćeno, dakle oko 5 plaćenih kupaca na 1.000 posjetilaca.**

Za poređenje, WordPress plugin ekosistem tradicionalno konvertuje **1 do 2 posto** besplatnih u plaćene ([John Jago prikupljanje](https://johnjago.com/day-34-wordpress-plugin-conversion-rates/)). To je znatno gore od SaaS medijane i objašnjava zašto Yoast i Rank Math moraju imati milione instalacija da bi bili održivi.

Konverzija posjete u registraciju ([daydream 2026 benchmarks](https://www.withdaydream.com/library/insights/average-landing-page-conversion-rate)):

- self-serve product stranice: 4 do 10 posto medijana, najbolji 12 do 18 posto
- top-of-funnel sadržajne stranice: 0,5 do 2 posto
- plaćeni saobraćaj daje 1,5 do 3 puta veći lift od hladnog organskog

### 4.3 CAC, računica

Ovo je moja računica, ne citirana brojka. Pretpostavke su navedene.

**Self-serve, 29 dolara mjesečno:**
- bruto marža 85 posto -> 24,65 dolara mjesečno
- mjesečni churn 6 posto (između top-kvartila 3,6 posto i medijane za ovaj segment)
- LTV = 24,65 / 0,06 = **411 dolara**
- Odnos LTV prema CAC od 3 naprema 1 -> **maksimalni CAC je oko 137 dolara**
- Na 5 kupaca po 1.000 posjetilaca, 137 dolara CAC znači da 1.000 posjetilaca ne smije koštati više od **685 dolara**, to jest 0,68 dolara po posjetiocu

Nijedan plaćeni kanal u SEO kategoriji ne daje posjetioca za 0,68 dolara. **Zaključak: za self-serve, organski i marketplace kanali nisu opcija nego jedini put.**

**Agencija, 149 dolara mjesečno prosječno:**
- bruto marža 85 posto -> 126,65 dolara mjesečno
- mjesečni churn 2 posto (viši ARPA, viši switching cost)
- LTV = 126,65 / 0,02 = **6.332 dolara**
- Maksimalni CAC = **oko 2.100 dolara**

Ta razlika od 15 puta u dozvoljenom CAC-u je razlog zašto agencije mogu biti prodavane aktivno, a vlasnici sajtova ne mogu.

---

## 5. Teški dijelovi self-serve pristupa

### 5.1 Churn, kvantifikovano

Ovo je najoštriji argument protiv self-serve pristupa i treba ga pročitati dva puta.

[ChartMogul SaaS Retention Report, The AI Churn Wave](https://chartmogul.com/reports/saas-retention-the-ai-churn-wave/):

| ARPA | Neto zadržavanje prihoda (NRR) | Bruto zadržavanje prihoda (GRR) |
|---|---|---|
| AI-native, ispod 50 dolara mjesečno | **32 posto** | **23 posto** |
| AI-native, 50 do 249 dolara | 61 posto | 45 posto |
| AI-native, preko 250 dolara | 85 posto | 70 posto |
| B2B SaaS medijana (tradicionalni) | 82 posto | |
| B2C SaaS medijana | 49 posto | |

GRR od 23 posto znači da od 100 dolara prihoda na početku godine ostane 23 dolara na kraju. Izvještaj to sažima rečenicom da je "loša strana lakoće kupovine to što je i otkazivanje lako".

[SubJolt analiza churna po cjenovnoj tački](https://www.subjolt.com/guides/churn-rate-benchmarks/) daje malo blažu sliku i jedan važan lijek:

| ARPA | Godišnje zadržavanje, gornji kvartil | Implicirani mjesečni churn |
|---|---|---|
| Ispod 25 dolara | 64,7 posto | oko 2,9 posto |
| Preko 1.000 dolara | 85,8 posto | oko 1,2 posto |

I najvažnije: **za proizvode ispod 25 dolara ARPA, godišnja naplata daje 62 posto godišnjeg zadržavanja naspram 41 posto kod mjesečne.** Razlika od 21 procentnog poena. Ta prednost ne postoji kod viših cijena. Dakle godišnji plan nije popust, nego mehanizam preživljavanja.

**Churn koji ne možemo popraviti:** [BLS podaci preko LendingTree](https://www.lendingtree.com/business/small/failure-rate/) pokazuju da se 22,1 posto novih američkih firmi ugasi u prvoj godini, 48,6 posto u pet godina, 65,3 posto u deset godina. Ako ciljamo male firme, dio našeg churna je smrtnost klijenata, ne nezadovoljstvo proizvodom.

Agencijski churn za poređenje ([Focus Digital](https://focus-digital.co/average-marketing-agency-churn/)): agencije na retaineru imaju 18 posto godišnjeg churna klijenata i prosječan životni vijek klijenta od 56 mjeseci. SEO specijalizovane agencije 38 posto godišnje.

### 5.2 Neuspjele naplate

[RetentionLens State of Involuntary Churn](https://retentionlens.com/state-of-involuntary-churn):

- kartice padaju u prosjeku **15 posto** slučajeva, ACH i direktno zaduženje 3 do 5 posto
- nevoljni churn je **20 do 40 posto ukupnog SaaS churna**, a u segmentima bliskim potrošačkim i preko 40 posto
- Recurly benchmark: 3,27 posto ukupnog mjesečnog churna, od čega 2,41 voljni i 0,86 nevoljni
- oporavak: jedan pokušaj daje 0 do 10 posto, fiksni retry 20 do 40 posto, medijana industrije 47,6 posto, najbolji u klasi 70 do 85 posto
- card updater servisi vrate do 20 posto prije ijednog retry-a

Za self-serve na 29 dolara sa desetinama hiljada kupaca, ovo nije sporedna stvar. Bez dunninga, card updatera i pametnog retry rasporeda gubimo jednu četvrtinu do jedne trećine baze bez ikakvog razloga. Kod agencija sa 20 kupaca to je problem koji riješi jedan email.

### 5.3 Opterećenje podrške

- B2B SaaS medijana troši **8 posto ARR-a na podršku i customer success**; rane faze (3 do 5 miliona ARR) oko 7 posto ([Unthread](https://unthread.io/blog/customer-support-budget-statistics/))
- Na 29 dolara mjesečno, 8 posto je **2,32 dolara mjesečno po kupcu** za kompletnu podršku
- AI riješen tiket košta 0,50 do 2,37 dolara, ljudski tiket višestruko više ([Lorikeet](https://www.lorikeetcx.ai/articles/customer-service-cost-per-ticket))
- prosjek industrije je 2,3 kontakta po problemu, dakle stvarni trošak problema je 2,3 puta trošak jednog kontakta

To znači: **jedan ljudski tiket u kvartalu po kupcu i podrška je već neprofitabilna.** Za proizvod koji mijenja tuđe sajtove i gdje se "zašto mi je nestao naslov" javlja često, ovo je ozbiljna prijetnja.

Za agenciju na 199 dolara mjesečno, isti procenat daje skoro 16 dolara mjesečno budžeta za podršku, i agencija postavlja tehnički kompetentnija pitanja koja se brže rješavaju.

### 5.4 Povjerenje i rizik lomljenja sajta

[Simply Business anketa, 1.047 vlasnika malih firmi u SAD-u, Q4 2025 do Q1 2026](https://www.simplybusiness.com/resource/small-businesses-are-using-ai-but-theyre-not-letting-it-run-the-show-2026-outlook/):

- 62 posto koristi AI u poslovanju
- **36 posto navodi rizik AI grešaka kao prepreku**, 34 posto sigurnost podataka, 31 posto nedostatak obuke
- **86 posto smatra važnim da može razgovarati sa čovjekom**, 66 posto to smatra vrlo važnim
- za odluke sa visokim ulogom povjerenje naglo pada (samo 10 posto bi pustilo AI da odlučuje o osiguranju)

Obrazac je jasan: **AI je dobrodošao za prijedlog, ali ne za neopozivo djelovanje na nešto što firmi donosi novac.**

Upozoravajući primjer iz naše kategorije: [recenzija OTTO SEO-a](https://crawlraven.com/blog/otto-seo-review) navodi da je "nenadzirana primjena mijenjala sajtove na neodobrene načine", da i zadovoljni korisnici drže approval mod uključen, da je Trustpilot ocjena 3,3 od 5 sa ponavljajućim žalbama na naplatu, i da je ocjena na Shopify App Store-u **1,8 od 5** uz prijave neovlaštenih naplata. To je proizvod koji ima najbolju tehnologiju u kategoriji i najgore povjerenje.

### 5.5 Šta uporedivi proizvodi rade po pitanju sigurnosti

Praksa koja se pokazala kao minimum:

| Mehanizam | Ko ga radi | Zašto je potreban |
|---|---|---|
| **Approval queue, ništa se ne objavljuje bez klika** | OTTO (opciono, ali svi ga drže uključenim), Shopify aplikacije tipa Smart SEO | Jedini način da vlasnik uopšte poveže sajt |
| **Preview, prikaz prije i poslije** | Booster SEO, Smart SEO | Bez ovoga vlasnik ne zna šta odobrava |
| **Undo po pojedinačnoj izmjeni** | WordPress revizije, ali ne kao SEO funkcija | Najtraženija stvar, najrjeđe implementirana |
| **Globalni rollback, vrati sve na stanje prije povezivanja** | rijetko | Ovo je jedina stvar koja gasi paniku |
| **Changelog sa vremenskom oznakom i autorstvom** | AgencyAnalytics za izvještaje, ne za izmjene | Potreban za agencijski audit trail i za klijentsko povjerenje |
| **Automatski snapshot prije batch operacije** | hosting provideri (WP Engine, Kinsta), ne SEO alati | Osiguranje za slučaj kada undo ne uspije |
| **Ograničen opseg dozvola** | Shopify OAuth scopes | Nikada ne dirati sadržaj tijela stranice ni temu, samo SEO polja |
| **Staging okruženje** | WordPress hosteri | Preskupo za 29 dolara mjesečno, ali moguće kao premium |

Praktična preporuka za nas: **default je "predloži, ne primijeni" prvih 30 dana, svaka izmjena ima preview i pojedinačni undo, postoji jedno dugme koje vraća sve, i nikada ne diramo ništa osim SEO polja.** Ovo nije feature lista, ovo je uslov da proizvod uopšte postoji u self-serve obliku.

---

## 6. Može li jedan proizvod služiti oba segmenta

Da, ali sa jasnom podjelom na zajedničko jezgro i razdvojene slojeve.

| Komponenta | Zajedničko | Samo agencije | Samo self-serve |
|---|---|---|---|
| Crawler i detekcija problema | Da | | |
| Skoring i prioritizacija | Da | | |
| AI generisanje ispravki | Da | | |
| CMS konektori (WordPress, Shopify) | Da | | |
| Apply engine, preview, undo, changelog | Da | | |
| Monitoring i ponovni crawl | Da | | |
| **Multi-site dashboard** | | Da, kritično | Ne, jedan sajt |
| **Korisnici, uloge, dozvole** | | Da | Ne |
| **White label izvještaji i domen** | | Da, kritično | Ne |
| **Embed audit widget za lead gen** | | Da, kritično | Ne |
| **Klijentski approval workflow** | | Da | Ne, vlasnik sam odobrava |
| **Bulk operacije preko više sajtova** | | Da | Ne |
| **Naplata po klijentu, reseller marža** | | Da | Ne |
| **API** | | Da | Ne |
| **Onboarding čarobnjak** | | Ne, agencija zna šta radi | Da, kritično |
| **Jezik bez žargona, objašnjenja** | | Korisno | Da, kritično |
| **Self-serve naplata i card updater** | | Manje bitno | Da, kritično |
| **Marketplace listinzi (Shopify, WordPress)** | | Ne | Da |
| **Podrška** | | Email, ljudska, mala količina | AI first, dokumentacija, video |

Procjena: **oko 70 do 75 posto koda je zajedničko.** Razilaženje je uglavnom u prezentaciji, dozvolama i naplati, ne u jezgru.

Dva mjesta gdje se roadmapi stvarno razilaze:

1. **Model podataka za vlasništvo nad sajtom.** Agencija ima organizaciju koja posjeduje 30 sajtova, sa klijentima kao pod-entitetima koji možda imaju pristup samo svom. Self-serve ima korisnika koji posjeduje jedan sajt. Ako se ovo ne postavi ispravno na početku, migracija kasnije je bolna. **Ovo treba uraditi odmah, prije nego što prvi agencijski klijent uđe**, jer je jeftino sada i skupo kasnije.

2. **Tolerancija na grešku apply engine-a.** Agencija ima tehničkog čovjeka koji primijeti da nešto nije u redu i javi nam. Vlasnik malog biznisa primijeti tek kada mu padne saobraćaj, pa ostavi recenziju od jedne zvjezdice. Zato self-serve zahtijeva viši nivo sigurnosti, više telemetrije i automatsku detekciju regresije. To je zaseban radni paket, ne varijacija postojećeg.

---

## 7. Oblik self-serve funela za ovaj proizvod

### 7.1 Koraci i realne stope

Model sa 10.000 mjesečnih posjetilaca na besplatni audit, uz organski i programatski saobraćaj.

| Korak | Realna stopa | Rezultat | Osnova |
|---|---|---|---|
| Posjeta stranice audita | | 10.000 | |
| Pokrene audit (unese URL) | 30 do 45 posto | 3.000 do 4.500 | Alat kao stranica konvertuje mnogo bolje od sadržajne stranice; omnius studija pokazuje 24,8 posto posjeta u registraciju na alat stranicama |
| Vidi rezultat i ostavi email | 35 do 55 posto onih koji pokrenu | 1.100 do 2.400 | Zavisi od toga koliko se gejtuje. Ovo je taktička odluka |
| Kreira nalog | 40 do 60 posto od emailova | 450 do 1.400 | daydream: self-serve product stranice 4 do 10 posto od ukupnog saobraćaja, što se poklapa |
| **Poveže sajt (najveći pad)** | **8 do 20 posto od naloga** | **40 do 280** | Ovo je transakcija povjerenja, ne cijene. Nemam vanjski benchmark, ovo je procjena |
| Odobri i primijeni bar jednu ispravku | 60 do 80 posto od povezanih | 25 do 220 | Ako je povezao, već je prešao psihološku barijeru |
| Plati | 5 do 10 posto od naloga bez kartice, 25 do 35 posto ako se kartica traži unaprijed | 25 do 140 | ChartMogul: freemium 3 do 5 posto dobro, trial sa karticom 25 do 35 posto |

Sumarno, realan opseg je **25 do 140 plaćenih kupaca mjesečno na 10.000 posjetilaca**, dakle 0,25 do 1,4 posto od vrha funela. ChartMogul referentna vrijednost za proizvode ispod 50 dolara ARPA je oko 5 plaćenih na 1.000 posjetilaca, to jest 0,5 posto, što je tačno u sredini ovog opsega.

Na 29 dolara mjesečno, 50 kupaca mjesečno je 1.450 dolara novog MRR-a mjesečno. Uz 6 posto churna, plato se dostiže oko 24.000 dolara MRR-a. To je red veličine koji treba imati na umu: **da bi self-serve na 29 dolara bio ozbiljan biznis, treba nam saobraćaj od 50.000 do 200.000 posjeta mjesečno.** To je 12 do 24 mjeseca rada na sadržaju i programatskom SEO-u.

### 7.2 Šta tjera ljude da konvertuju

- **Specifičnost.** Generički skor "67 od 100" ne prodaje. "Na 14 tvojih stranica Google ne vidi naslov, a jedna od njih je tvoja stranica za kontakt" prodaje.
- **Već urađen posao.** Najjača konverzija je kada korisnik vidi gotovu ispravku prije nego što plati. Pokazati napisani meta description, ne obećanje da će biti napisan.
- **Jedna besplatna primjena.** Pusti ga da primijeni jednu ispravku besplatno, pa naplati ostatak. To pretvara apstraktno povjerenje u konkretno iskustvo.
- **Poređenje sa alternativom.** "Agencija za ovo naplaćuje 800 dolara mjesečno" je najefikasnija rečenica u ovoj kategoriji, i zato je Seona AI koristi.
- **Kartica na trialu.** Peterostruka razlika u konverziji je prevelika da bi se ignorisala, ali smanjuje broj probnih korisnika i podiže očekivanja.

### 7.3 Poznate zamke free-audit-to-paid funela

1. **Izvještaj zadovolji potrebu i korisnik ode.** Klasičan problem lead magneta koji rješava problem umjesto da ga otkrije. Ako damo kompletnu listu problema besplatno, dali smo mu sve što treba da to odnese svom developeru.
2. **Previše crvenog stvara paralizu, ne kupovinu.** Netehnički vlasnik koji vidi 87 grešaka ne kupuje, nego zatvori tab. Pokazati tri najvažnije stvari, ne sve.
3. **Auditi su komoditet.** Besplatnih audita ima na desetine, uključujući Ahrefs, Semrush, Seobility i SEOptimer. Audit sam po sebi nije diferencijacija. **Diferencijacija je dugme Primijeni.**
4. **Loš kvalitet leada.** Veliki dio ljudi audituje tuđi sajt, konkurentski ili iz radoznalosti. Ti emailovi ne konvertuju nikada. Treba mjeriti konverziju samo na auditima gdje je korisnik vlasnik domena.
5. **Gejtovanje ubija završetak, negejtovanje ubija hvatanje.** Kompromis koji radi: skor i tri glavna problema odmah i besplatno, kompletna lista i predložene ispravke iza emaila.
6. **Skok od izvještaja do admin pristupa je najveći provalija u funelu.** To nije cjenovni nego povjerenjski problem. Rješava se read-only prvim korakom (poveži, mi samo čitamo, ništa ne mijenjamo), pa tek onda traženjem prava upisa.
7. **Agencijski embed widget i naš vlastiti funel se takmiče za iste brendirane ključne riječi.** Ako agencija stavi naš widget pod svojim brendom, to nam ne donosi organski saobraćaj. To je feature, ne bug, ali treba biti svjestan da agencijski kanal ne gradi našu SEO poziciju.

---

## Preporuka

**Agencije ostaju prvi kanal koji naplaćujemo. Self-serve infrastruktura se gradi paralelno od prvog dana, ali se ne monetizuje prije šestog do devetog mjeseca.**

Obrazloženje, tri razloga po važnosti:

**Prvi: ekonomija.** Dozvoljeni CAC kod agencija je oko 2.100 dolara, kod self-serve kupca oko 137 dolara. To je razlika od petnaest puta. Sa agencijama možemo aktivno prodavati, ići na partnerstva i praviti greške. Sa self-serve kupcima možemo samo čekati da organski saobraćaj naraste, što traje 12 do 24 mjeseca. Agencije finansiraju to čekanje.

**Drugi: sigurnost apply engine-a.** Naša jedina prava diferencijacija je to što primjenjujemo ispravke. To je ujedno i naš najveći rizik. Agencijski korisnik je tehnički kompetentan čovjek koji stoji između nas i klijentovog sajta. On primijeti grešku, javi nam, i ne ostavi recenziju od jedne zvjezdice. Search Atlas ima najbolji apply engine u kategoriji i ocjenu 1,8 na Shopify App Store-u. Ne želimo ponoviti tu putanju. **Agencije su nam beta testeri koji plaćaju i koji imaju strpljenja.**

**Treći: zadržavanje.** GRR od 23 posto za AI proizvode ispod 50 dolara mjesečno znači da bi self-serve bio kanta koja curi brže nego što je punimo, dok proizvod nije zreo. Agencijski segment na 150 do 400 dolara mjesečno ima GRR od 70 posto i prosječan životni vijek mjeren godinama.

### Šta konkretno raditi kada

**Faza 0, odmah, paralelno sa agencijskim radom:**
- Besplatni javni audit na našem domenu. Ovo se pravi jednom i služi oba segmenta: hrani agencijski widget i budući self-serve funel.
- Model podataka koji od početka podržava organizaciju sa više sajtova i korisnika sa jednim sajtom. Ovo je jeftino sada i skupo za šest mjeseci.
- Programatski SEO sadržaj: stranice tipa "SEO audit za [platforma]", "kako popraviti [problem] na [platforma]". Kupuje se vrijeme, organski saobraćaj raste sporo.

**Faza 1, mjeseci 0 do 6, agencije:**
- Embed widget, white label izvještaji, multi-site dashboard.
- Cijena 59 do 199 dolara mjesečno po agenciji, stepenovano po broju sajtova.
- Apply engine se gradi i kali na agencijskim sajtovima, sa obaveznim odobravanjem.
- Mjeri se: stopa neuspjelih primjena, stopa undo-a, broj tiketa po sajtu.

**Faza 2, mjeseci 6 do 12, self-serve otvaranje, ali zatvoreno:**
- Uslov za start: stopa neuspjelih primjena ispod 1 posto i stopa undo-a ispod 5 posto na agencijskim sajtovima.
- Samo WordPress i Shopify. Wix i Squarespace ne, jer tamo ne možemo pisati i proizvod gubi smisao.
- Jedan sajt, 19 do 29 dolara mjesečno, **sa jakim guranjem na godišnji plan** (190 do 290 dolara godišnje). Godišnja naplata daje 62 posto zadržavanja naspram 41 posto kod mjesečne u ovoj cjenovnoj klasi. To nije popust, to je preživljavanje.
- Probni period sa karticom, ne freemium, zbog peterostruke razlike u konverziji. Besplatan ostaje samo audit, ne proizvod.
- Prvi marketplace: **Shopify App Store**, ne WordPress.org. Shopify ima bolju mehaniku otkrivanja za novog igrača (posjeta u instalaciju 19,34 posto) i trgovci su navikli plaćati mjesečno. WordPress.org repozitorij je za nove pluginove praktično zatvoren.
- Dunning, card updater i pametan retry raspored od prvog dana. Bez toga gubimo četvrtinu baze bez razloga.

**Faza 3, mjeseci 12+:**
- Skaliranje self-serve potrošnje tek kada kohortni podaci pokažu zadržavanje u trećem mjesecu iznad 70 posto.
- WordPress plugin kao drugi marketplace, ali uz očekivanje da će biti distribucija kroz naš vlastiti saobraćaj, ne kroz repozitorij.

### Šta je pogrešno u originalnoj postavci pitanja

Osnivačev argument je "ima ih daleko više". To je tačno i nedovoljno. Veličina segmenta je bitna samo ako se do njega može doći jeftino i ako se u njemu može ostati. Ovdje su obje te stvari problematične. Veličina self-serve segmenta nije razlog da se krene prvo, nego razlog da se ne odustane od njega dugoročno. **Dugoročno je self-serve bolji biznis, jer je rupa na tržištu tamo, a ne kod agencija gdje SEOptimer, Semrush i AgencyAnalytics već sjede. Kratkoročno je agencijski segment jedini koji plaća dovoljno da preživimo do trenutka kada self-serve postane moguć.**

---

## Šta bi promijenilo ovu preporuku

Redoslijed po snazi dokaza. Ako se bilo šta od prve tri stvari pokaže tačnim, treba okrenuti sekvencu i ići self-serve prvo.

1. **Apply engine radi bolje nego što očekujemo.** Ako u prvih 60 dana na 100 sajtova imamo stopu neuspjelih primjena ispod 0,5 posto i nula slomljenih sajtova, rizik koji opravdava agencijski međukorak nestaje. Tada je agencijski korak samo odlaganje.

2. **Konverzija besplatnog audita u povezan sajt je iznad 25 posto.** Ako pokažemo da svaki četvrti korisnik koji dobije izvještaj zaista poveže svoj sajt, cijela računica CAC-a se mijenja. Provjeriti to je jeftino: treba nam samo audit stranica i 2.000 posjetilaca. **Ovo je test koji treba uraditi u naredna 4 do 6 sedmica, prije nego što se bilo šta drugo odluči.**

3. **Shopify App Store daje organsku distribuciju bez marketinškog troška.** Ako u prva tri mjeseca aplikacija sama dođe do 500+ instalacija i 2 posto konverzije u plaćeno, imamo kanal koji agencije ne mogu zamijeniti. Shopify je jedini marketplace u ovoj priči sa dokazanom mehanikom.

4. **Zadržavanje u našoj kategoriji je bolje od AI-native prosjeka.** ChartMogul brojka od 23 posto GRR odnosi se na AI proizvode generalno, gdje veliki dio otpada na alate za sadržaj koji se kupe iz radoznalosti. Alat koji je povezan sa sajtom i stalno nešto radi ima veći switching cost. Ako naše prve kohorte pokažu mjesečni churn ispod 4 posto, LTV se udvostručuje i dozvoljeni CAC ide preko 250 dolara.

5. **Agencijski kanal se pokaže sporijim nego što mislimo.** Ako prodaja agencijama traje 60+ dana po klijentu, a konverzija demo u plaćeno je ispod 15 posto, onda agencijska ekonomija nije toliko bolja u praksi koliko izgleda u tabeli. Tada je bolje ići tamo gdje se prodaje bez ljudi.

6. **Wix ili Squarespace otvore pisanje SEO polja trećim stranama.** To bi dodalo oko 10 posto svih sajtova sa CMS-om našem adresabilnom tržištu, i to baš onaj dio koji je najmanje tehnički, dakle najviše nam treba. Malo vjerovatno, ali vrijedi pratiti.

7. **Cijena agencijskih alata padne ili se konsoliduje.** Semrush je 2026. prebacio white label u dodatak od 20 dolara i ukinuo stare planove. Ako veliki igrači počnu agresivno uzimati agencijski srednji sloj, naša marža tamo nestaje i self-serve postaje jedini prostor.

Suprotno, ovo bi **ojačalo** preporuku i pomjerilo self-serve dalje:

- Prvi slomljeni sajt kod klijenta i javna recenzija. Tada apply engine treba još jedan ciklus kaljenja.
- Stopa neuspjelih naplata iznad 12 posto u prvim kohortama.
- Broj tiketa po self-serve kupcu iznad jednog mjesečno.

---

## Izvori

Tržišne veličine i platforme
- [IBISWorld, SEO & Internet Marketing Consultants in the US, broj firmi](https://www.ibisworld.com/united-states/number-of-businesses/seo-internet-marketing-consultants/4523/)
- [IBISWorld, Digital Advertising Agencies in the US, veličina tržišta](https://www.ibisworld.com/united-states/market-size/digital-advertising-agencies/5889/)
- [Brightlabs, broj digitalnih agencija u Australiji](https://www.brightlabs.com.au/insights/digital-marketing-agencies-australia)
- [Aqueous Digital, broj digitalnih agencija u UK](https://www.aqueous-digital.co.uk/articles/how-many-digital-marketing-agencies-are-there-in-the-uk/)
- [Arvow, SEO Agency Statistics 2026](https://arvow.com/blog/seo-agency-statistics-2026)
- [SBA Office of Advocacy, 36,2 miliona malih firmi](https://advocacy.sba.gov/2025/06/30/new-advocacy-report-shows-the-number-of-small-businesses-in-the-u-s-exceeds-36-million/)
- [House of Commons Library, UK business statistics](https://commonslibrary.parliament.uk/research-briefings/sn06152/)
- [ISED Canada, Key Small Business Statistics 2025](https://ised-isde.canada.ca/site/sme-research-statistics/en/key-small-business-statistics/key-small-business-statistics-2025)
- [W3Techs, CMS market share, 14.9.2026](https://w3techs.com/technologies/overview/content_management)
- [WPZOOM, WordPress statistika septembar 2026](https://www.wpzoom.com/blog/wordpress-statistics/)
- [ecomm.design, broj Shopify prodavnica 2026](https://ecomm.design/how-many-shopify-stores-are-there/)
- [Backlinko, Squarespace statistika](https://backlinko.com/squarespace-users)
- [Siteefy, broj sajtova 2026, po Netcraft podacima](https://siteefy.com/how-many-websites-are-there/)

Ponašanje i potrošnja malih firmi
- [Clutch, State of Small Business Websites 2025](https://clutch.co/resources/state-of-small-business-websites-2025)
- [Backlinko, SEO Services Report](https://backlinko.com/seo-services-statistics)
- [Revenue Memo, small business marketing budget statistics](https://www.revenuememo.com/p/small-business-marketing-budget-statistics)
- [Sonary, koliko mala firma treba trošiti na SEO softver](https://sonary.com/content/how-much-should-a-small-business-spend-on-seo-software/)
- [Simply Business, AI adopcija i povjerenje kod malih firmi, 1.047 ispitanika](https://www.simplybusiness.com/resource/small-businesses-are-using-ai-but-theyre-not-letting-it-run-the-show-2026-outlook/)

Konkurenti i cijene
- [SEOptimer pricing](https://www.seoptimer.com/pricing)
- [Rank Math pricing](https://rankmath.com/pricing/)
- [Yoast shop](https://yoast.com/shop/)
- [Squirrly SEO pricing](https://plugin.squirrly.co/squirrly-seo-pricing/)
- [Seobility pricing](https://www.seobility.net/en/pricing/)
- [Screpy pricing](https://screpy.com/pricing)
- [Surfer pricing](https://surferseo.com/pricing/)
- [Sitechecker pricing preko xpay](https://www.xpay.sh/saas-pricing/sitechecker/)
- [Semrush nova cjenovna struktura 2026](https://ecommerceparadise.com/semrush-pricing/)
- [AgencyAnalytics pricing](https://agencyanalytics.com/pricing)
- [BrightLocal pricing](https://www.brightlocal.com/pricing/)
- [MySiteAuditor](https://mysiteauditor.com/)
- [Insites lead generation widget](https://insites.com/lead-generation-seo-audit-widget)
- [Search Atlas, pregled Shopify SEO aplikacija](https://searchatlas.com/blog/shopify-seo-apps/)
- [CrawlRaven, OTTO SEO review, mehanizam primjene i rizici](https://crawlraven.com/blog/otto-seo-review)
- [Seona AI review](https://insights.velocityaipartners.co/tools/seona-ai)
- [SEOJuice](https://seojuice.com/)
- WordPress.org listinzi: [Yoast](https://wordpress.org/plugins/wordpress-seo/), [Rank Math](https://wordpress.org/plugins/seo-by-rank-math/), [All in One SEO](https://wordpress.org/plugins/all-in-one-seo-pack/), [Squirrly](https://wordpress.org/plugins/squirrly-seo/)

Akvizicija i benchmarci
- [ChartMogul, SaaS Conversion Report](https://chartmogul.com/reports/saas-conversion-report/)
- [ChartMogul, SaaS Retention Report, The AI Churn Wave](https://chartmogul.com/reports/saas-retention-the-ai-churn-wave/)
- [ChartMogul, SaaS Billing Report](https://chartmogul.com/reports/saas-billing-report/)
- [SubJolt, churn benchmarci po cjenovnoj tački](https://www.subjolt.com/guides/churn-rate-benchmarks/)
- [RetentionLens, State of Involuntary Churn](https://retentionlens.com/state-of-involuntary-churn)
- [daydream, landing page conversion benchmarci](https://www.withdaydream.com/library/insights/average-landing-page-conversion-rate)
- [omnius, programatski SEO case study](https://www.omnius.so/blog/programmatic-seo-case-study)
- [craftberry, Shopify App Store statistika](https://craftberry.co/articles/shopify-app-store-statistics)
- [Ellipsis, WordPress.org kao kanal distribucije](https://getellipsis.com/blog/org-is-ineffective-plugin-distribution/)
- [John Jago, konverzija WordPress pluginova](https://johnjago.com/day-34-wordpress-plugin-conversion-rates/)
- [Neil Patel o Ubersuggestu kao lead magnetu](https://x.com/neilpatel/status/1726960395708248390)
- [LendingTree, BLS podaci o gašenju novih firmi](https://www.lendingtree.com/business/small/failure-rate/)
- [Focus Digital, churn marketinških agencija](https://focus-digital.co/average-marketing-agency-churn/)
- [Unthread, budžeti za podršku po veličini firme](https://unthread.io/blog/customer-support-budget-statistics/)
- [Lorikeet, trošak po tiketu](https://www.lorikeetcx.ai/articles/customer-service-cost-per-ticket)

### Napomena o pouzdanosti

Tvrde brojke iz primarnih izvora: W3Techs udjeli platformi, SBA i ISED brojevi firmi, House of Commons podaci za UK, IBISWorld brojevi agencija za SAD i Australiju, BLS podaci o gašenju firmi, sve objavljene cijene konkurenata, ChartMogul benchmarci.

Procjene koje sam izveo i koje treba tretirati kao radne pretpostavke: broj agencija u Kanadi i ostalim tržištima, broj Wix i Webflow živih sajtova, udio sajtova malih firmi na engleskom jeziku, podjela malih firmi na one koje rade SEO same i one koje plaćaju, cijeli model funela u odjeljku 7, i obje CAC računice u odjeljku 4.3.

Brojke koje sam našao ali im ne vjerujem potpuno: Shopify App Store statistike iz sekundarnih agregatora (12,4 miliona recenzija djeluje previsoko), Wix broj pretplata (posljednji čvrst javni podatak je iz 2022), i prosječna potrošnja malih firmi na SEO od 497 dolara mjesečno (bazna anketa je iz 2019).
