# Koliko zaista vrijede on-page popravke

Pregled dokaza za Tidywright, stanje na dan 14. septembar 2026.

---

## Kratak odgovor

On-page popravke su uglavnom preduslov, a ne poluga rasta: one otključavaju da stranica uopšte bude popuzana, indeksirana i prikazana, ali same po sebi rijetko podižu rangiranje na tržištu gdje konkurencija već ima sadržaj i linkove. Najjači dio našeg posla je tehnički sloj (indeksabilnost, kanonikali, robots, duplikati, interni linkovi) jer tu greška košta stotinu posto vidljivosti, dok su naslovi i meta opisi CTR poluga koju Google prepisuje u 62 do 76 posto slučajeva ([Ahrefs](https://ahrefs.com/blog/meta-description-study/), [Zyppy](https://zyppy.com/seo/google-title-rewrite-study/), [Search Engine Land](https://searchengineland.com/google-changed-76-of-title-tags-in-q1-2025-heres-what-that-means-454847)). Google sam kaže da za promjene kvaliteta treba "nekoliko dana do nekoliko mjeseci" da se sistem prilagodi, a Maile Ohye iz Googlea je dala raspon od četiri mjeseca do godinu dana za vidljiv efekat SEO rada ([Google](https://developers.google.com/search/updates/core-updates), [Search Engine Roundtable](https://www.seroundtable.com/google-give-seos-4-12-months-23419.html)), pa je mjerenje nakon 30 dana gotovo uvijek prerano. Uz to, 2026. je kontekst gori nego ranije: 68 posto Google pretraga završava bez klika i AI Overviews obaraju CTR do 58 posto, tako da sajt može da napreduje u rangiranju a da klikovi ostanu isti ili padnu ([SparkToro](https://sparktoro.com/blog/in-2026-less-than-one-third-of-google-searches-still-send-a-click/), [Ahrefs](https://ahrefs.com/blog/ai-overviews-reduce-clicks-update/)). Zaključak za proizvod: prodajemo dijagnostiku, higijenu i brzinu izvršenja, obećavamo ispravke i izmjerene tehničke ishode, nikada rangiranje ili promet, i mjerimo u prozoru od 90 dana sa kontrolnom grupom stranica.

---

## 1. Šta od on-page faktora stvarno utiče i koliko

### 1.1 Brza tabela

Kategorije koje koristim:
- **Preduslov** = ako je pokvareno, gubiš sve; ako je ispravno, ne dobijaš bonus.
- **Faktor rangiranja** = Google potvrđeno koristi kao signal u rangiranju.
- **CTR poluga** = ne mijenja poziciju, mijenja koliko ljudi klikne.
- **Kozmetika** = uredno je, ali nema mjerljiv efekat na pretragu.

| Faktor | Tip | Jačina | Dokaz |
|---|---|---|---|
| Indeksabilnost (robots.txt, noindex, status kodovi) | Preduslov | Kritično, binarno | [Google: block indexing](https://developers.google.com/search/docs/crawling-indexing/block-indexing) |
| Kanonikal tagovi | Preduslov | Visoko na sajtovima sa duplikatima | [Google: consolidate duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) |
| Title tag | Faktor rangiranja + CTR poluga | Slab do srednji, i to samo kad ga Google ne prepiše | [Google: title link](https://developers.google.com/search/docs/appearance/title-link), [SearchPilot testovi](https://www.searchpilot.com/resources/blog/10-seo-ab-tests-with-an-impact-of-over-10-percent) |
| Meta opis | CTR poluga | Slab, prepisan u ~63% slučajeva | [Ahrefs, 192.656 stranica](https://ahrefs.com/blog/meta-description-study/) |
| H1 i hijerarhija naslova | Slab faktor / kozmetika | Vrlo slab za rangiranje, bitan za pristupačnost | [Mueller: popravljanje naslova neće promijeniti rangiranje](https://userp.io/news/google-confirms-fixing-headings-wont-improve-rankings/), [Google starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) |
| Strukturirani podaci / schema.org | Nije faktor rangiranja, jeste uslov za rich results | Srednje za CTR ako se dobiju rich results, nula za poziciju | [Mueller, april 2025](https://www.seroundtable.com/google-structured-data-ranking-39232.html), [Google docs](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data) |
| Interni linkovi | Preduslov + faktor rangiranja | Srednje do visoko, jedina poluga "autoriteta" koju mali sajt kontroliše | [Google: links best practices](https://developers.google.com/search/docs/crawling-indexing/links-crawlable), [Whitespark 2026](https://whitespark.ca/local-search-ranking-factors/) |
| Alt tekst na slikama | Slab faktor, uglavnom za Google Images i pristupačnost | Slab za web pretragu | [Google: image SEO](https://developers.google.com/search/docs/appearance/google-images) |
| Robots direktive (meta robots, X-Robots-Tag) | Preduslov | Kritično, binarno | [Google](https://developers.google.com/search/docs/crawling-indexing/block-indexing) |
| Hreflang | Preduslov za višejezične sajtove | Nula za monolingvalni SMB sajt | [Google: localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions) |
| XML sitemap | Preduslov za otkrivanje, ne garantuje indeksiranje | Nizak za sajtove ispod 500 stranica | [Google: "By small, we mean about 500 pages or fewer"](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview) |
| Core Web Vitals | Faktor rangiranja, ali slab | Nizak za poziciju, srednji za konverziju | [Google: page experience](https://developers.google.com/search/docs/appearance/page-experience), [web.dev case studies](https://web.dev/case-studies/vitals-business-impact) |
| Mobilna prilagođenost | Preduslov od 2024. | Kritično, binarno | [Search Engine Land: mobile-first indexing završen](https://searchengineland.com/google-says-mobile-first-indexing-is-complete-after-almost-7-years-434011) |
| HTTPS | Faktor rangiranja, minimalan | Vrlo nizak, ali obavezan zbog korisnika i browsera | [Google, 2014](https://developers.google.com/search/blog/2014/08/https-as-ranking-signal) |
| Tanak ili dupliran sadržaj | Faktor rangiranja (negativan) | Visoko | [Google: core updates](https://developers.google.com/search/updates/core-updates) |
| E-E-A-T signali | Nije direktan faktor, jeste opis onoga što sistemi pokušavaju da nagrade | Neizravno, teško automatizovati | [Mueller, maj 2026: smjernice za ocjenjivače nisu vodič za rangiranje](https://www.seroundtable.com/google-search-quality-raters-guidelines-rankings-41414.html) |

### 1.2 Detaljno, po faktoru

**Title tag.** Google otvoreno kaže da naslovni link generiše automatski iz više izvora: `<title>`, glavnog vizuelnog naslova, `<h1>`, `og:title` i anchor teksta ([Google](https://developers.google.com/search/docs/appearance/title-link)). Dakle `<title>` je ulaz, ne izlaz. Ipak, kontrolisani SEO A/B testovi pokazuju da izmjena naslova zna da pomjeri promet dvocifreno: SearchPilot bilježi +15% kad je brend premješten na početak naslova, +11% kad je naslov skraćen, +10% za dinamičku cijenu u naslovu ([SearchPilot](https://www.searchpilot.com/resources/blog/10-seo-ab-tests-with-an-impact-of-over-10-percent)). Bitno: ti testovi su na velikim sajtovima sa hiljadama sličnih šablonskih stranica. Isti test je znao da bude i negativan ili neutralan; naslovi u sve velika slova dali su +14% na mobilnom a nula na desktopu ([SearchPilot 2025](https://www.searchpilot.com/resources/case-studies/a-look-back-at-the-most-surprising-tests-of-2025)). Zaključak: naslov je stvarna poluga, ali sa dvosmjernim rizikom i nepredvidivim ishodom na pojedinačnoj stranici.

**Meta opis.** Google je jasan da to nije faktor rangiranja, nego izvor za snippet ([starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)). Ahrefs je na 20.000 ključnih riječi i 192.656 stranica našao da Google prepisuje meta opis u 62,78% slučajeva, a da 25,02% top rangiranih stranica uopšte nema meta opis ([Ahrefs](https://ahrefs.com/blog/meta-description-study/)). Portent je ranije mjerio preko 70% ([Search Engine Journal](https://www.searchenginejournal.com/google-rewrites-meta-descriptions-over-70-of-the-time/382140/)). Dodavanje meta opisa tamo gdje ga nema ima smisla kao higijena, ali obećavati porast CTR-a od toga nije pošteno.

**H1 i struktura naslova.** Google eksplicitno kaže da redoslijed naslova ne utiče na rangiranje: "From Google Search perspective, it doesn't matter if you're using them out of order" ([starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)). Mueller je 2024. dodao da popravljanje hijerarhije na postojećem sajtu "neće promijeniti rangiranje vašeg sajta" ([uSERP](https://userp.io/news/google-confirms-fixing-headings-wont-improve-rankings/)). Ono što jeste dokazano: SearchPilot je mjerio +12% kada su H2 naslovi pretvoreni u pitanja, jer stranica tada hvata druge upite ([SearchPilot](https://www.searchpilot.com/resources/blog/10-seo-ab-tests-with-an-impact-of-over-10-percent)). Dakle sadržaj naslova može da pomogne, sintaksa hijerarhije ne.

**Strukturirani podaci.** Ovdje je industrija godinama prodavala maglu. Mueller, april 2025: "Structured data won't make your site rank better", i dodaje da je vjerovatno nećete vidjeti nikakvu vidljivu promjenu ([Search Engine Roundtable](https://www.seroundtable.com/google-structured-data-ranking-39232.html)). Google dokumentacija govori isključivo o rich results kvalifikaciji ([Google](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)). Vrijednost postoji, ali je uslovna: ako stranica dobije rich result (recenzije, FAQ tamo gdje još radi, proizvod, lokalni biznis, breadcrumbs), CTR može da poraste. Ako ne dobije, efekat je nula. Treba i znati da je Google u maju 2026. dodao obavještenje o ukidanju FAQ rich result funkcije ([Google updates](https://developers.google.com/search/updates)), što je podsjetnik da se rich result prilike gase brže nego što nastaju.

**Interni linkovi.** Ovo je najpotcjenjenija stavka na listi i jedina "off-page slična" poluga koju mali sajt potpuno kontroliše. Google zahtijeva `<a href>` sa stvarnim URL-om da bi link uopšte bio praćen ([Google](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)). Whitespark ankete lokalnih SEO stručnjaka za 2026. stavljaju "dedicirana stranica za svaku uslugu" na prvo mjesto lokalnih organskih faktora, što je u praksi pitanje strukture i internog linkovanja ([Whitespark](https://whitespark.ca/local-search-ranking-factors/)). Napomena o kvalitetu dokaza: to je anketa mišljenja, ne mjerenje, i treba je tako i tretirati.

**Alt tekst.** Google kaže da je alt "najvažniji atribut za pružanje metapodataka o slici" i da ga koristi zajedno sa computer vision algoritmima ([Google](https://developers.google.com/search/docs/appearance/google-images)). To je tačno, ali u kontekstu Google Images, ne web pretrage. Za tipičan SMB sajt, Google Images promet je marginalan. Alt tekst prodajemo kao pristupačnost i usklađenost, ne kao SEO dobitak.

**Kanonikali i duplikati.** Google kaže da je `rel=canonical` "snažan signal", ne direktiva, i da Google sam bira kanonski URL ([Google](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)). Ovo je važno za očekivanja: mi možemo da postavimo ispravan kanonikal, ali ne možemo da garantujemo da će ga Google poslušati. Isto tako, "kazna za dupli sadržaj" ne postoji kao takva, Google to rješava klasterovanjem i biranjem jedne verzije ([Google, 2008](https://developers.google.com/search/blog/2008/09/demystifying-duplicate-content-penalty)).

**Robots direktive.** Najskuplja greška koju uopšte možemo da nađemo. Google izričito upozorava: da bi `noindex` radio, stranica ne smije biti blokirana u robots.txt, jer crawler tada nikad ne vidi pravilo i stranica i dalje može da se pojavi u rezultatima ([Google](https://developers.google.com/search/docs/crawling-indexing/block-indexing)). Detekcija ovakvih konflikata je, po očekivanoj vrijednosti, najvredniji check koji imamo.

**Hreflang.** Za sajt ispod 50 stranica na jednom jeziku ovo je irelevantno. Google čak kaže da ne koristi hreflang ni `lang` atribut za detekciju jezika stranice, nego algoritme ([Google](https://developers.google.com/search/docs/specialty/international/localized-versions)). Ako ga implementiramo pogrešno (bez recipročnih veza), anotacije se jednostavno ignorišu.

**XML sitemap.** Google doslovno piše da sajt "mali" znači oko 500 stranica ili manje i da takvom sajtu sitemap vjerovatno ne treba, te da sitemap ne garantuje indeksiranje ([Google](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)). Za naš ciljni segment ispod 50 stranica, sitemap je higijena sa skoro nultim očekivanim efektom, osim što ubrzava otkrivanje novih stranica i daje nam `lastmod` signal.

**Core Web Vitals.** Google potvrđuje da "Core Web Vitals are used by our ranking systems", ali u istoj rečenici kaže da nema jedinstvenog page experience signala i da relevantnost sadržaja ima prednost: "Google Search always seeks to show the most relevant content, even if the page experience is sub-par" ([Google](https://developers.google.com/search/docs/appearance/page-experience)). Pragovi su i dalje LCP 2,5 s, INP 200 ms, CLS 0,1, mjereno na 75. percentilu ([web.dev](https://web.dev/articles/vitals)). Poslovni efekat je bolje dokumentovan od SEO efekta: Vodafone +8% prodaje uz 31% bolji LCP, NDTV 50% bolji bounce rate, Agrofy 76% manje napuštanja učitavanja ([web.dev case studies](https://web.dev/case-studies/vitals-business-impact)). Napomena o kvalitetu dokaza: to su studije slučaja koje je Google objavio, dakle selektivan uzorak bez kontrolne grupe. Koristiti ih kao ilustraciju, ne kao predikciju.

**Mobilna prilagođenost.** Od jula 2024. Google indeksira isključivo smartphone Googlebotom i sajt koji ne radi na mobilnom se ne indeksira ([Search Engine Land](https://searchengineland.com/google-says-mobile-first-indexing-is-complete-after-almost-7-years-434011)). Ovo je prešlo iz "faktora" u "binarni preduslov".

**HTTPS.** Google je 2014. najavio HTTPS kao vrlo lagan signal koji u tom trenutku utiče na manje od 1% globalnih upita ([Google](https://developers.google.com/search/blog/2014/08/https-as-ranking-signal)). Otad nema nove kvantifikacije. Praktično: bez HTTPS-a gubiš povjerenje korisnika i browser upozorenja, a SEO dobitak od prelaska je zanemarljiv.

**Tanak i dupliran sadržaj.** Ovo je jedini "on-page" faktor koji core update može ozbiljno da kazni. Google kaže da nakon poboljšanja "neke promjene mogu da djeluju za nekoliko dana, ali može trebati i nekoliko mjeseci" da sistemi potvrde da sajt u cjelini proizvodi koristan sadržaj ([Google](https://developers.google.com/search/updates/core-updates)). Naš alat može da detektuje tanke stranice, ali ne može automatski da ih učini korisnim.

**E-E-A-T.** Nije faktor rangiranja i Google to sada kaže vrlo direktno. Mueller, maj 2026: smjernice za ocjenjivače kvaliteta "nisu vodič za rangiranje u pretrazi", iako opisuju kakve stranice Google želi da prikazuje ([Search Engine Roundtable](https://www.seroundtable.com/google-search-quality-raters-guidelines-rankings-41414.html)). Ono što se može automatizovati (autor bio, datum ažuriranja, kontakt stranica, Organization schema, impresum) su proxy signali, ne E-E-A-T sam po sebi. Prodavati "E-E-A-T score" je marketinška fikcija.

**Bing.** Bing eksplicitnije govori o reputaciji autora i sajta, potpunosti sadržaja i transparentnosti autorstva nego Google ([Search Engine Land intervju sa Bing timom](https://searchengineland.com/a-deeper-dive-into-more-of-the-bing-search-ranking-factors-339714), [Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)). Za naš proizvod Bing je sekundaran po volumenu, ali je sve relevantniji jer napaja ChatGPT search i Copilot.

---

## 2. Šta Google kaže o prepisivanju naslova i opisa

Ovo je najosjetljivija tačka za proizvod koji generiše "popravke naslova".

**Google to i ne krije.** Dokumentacija kaže da je kreiranje naslovnog linka "potpuno automatizovano" i da uzima u obzir i sadržaj stranice i reference na nju sa weba. Google mijenja naslov kad procijeni da `<title>` nije tačan, kad je zastario u odnosu na vidljiv sadržaj, ili kad se jezik naslova ne poklapa sa jezikom stranice ([Google](https://developers.google.com/search/docs/appearance/title-link)).

**Koliko često.**

| Studija | Uzorak | Stopa prepisivanja | Period |
|---|---|---|---|
| [Zyppy (Cyrus Shepard)](https://zyppy.com/seo/google-title-rewrite-study/) | 80.959 naslova na 2.370 sajtova | 61,6% | početak 2022. |
| [John McAlpin / Search Engine Land](https://searchengineland.com/google-changed-76-of-title-tags-in-q1-2025-heres-what-that-means-454847) | ~30.000 ključnih riječi, top 20 rezultata | 76% | Q1 2025 |
| [Ahrefs, meta opisi](https://ahrefs.com/blog/meta-description-study/) | 192.656 stranica | 62,78% | meta opisi |

Trend je rastući: 76% u 2025. je oko 25% više nego uporediva studija iz 2023. Kod prepisanih naslova, samo 35% originalnih riječi je zadržano, a brend je uklonjen u 63% slučajeva ([Search Engine Land](https://searchengineland.com/google-changed-76-of-title-tags-in-q1-2025-heres-what-that-means-454847)).

**Šta povećava šansu da naslov ostane.** Zyppy podaci su ovdje najkorisniji jer daju konkretne pragove:

| Obrazac | Stopa prepisivanja |
|---|---|
| Naslov 1 do 5 znakova | 96,6% |
| Naslov preko 70 znakova | 99,9% |
| Naslov 51 do 60 znakova | 39 do 42% (najbolje) |
| Uglaste zagrade `[...]` | 77,6% prepisano, sadržaj uklonjen u 32,9% |
| Obične zagrade `(...)` | 61,9% prepisano, sadržaj uklonjen u 19,7% |
| Separator pipe `|` | uklonjen ili zamijenjen u 41,0% |
| Separator crtica | uklonjen u 19,7% |
| H1 se poklapa sa title | znatno manje prepisivanja |

Izvor: [Zyppy](https://zyppy.com/seo/google-title-rewrite-study/).

**Šta to znači za vrijednost savjeta "popravi naslov".** Tri stvari:

1. Savjet i dalje ima smisla, ali kao **povećanje vjerovatnoće**, ne kao garancija. Naslov od 55 znakova, bez uglastih zagrada, sa crticom umjesto pipea, i sa H1 koji se poklapa, ima realno manju šansu da bude prepisan.
2. Naslov se koristi i kad se ne prikaže. On je jedan od ulaza u razumijevanje stranice, čak i kad Google prikaže nešto drugo. Zato "Google ga ipak prepiše" ne znači "ne radi ništa".
3. **Ne smijemo obećavati promjenu snippeta.** Ispravna formulacija je: "generisali smo naslov koji prati Google smjernice i statistički rjeđe biva prepisan", a ne "vaš novi naslov će se prikazati u Googleu".

Za meta opise, pošteno je reći da ih Google prepisuje u oko dvije trećine slučajeva i da četvrtina top rangiranih stranica uopšte nema meta opis ([Ahrefs](https://ahrefs.com/blog/meta-description-study/)). Mi ih pišemo zato što je bolje imati kontrolu nad trećinom slučajeva nego nad nula.

---

## 3. Realni rokovi

### 3.1 Tri različita sata koja kucaju

Klijent misli da postoji jedan rok. Postoje tri, i svaki je duži od prethodnog.

| Faza | Šta se dešava | Tipičan rok | Izvor |
|---|---|---|---|
| Ponovni crawl | Googlebot ponovo preuzme stranicu | Od više puta dnevno do jednom u nekoliko mjeseci | [Mueller, april 2024](https://www.seroundtable.com/google-recrawl-url-rate-37311.html) |
| Ponovno indeksiranje | Nova verzija zamijeni staru u indeksu | "Od nekoliko dana do nekoliko sedmica" nakon zahtjeva | [Google: ask to recrawl](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl) |
| Ponovna procjena kvaliteta | Sistemi rangiranja prihvate da je sajt promijenjen | "Nekoliko dana do nekoliko mjeseci" | [Google: core updates](https://developers.google.com/search/updates/core-updates) |
| Vidljiv poslovni efekat | Promet, upiti, prodaja | 4 do 12 mjeseci | [Maile Ohye, Google](https://www.seroundtable.com/google-give-seos-4-12-months-23419.html) |

Dodatni konkretan podatak koji je Google dodao u dokumentaciju u julu 2026: nakon što se sadržajni problem popravi, Google može da drži stranice u klasteru duplikata **do dvije sedmice** ([Google: canonicalization troubleshooting](https://developers.google.com/search/docs/crawling-indexing/canonicalization-troubleshooting)). To je jedan od rijetkih egzaktnih brojeva koje je Google ikada dao i vrijedi ga citirati klijentu.

Još jedan koristan detalj: zahtjev za ponovno indeksiranje kroz URL Inspection ima kvotu i ponavljanje zahtjeva **ne ubrzava** crawl ([Google](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)). Ako naš proizvod ima dugme "zatraži reindeks", moramo to jasno napisati u UI-u, inače klijent klika deset puta i misli da ne radi.

### 3.2 Mali sajt naspram velikog

**Mali sajt (ispod 50 stranica).**
- Crawl budžet **nije** problem. Google izričito kaže da vodič o crawl budžetu vrijedi za sajtove sa milion plus stranica, ili 10.000 plus stranica sa dnevno promjenljivim sadržajem, i da ostalima "ne treba da ga čitaju" ([Google](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget)).
- Ali frekvencija crawla je niska jer je "crawl demand" nizak. Mali, neposjećen sajt bez linkova može da čeka sedmicama na ponovnu posjetu. Ovo je paradoks koji klijenti ne razumiju: mali sajt se brzo popuže u cjelini, ali rijetko.
- Praktično: računaj 1 do 4 sedmice do ponovnog indeksiranja svih izmijenjenih stranica, i 2 do 3 mjeseca prije nego što ima smisla gledati poziciju.

**Veliki sajt.**
- Crawl budžet je stvaran, i promjena na 50.000 stranica se ne propagira odjednom. Kod velikih sajtova tipično prvo vidiš efekat na najlinkovanijim i najposjećenijim stranicama, a rep se dovlači mjesecima.
- Zato su SEO A/B testovi (kontrola naspram varijante) uopšte mogući tek iznad određene veličine.

### 3.3 Vanjski sat koji ne kontrolišemo

Rangiranje se često ne pomjeri dok Google ne izvrti core update. Google sam kaže: "If it's been a few months and you still haven't seen any effect, that could mean waiting until the next core update" ([Google](https://developers.google.com/search/updates/core-updates)).

Kadenca u posljednjih godinu i po, po zvaničnom Google Search Status dashboardu ([status.search.google.com](https://status.search.google.com/summary)):

| Update | Datum starta | Trajanje |
|---|---|---|
| Decembar 2025. core update | 11.12.2025. | 18 dana |
| Februar 2026. Discover update | 05.02.2026. | 21 dan |
| Mart 2026. spam update | 24.03.2026. | 19 sati |
| Mart 2026. core update | 27.03.2026. | 12 dana |
| Maj 2026. core update | 21.05.2026. | 11 dana |
| Jun 2026. spam update | 24.06.2026. | 2 dana |
| Avgust 2026. spam update | 18.08.2026. | 2 dana |

Dakle core update dolazi otprilike svaka dva do tri mjeseca, i rollout traje 11 do 18 dana. Ako klijent mjeri 30 dana nakon naših popravki, postoji ozbiljna šansa da je taj prozor ili unutar rollouta ili prije sljedećeg, i u oba slučaja je mjerenje besmisleno. Ovo treba ugraditi u proizvod: **prikazuj core update rollout periode kao sive trake na grafikonu.**

---

## 4. Šta najviše vrijedi za mali sajt bez backlinkova

### 4.1 Iskrena polazna tačka

Ahrefs je na indeksu od oko 14 milijardi stranica našao da 96,55% stranica ne dobija nikakav promet sa Googlea, i navodi tri razloga: nema pretraživačke potražnje za temom, nema backlinkova, ili se stranica ne poklapa sa namjerom pretrage ([Ahrefs](https://ahrefs.com/blog/search-traffic-study/)). Nijedan od ta tri razloga se ne rješava on-page popravkama.

Istovremeno, Gary Illyes iz Googlea kaže da ljudi precjenjuju važnost linkova i da linkovi "nisu u top tri" faktora i nisu već neko vrijeme, te da je moguće rangirati bez linkova ([Search Engine Land](https://searchengineland.com/links-google-search-ranking-factor-gary-illyes-432422)). Ta dva nalaza nisu u kontradikciji: bez linkova se može rangirati na temama male konkurencije, ali ne na komercijalnim upitima gdje svi imaju i sadržaj i linkove.

### 4.2 Rangiranje intervencija po efektu na uloženi trud

Bodovanje je moja procjena na osnovu izvora iznad, ne mjerenje. Skala 1 do 5.

| # | Intervencija | Efekat | Trud | Odnos | Automatizovati? |
|---|---|---|---|---|---|
| 1 | Popraviti blokiranje indeksiranja (noindex, robots.txt, 4xx/5xx, konflikt noindex + robots.txt) | 5 | 1 | **5,0** | Da, potpuno |
| 2 | Google Business Profile: kategorija, adresa, radno vrijeme, recenzije | 5 | 2 | **2,5** | Djelimično, uputstvo |
| 3 | Dedicirana stranica po usluzi i po lokaciji, umjesto jedne "Usluge" stranice | 5 | 3 | **1,7** | Ne, ali možemo detektovati i predložiti |
| 4 | Interno linkovanje: povezati orphan stranice, dodati kontekstualne linkove sa opisnim anchor tekstom | 4 | 2 | **2,0** | Da, uz ljudski pregled |
| 5 | Popraviti kanonikale i duplikate (www/non-www, trailing slash, parametri, HTTP/HTTPS) | 4 | 1 | **4,0** | Da, potpuno |
| 6 | Naslovi stranica: jedinstveni, 50 do 60 znakova, bez uglastih zagrada, poklapaju se sa H1 | 3 | 1 | **3,0** | Da |
| 7 | Uskladiti sadržaj sa namjerom pretrage (informativno naspram komercijalnog) | 5 | 4 | **1,25** | Ne |
| 8 | Popraviti tanke stranice (ispod 150 do 200 riječi bez svrhe) | 4 | 4 | **1,0** | Djelimično |
| 9 | Core Web Vitals: LCP slika, dimenzije slika protiv CLS, lijeno učitavanje | 2 za rangiranje, 4 za konverziju | 3 | **1,3 do 2,0** | Djelimično |
| 10 | LocalBusiness i Organization schema | 2 | 1 | **2,0** | Da, potpuno |
| 11 | Meta opisi gdje nedostaju | 1,5 | 1 | **1,5** | Da |
| 12 | Alt tekst | 1 (SEO), 4 (pristupačnost i pravna usklađenost) | 2 | **0,5 SEO** | Da, uz AI opis |
| 13 | XML sitemap na sajtu od 30 stranica | 1 | 1 | **1,0** | Da |
| 14 | Hreflang na monolingvalnom sajtu | 0 | 1 | **0** | Ne raditi |
| 15 | Hijerarhija H2/H3 samo radi ispravnog redoslijeda | 0,5 | 2 | **0,25** | Ne prodavati kao SEO |
| 16 | Backlinkovi, PR, partnerstva, lokalni citati | 5 | 5 | **1,0** | Ne, van opsega proizvoda |

Napomena za lokalni biznis: Whitespark anketa za 2026. stavlja primarnu GBP kategoriju, blizinu lokaciji pretrage i ključne riječi u nazivu biznisa kao tri najjača faktora za lokalni pack ([Whitespark](https://whitespark.ca/local-search-ranking-factors/)). Ništa od toga nije on-page. BrightLocal na uzorku od 1.002 potrošača nalazi da 97% čita recenzije, a 31% traži 4,5 zvjezdice ili više prije nego uopšte razmotri biznis, što je skok sa 17% u 2025 ([BrightLocal](https://www.brightlocal.com/research/local-consumer-review-survey/)). Za lokalni SMB, jedna nova recenzija sedmično vjerovatno vrijedi više od svih naših 176 checkova.

### 4.3 Gdje on-page rad udara u plafon

Plafon je vrlo konkretan i vrijedi ga reći klijentu naglas:

1. **Kad su sve tehničke greške popravljene.** Poslije toga svaki sljedeći check daje sve manji prinos. Zato je prvi skeniranje najvrednije, a dvanaesti skoro bezvrijedno.
2. **Kad je konkurencija na istom tehničkom nivou.** Ako svi na prvoj strani imaju ispravne naslove i schema markup, naš ispravan naslov nije prednost nego ulaznica.
3. **Kad nema sadržaja za upit.** Nemoguće je rangirati za "advokat za radno pravo Sarajevo" ako sajt nema stranicu o radnom pravu. To nije on-page popravka, to je pisanje sadržaja.
4. **Kad nema signala povjerenja.** Novi domen bez ijednog linka, bez pomena, bez recenzija je za Google nepoznata veličina. Google potvrđuje da pokušava da nagradi iskustvo i autoritet ([Google](https://developers.google.com/search/updates/core-updates)), a to se stiče izvan sajta.

Iskren opis: on-page rad je otprilike prvih 20 do 30 posto puta. Poslije toga sadržaj i off-page preuzimaju.

---

## 5. Kako mjeriti pošteno

### 5.1 Koje metrike su pripisive našem radu, a koje nisu

| Metrika | Pripisiva našim popravkama? | Zašto |
|---|---|---|
| Broj popravljenih grešaka po kategoriji | **Da, potpuno** | To je direktan izlaz našeg rada |
| Broj indeksiranih stranica (GSC Page Indexing) | **Da, jako** | Ako smo skinuli noindex ili popravili kanonikal, ovo je direktan kauzalni lanac |
| Stranice sa validnim strukturiranim podacima (GSC Enhancements) | **Da** | Direktan izlaz, iako ne garantuje rich result |
| Core Web Vitals lab podaci (Lighthouse, PSI) | **Da** | Deterministički, mjerljivo prije i poslije |
| Core Web Vitals field podaci (CrUX) | **Djelimično** | Kašnjenje i prag saobraćaja, vidi dolje |
| GSC impresije | **Slabo** | Zavise od potražnje, sezone i AI funkcija |
| GSC prosječna pozicija | **Slabo i varljivo** | Google sam upozorava da je prosjek po svim upitima i da "može biti varljiva ako ne razumijete nijanse" ([Google](https://support.google.com/webmasters/answer/7042828)) |
| GSC CTR | **Slabo** | Konfundirano AI Overviews prisustvom i miksom upita |
| Organski promet u analitici | **Ne** | Previše konfundirajućih varijabli |
| Prodaja, pozivi, upiti | **Ne** | Iskreno reći: to je poslovni ishod, ne naš izlaz |

### 5.2 Konkretna zamka: Core Web Vitals field podaci

Za mali sajt ovo je ozbiljan problem koji moramo unaprijed reći. CrUX zahtijeva da stranica bude "dovoljno popularna", odnosno da ima minimalan broj posjetilaca, i Google **ne objavljuje taj prag** ([Chrome docs](https://developer.chrome.com/docs/crux/methodology)). Search Console CWV izvještaj radi na 28-dnevnom prozoru i grupiše URL-ove ako pojedinačni nemaju dovoljno podataka ([Google](https://support.google.com/webmasters/answer/9205520)).

Praktična posljedica: sajt sa 300 posjeta mjesečno vjerovatno **neće imati nikakve field podatke**. Zato u proizvodu moramo:
- prikazivati lab podatke (Lighthouse) kao naš mjerljiv ishod,
- jasno reći da field podaci mogu biti nedostupni,
- i ne prikazivati prazan CWV panel kao neuspjeh.

### 5.3 Zamke u Search Console podacima

Google sam dokumentuje nekoliko:
- **Anonimizirani upiti.** Filtriranje po upitu ili URL-u mijenja ukupne brojeve "zbog skraćivanja podataka i izostavljanja anonimiziranih upita" ([Google](https://support.google.com/webmasters/answer/17011165)). Zbir redova se neće poklopiti sa ukupnim brojem i to nije bug.
- **Dan u sedmici.** Google preporučuje poređenje po sedmicama ili mjesecima, ne po danima, da bi se neutralisao efekat dana u sedmici ([Google](https://support.google.com/webmasters/answer/17011165)).
- **Limit od 1000 redova** u izvještajima.
- **Preliminarni podaci** na zadnjih par dana, označeni tačkastom linijom.

### 5.4 Sezonalnost i volatilnost

Dva izvora šuma koja mogu potpuno da progutaju naš efekat:

1. **Sezona.** Krovopokrivač u novembru i krovopokrivač u martu nisu isti biznis. Poređenje "30 dana prije i 30 dana poslije" bez korekcije za sezonu je metodološki bezvrijedno. Minimalna korekcija: uporediti i sa istim periodom prethodne godine (year over year), i po mogućnosti normalizovati Google Trends indeksom za ključnu temu.
2. **Volatilnost rangiranja.** Vidi tabelu update-ova u sekciji 3.3. U 2026. je bilo core update-ova u martu i maju, i spam update-ova u martu, junu i avgustu ([Google Search Status](https://status.search.google.com/summary)). Prosječan 30-dnevni prozor ima realnu šansu da preklopi neki od njih.

### 5.5 Odbranjiva metodologija prije i poslije

Zlatni standard je SEO A/B test sa kontrolnom grupom stranica. SearchPilot metodologija: stranice (ne korisnici) se dijele u kontrolnu i varijantnu grupu koje istorijski trenduju zajedno, gradi se prognoza za obje, pa se mjeri odstupanje stvarnog od prognoziranog, sa pragom od 95% pouzdanosti, tipično kroz 2 do 4 sedmice ([SearchPilot](https://www.searchpilot.com/resources/blog/what-is-seo-split-testing)). Oni izričito kažu zašto obično prije/poslije poređenje pada: nema kontrole, pa se ne može razdvojiti efekat izmjene od sezone, Google update-a i konkurencije.

Problem: to zahtijeva dovoljno stranica i saobraćaja. Sajt od 30 stranica to ne može. Zato predlažem **stepenastu metodologiju** po veličini klijenta:

**Nivo 1: svaki klijent (obavezno).**
- Izvještaj o izvršenju: šta je nađeno, šta je popravljeno, šta je ostalo. Bez ikakvih tvrdnji o rangiranju.
- Indeksni delta: broj indeksiranih stranica prije i poslije, sa datumima.
- Lab performanse: Lighthouse skor i LCP/CLS/INP prije i poslije, na istoj mreži i uređaju.
- Snippet snapshot: screenshot kako izgleda SERP unos za 5 do 10 ključnih stranica prije i poslije.

**Nivo 2: klijenti sa dovoljno saobraćaja (recimo 1000+ impresija mjesečno).**
- Prozor od **90 dana poslije naspram 90 dana prije**, ne 30.
- Uz to year over year poređenje istog perioda.
- Segmentacija po tipu stranice: popravljene stranice naspram nepopravljenih stranica na istom sajtu. Ovo je najbliža stvar kontrolnoj grupi koju mali sajt može da ima i vrlo je uvjerljiva vizuelno.
- Isključiti brendirane upite iz analize, jer oni maskiraju sve.
- Overlay core update perioda sa Google Search Status dashboarda.

**Nivo 3: klijenti sa šablonskim stranicama (50+ sličnih stranica).**
- Pravi split test: popraviti pola, ostaviti pola, mjeriti 4 sedmice, pa popraviti ostatak. Ovo je jedini način da se stvarno dokaže kauzalnost.

**Šta nikad ne raditi:** poređenje sedmica naspram sedmice, prikazivanje "prosječne pozicije" kao glavne metrike uspjeha, i mijesanje brendiranih i nebrendiranih upita u istom grafikonu.

---

## 6. Šta obećavati i šta ne

Google je u junu 2026. objavio dokument o vrednovanju trećih strana i SEO alata, i to je najkorisniji dokument koji postoji za naš pravni i marketinški tekst ([Google: Third-Party SEO Tools, Services & Advice](https://developers.google.com/search/docs/fundamentals/third-party-seo), objavljen oko 5. do 7. juna 2026., vidi [Search Engine Journal](https://www.searchenginejournal.com/googles-new-guidance-claims-authority-over-seo-tools-and-aeo-geo/578162/)).

Ključne rečenice koje nas direktno pogađaju:
- "Third-party tools don't have access to our internal ranking data. They can't guarantee performance."
- "Google doesn't evaluate third-party services, so be wary of such claims and those making them."
- "using a service or tool doesn't guarantee ranking success"
- "Any predictions are their own and like predictions generally, may not happen."

Uz to, stariji Google dokument o angažovanju SEO stručnjaka kaže: "No one can guarantee a #1 ranking on Google. Beware of SEOs that claim to guarantee rankings, allege a 'special relationship' with Google, or advertise a 'priority submit' to Google." ([Google](https://developers.google.com/search/docs/fundamentals/do-i-need-seo)).

### 6.1 Zabranjene formulacije

| Ne pisati | Zašto |
|---|---|
| "Podigni svoj ranking" / "Rangiraj se više" | Direktno protivrječi Google smjernicama i mi to ne kontrolišemo |
| "Garantovano više prometa" | Nemamo uticaj na potražnju ni na AI Overviews |
| "Google-approved popravke" / "Usklađeno sa Google algoritmom" | Google izričito kaže da ne evaluira treće strane |
| "SEO skor 94/100" kao glavna metrika | Skor je naš interni izum, ne Google metrika. Google upozorava na predikcije trećih strana |
| "Rezultati za 30 dana" | Google kaže nekoliko dana do nekoliko mjeseci, a Ohye 4 do 12 mjeseci |
| "Popravljamo tvoj E-E-A-T" | E-E-A-T nije faktor rangiranja koji se popravlja tagovima |
| "Optimizovano za AI pretragu" / "GEO optimizacija" | Google kaže da nema dodatnih zahtjeva ni posebne schema za AI funkcije |
| "Tvoj naslov će se prikazati u Googleu" | Prepisuje se u do 76% slučajeva |

### 6.2 Dozvoljene i preporučene formulacije

Pravilo: **obećavamo izlaz, ne ishod.**

| Umjesto | Napiši |
|---|---|
| "Podići ćemo vam ranking" | "Nalazimo i popravljamo tehničke prepreke zbog kojih Google možda ne vidi, ne indeksira ili pogrešno prikazuje vaše stranice." |
| "Više prometa za 30 dana" | "Popravke izvršavamo u roku od 24 sata. Google tipično ponovo popuže izmijenjene stranice za nekoliko dana do nekoliko sedmica, a za procjenu efekta na rangiranje preporučujemo prozor od 90 dana." |
| "Garantujemo prvu stranicu" | "Ne garantujemo pozicije. Niko to ne može, i Google izričito upozorava na takva obećanja." (uz link na Google dokument) |
| "Naš SEO skor" | "Tidywright Health Score mjeri koliko vaš sajt prati javno objavljene Google smjernice. To nije Google metrika i ne predviđa poziciju." |
| "Optimizovano za AI" | "Google kaže da za AI Overviews i AI Mode ne postoje dodatni zahtjevi izvan standardne SEO higijene. Mi radimo tu higijenu." (link na [Google AI features](https://developers.google.com/search/docs/appearance/ai-features)) |
| "Popravili smo 47 SEO problema" | "Popravili smo 47 problema. Od toga 3 su blokirala indeksiranje, 12 utiče na to kako se stranica prikazuje u rezultatima, 32 su higijena i pristupačnost." (klasifikacija po ozbiljnosti, ne sirov broj) |

### 6.3 Tekst za onboarding, doslovno upotrebljiv

> **Šta Tidywright radi, a šta ne radi**
>
> Radimo: skeniramo sajt, nalazimo tehničke i on-page probleme, generišemo i primjenjujemo popravke, i pokazujemo vam tačno šta je promijenjeno.
>
> Ne radimo: ne pišemo vam sadržaj za nove teme, ne gradimo linkove, i ne možemo da garantujemo poziciju u Googleu. Google izričito kaže da nijedan alat ne može da garantuje rangiranje, jer nijedan alat nema pristup njihovim internim podacima.
>
> Realan rok: Google ponovo obilazi izmijenjene stranice za nekoliko dana do nekoliko sedmica. Za promjene koje se tiču kvaliteta, Google navodi da može trebati i nekoliko mjeseci da njihovi sistemi to potvrde. Zato prvi ozbiljan izvještaj šaljemo nakon 90 dana, a ne nakon 30.
>
> Ako vaš sajt nema sadržaj za teme koje ljudi traže, ili nema nijedan link sa drugih sajtova, naše popravke neće to nadoknaditi. U tom slučaju ćemo vam to reći u izvještaju, umjesto da vam prodajemo još skeniranja.

### 6.4 Očekivanja koja treba postaviti u prvom emailu, ne u trećem mjesecu

Najveći uzrok osjećaja prevare nije loš proizvod, nego nepostavljeno očekivanje. Konkretno:
- Reci unaprijed da je 68% Google pretraga u 2026. bez klika ([SparkToro](https://sparktoro.com/blog/in-2026-less-than-one-third-of-google-searches-still-send-a-click/)).
- Reci unaprijed da impresije mogu porasti a klikovi pasti, i objasni zašto ([Ahrefs: Great Decoupling](https://ahrefs.com/blog/the-great-decoupling/)).
- Reci unaprijed da Google prepisuje naslove i da to nije naša greška.
- Reci unaprijed koje probleme ne možemo riješiti (sadržaj, linkovi, konkurencija, sezona).

---

## 7. Šta se promijenilo 2025. i 2026.

### 7.1 Klik je postao rijedak

| Nalaz | Broj | Izvor |
|---|---|---|
| Google pretrage bez klika, početak 2026. | 68,01% (2024: 60,45%) | [SparkToro i Similarweb](https://sparktoro.com/blog/in-2026-less-than-one-third-of-google-searches-still-send-a-click/), [Search Engine Land](https://searchengineland.com/google-zero-click-searches-2026-study-479717) |
| Pad CTR-a na poziciji 1 kad postoji AI Overview | 58% (bilo 34,5% u aprilu 2025) | [Ahrefs, 300.000 ključnih riječi](https://ahrefs.com/blog/ai-overviews-reduce-clicks-update/) |
| Klik na klasičan rezultat kad je AI sažetak prisutan | 8% posjeta, naspram 15% bez sažetka | [Pew Research, 900 odraslih, 68.879 pretraga](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/) |
| Klik na link unutar AI sažetka | 1% | [Pew Research](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/) |
| Korisnik završi sesiju nakon AI sažetka | 26% naspram 16% | [Pew Research](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/) |
| AI Mode mjesečni aktivni korisnici | preko 1 milijarda globalno | [Google blog](https://blog.google/products-and-platforms/products/search/ai-mode-us-insights/) |
| AI Overviews mjesečni aktivni korisnici | preko 2,5 milijarde | [Google blog](https://blog.google/products-and-platforms/products/search/new-controls-website-owners/) |

Napomena o kvalitetu dokaza: Pew studija je najjača metodološki (probabilistički panel, stvarni clickstream), ali je iz marta 2025. i uzorak je samo SAD. Ahrefs i SparkToro brojevi su korelacioni i oslanjaju se na komercijalne panele; SparkToro sam priznaje da poređenje kroz godine koristi različite izvore podataka (Jumpshot, Datos, Similarweb) i da je zato približno.

**Šta to znači za on-page rad.** Dvije stvari. Prva: "great decoupling" je stvaran. Ahrefs mjeri da je korelacija impresija i klikova pala sa +0,425 krajem 2024. na -0,352 početkom 2025 ([Ahrefs](https://ahrefs.com/blog/the-great-decoupling/)). Dakle sajt može da bude vidljiviji a da dobija manje klikova. Druga: CTR poluge (naslov, opis, rich results) gube na vrijednosti jer sve manji dio SERP-a uopšte generiše klik.

### 7.2 Google sada mjeri AI vidljivost, ali samo impresije

Od 31. avgusta 2026. Generative AI performance report je globalno dostupan u Search Console ([Google Search Central](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports), [Search Engine Land](https://searchengineland.com/google-search-console-ai-performance-reports-and-search-generative-ai-control-rolling-out-globally-486269)).

Šta pokazuje:
- Impresije iz AI Overviews i AI Mode, po stranici, zemlji, uređaju i datumu.
- **Ne pokazuje klikove** ([Search Engine Land](https://searchengineland.com/google-search-console-ai-performance-reports-and-search-generative-ai-control-rolling-out-globally-486269)).
- Isključuje Search Labs eksperimente i Discover ([Google Search Console Help](https://support.google.com/webmasters/answer/16984139)).

Za nas: ovo je nova, autoritativna metrika koju možemo prikazati, i klijenti će je tražiti. Ali oprez, jer istorijski podaci postoje samo od kada je property dobio pristup, pa poređenje prije i poslije za starije klijente neće raditi.

Uz to, Google je dodao i **kontrolu** kojom vlasnik sajta može da isključi sajt iz generativnih AI funkcija u pretrazi, uz napomenu da tada ne dobija ni promet ni impresije odatle ([Google blog](https://blog.google/products-and-platforms/products/search/new-controls-website-owners/)). To je opcija koju treba prikazati, ali skoro nikad preporučiti.

### 7.3 Google je eksplicitno ubio "AI SEO" kao zasebnu disciplinu

Ovo je vjerovatno najkorisnija vijest za nas jer briše čitavu kategoriju konkurentskih obećanja.

Google dokument o AI funkcijama: "There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary." I dalje: "There's also no special schema.org structured data that you need to add." ([Google](https://developers.google.com/search/docs/appearance/ai-features)).

Google vodič za optimizaciju za generativne AI funkcije (objavljen maj 2026., ažuriran jun 2026.) kaže da ne trebate praviti nove mašinski čitljive fajlove, AI tekst fajlove, markup ni Markdown, da "chunking" sadržaja nije potreban, da prepisivanje sadržaja za AI sisteme nije potrebno, i da dužina stranice ne igra ulogu ([Google](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)).

### 7.4 llms.txt ne radi ništa

Google je 15. juna 2026. ažurirao AI optimization guide upravo da razjasni upotrebu llms.txt fajlova ([Google updates](https://developers.google.com/search/updates)). Formulacija je: Google Search ne koristi llms.txt i njegovo kreiranje "neće ni naškoditi ni pomoći" vidljivosti ili rangiranju u Google pretrazi ([Google](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)).

John Mueller je u januaru 2026., na pitanje da li prisustvo llms.txt na Google propertyjima znači podršku formatu, odgovorio kratko: "no" ([Search Engine Roundtable](https://www.seroundtable.com/google-does-not-endorse-llms-txt-40789.html)).

**Preporuka za proizvod:** ne dodavati llms.txt kao check koji utiče na skor. Ako ga uopšte nudimo, nuditi ga kao opcionu stavku sa jasnom oznakom "nema dokazanog efekta na Google pretragu". Alternativa je da ga izbacimo iz skora i stavimo u "eksperimentalno". Iskrenost ovdje je konkurentska prednost jer većina alata to i dalje prodaje kao feature.

### 7.5 Core update-ovi i helpful content

Helpful content sistem je od marta 2024. integrisan u glavni sistem rangiranja i više ne postoji kao zaseban update ([Google Search Central](https://developers.google.com/search/blog/2024/03/core-update-spam-policies)). Praktična posljedica: nema više "oporavka od HCU"; postoji samo kontinuirana procjena kvaliteta koja se konsoliduje kroz core update-ove.

Google je u avgustu 2026. ažurirao politiku o zloupotrebi reputacije sajta, uz izmjenu pristupa sprovođenju unutar Evropskog ekonomskog prostora ([Google](https://developers.google.com/search/blog/2026/08/update-site-reputation-policy), [Search Engine Land](https://searchengineland.com/google-wont-respect-manual-actions-for-site-reputation-abuse-in-european-economic-area-486055)). Relevantno samo ako ciljamo izdavače, ne za tipičan SMB.

### 7.6 Google je počeo da napada treće strane

Novi dokument iz juna 2026. o trećim stranama (sekcija 6) nije samo pravni tekst. To je signal da Google želi da bude jedini izvor istine o SEO-u i da otvoreno dovodi u pitanje vrijednost alata poput našeg ([Search Engine Journal analiza](https://www.searchenginejournal.com/googles-new-guidance-claims-authority-over-seo-tools-and-aeo-geo/578162/)).

Naša odbrana nije da to ignorišemo, nego da ga citiramo prije nego što ga klijent nađe. Alat koji sam kaže "Google kaže da nijedan alat ne može garantovati rangiranje, i mi to ne garantujemo" je vjerodostojniji od alata koji obećava prvu poziciju.

---

## Šta ovo znači za proizvod

### A. Prioritizacija 176 checkova: četiri sloja, ne jedna lista

Predlažem da se svi checkovi preklasifikuju u četiri sloja, i da **skor bude ponderisan po sloju**, umjesto trenutnog (pretpostavljam) ravnomjernog bodovanja. Ravnomjerno bodovanje je glavni uzrok osjećaja prevare: klijent popravi 140 od 176 stavki, skor skoči sa 42 na 88, i ništa se ne desi, jer je svih 140 bilo iz sloja 4.

**Sloj 1: Blokatori (procjena 10 do 15 checkova). Ponder ~50% skora.**
Sve što sprečava indeksiranje ili prikazivanje.
- noindex na stranicama koje treba da se indeksiraju
- robots.txt blokira stranicu koja ima noindex (Google: pravilo se nikad ne vidi)
- robots.txt blokira CSS/JS potreban za renderovanje
- 4xx/5xx na stranicama u navigaciji ili sitemapu
- kanonikal pokazuje na pogrešnu stranicu, na noindex stranicu, ili na 404
- lanci i petlje preusmjerenja
- sajt ne radi na mobilnom (od 2024. znači: ne indeksira se)
- nema HTTPS ili je mixed content
- orphan stranice bez ijednog internog linka

Ovo su jedini checkovi za koje smijemo reći "ovo je moglo da vas košta sve".

**Sloj 2: Prikaz u rezultatima (procjena 25 do 35 checkova). Ponder ~25%.**
- naslov nedostaje, duplira se, kraći od 15 ili duži od 60 znakova
- naslov sadrži uglaste zagrade ili pipe separator (vidi Zyppy podatke)
- H1 se ne poklapa sa naslovom
- meta opis nedostaje ili se duplira
- Organization / LocalBusiness / Breadcrumb schema nedostaje ili je nevalidna
- Open Graph za dijeljenje
- favicon, jer ga Google prikazuje u mobilnim rezultatima

Formulacija u UI-u: "utiče na to kako izgledate u rezultatima", nikad "utiče na poziciju".

**Sloj 3: Kvalitet i struktura (procjena 30 do 40 checkova). Ponder ~20%.**
- tanke stranice
- duplirani ili skoro duplirani sadržaj
- interna struktura linkova, dubina klika od početne
- anchor tekst tipa "kliknite ovdje"
- Core Web Vitals (lab)
- veličine i formati slika, nedostajuće dimenzije koje uzrokuju CLS
- nedostajuće stranice po usluzi (ovo je najvredniji "check" koji vjerovatno još nemamo)

**Sloj 4: Higijena i pristupačnost (ostatak, procjena 90 do 110 checkova). Ponder ~5%.**
- alt tekst
- redoslijed H2/H3
- lang atribut
- sitemap na malom sajtu
- hreflang na monolingvalnom sajtu (ovo treba potpuno sakriti ako je sajt jednojezičan)
- kontrast, ARIA, tab redoslijed

Ovi checkovi su i dalje vrijedni, ali kao pristupačnost i urednost, ne kao SEO. Označiti ih jasno.

**Checkovi koje treba izbaciti ili degradirati:**
- llms.txt: izbaciti iz skora, eventualno ostaviti kao info sa eksplicitnom napomenom da Google ne koristi
- bilo kakav "E-E-A-T skor": preimenovati u "signali povjerenja" i opisati kao best practice, ne kao faktor rangiranja
- gustina ključnih riječi, ako postoji: Google izričito kaže da dužina sadržaja ne utiče i da je ponavljanje protiv spam politika
- meta keywords: Google ga ne koristi, prikazati samo kao informaciju

### B. Šta prikazati klijentu

**Na dashboardu, redoslijedom:**

1. **Blokatori, kao zaseban i najistaknutiji panel.** "3 stranice su bile nevidljive za Google. Popravljeno." Ovo je jedina tvrdnja u proizvodu koja je i dramatična i istinita.
2. **Indexed pages trend**, povučen iz Search Console API-ja, sa markerom datuma naših popravki. Ovo je najčistiji kauzalni dokaz koji imamo.
3. **Snippet prije i poslije**, kao vizuelni prikaz SERP unosa. Ljudi razumiju sliku.
4. **Lab performanse prije i poslije**, sa jasnom napomenom da su to laboratorijski uslovi.
5. **AI vidljivost (impresije)** iz novog Generative AI performance reporta, sa napomenom da Google ne daje klikove za taj kanal.
6. **Impresije, pozicija i CTR tek ispod svega toga**, sa sivim trakama za Google core update periode i sa year over year linijom.

**Šta dodati što vjerovatno nemamo:**
- **Sivi overlay core update perioda** na svakom grafikonu, povučen sa Google Search Status dashboarda. Ovo je jeftino za implementaciju i ogromno za vjerodostojnost, jer objašnjava padove koji nisu naša krivica.
- **Podjela brendirani naspram nebrendirani upiti.** Bez ovoga svaki grafikon laže.
- **"Popravljene naspram nepopravljenih stranica"** segment u izvještaju. To je naša kvazi kontrolna grupa i najjači argument koji možemo imati.
- **Odbrojavanje do prvog validnog izvještaja.** Umjesto da klijent gleda prazan grafikon 90 dana, prikaži "Prvi izvještaj o efektu: 12. decembar. Do tada pratimo indeksiranje i tehničke ishode." Ovo pretvara čekanje iz frustracije u očekivanje.
- **Detekcija plafona.** Ako smo popravili sve iz sloja 1 do 3 i sajt i dalje nema promet, alat treba sam da kaže: "Tehnički je sve čisto. Vaš problem više nije tehnički, nego sadržaj i vidljivost. Evo šta biste dalje trebali." Klijent koji to čuje od nas neće se osjećati prevarenim, nego savjetovanim.

### C. Šta obećati

Jedna rečenica za sajt:

> Tidywright nalazi i popravlja tehničke prepreke zbog kojih Google ne vidi, ne indeksira ili pogrešno prikazuje vaše stranice. Ne garantujemo pozicije, jer to niko ne može.

Jedna rečenica u ugovoru:

> Isporuka je izvršena skeniranje, klasifikovan nalaz i primijenjene popravke sa izvještajem o izmjenama. Pozicije u pretraživačima, broj posjeta i poslovni rezultati nisu predmet garancije, jer zavise od faktora van kontrole izvođača (algoritmi pretraživača, konkurencija, sezonska potražnja i kvalitet sadržaja).

Jedna rečenica u prvom onboarding emailu:

> Google obično ponovo obiđe izmijenjene stranice za nekoliko dana do nekoliko sedmica, a za promjene koje se tiču kvaliteta sam navodi da može trebati i nekoliko mjeseci. Zato prvi ozbiljan izvještaj šaljemo nakon 90 dana, ne nakon 30.

### D. Kratka lista rizika za osnivača

1. **Skor koji raste bez ishoda je najveći rizik za churn.** Ponderisanje po sloju je najvažnija pojedinačna izmjena koju predlažem.
2. **30-dnevni ciklus naplate protiv 90-dnevnog ciklusa dokaza je strukturni problem.** Razmisliti o modelu gdje se prvi mjesec naplaćuje kao jednokratna dijagnostika i izvršenje, a pretplata počinje tek kasnije, ili gdje se pretplata prodaje kao monitoring i održavanje, a ne kao rast.
3. **Klijenti bez sadržaja i bez linkova su najskuplji za podršku i najskloniji da se osjećaju prevarenim.** Razmisliti o kvalifikaciji pri registraciji: ako sajt ima ispod X stranica i nula referring domena, prikazati upozorenje prije naplate.
4. **Google aktivno potkopava povjerenje u alate trećih strana.** Citirati Google prije nego što klijent pročita Google.

---

## Izvori

**Google primarni izvori**
- [Influencing Title Links in Google Search](https://developers.google.com/search/docs/appearance/title-link)
- [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Introduction to Structured Data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Page Experience](https://developers.google.com/search/docs/appearance/page-experience)
- [Consolidate Duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Canonicalization Troubleshooting](https://developers.google.com/search/docs/crawling-indexing/canonicalization-troubleshooting)
- [Block Search Indexing with noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [Sitemaps Overview](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Localized Versions / hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Image SEO Best Practices](https://developers.google.com/search/docs/appearance/google-images)
- [Managing Crawl Budget for Large Sites](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget)
- [Ask Google to Recrawl Your URLs](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
- [Googlebot](https://developers.google.com/search/docs/crawling-indexing/googlebot)
- [Google Search's Core Updates](https://developers.google.com/search/updates/core-updates)
- [Google Search Status Dashboard](https://status.search.google.com/summary)
- [Latest Google Search Documentation Updates](https://developers.google.com/search/updates)
- [AI Features and Your Website](https://developers.google.com/search/docs/appearance/ai-features)
- [Guide to Optimizing for Generative AI Features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Guidance on Third-Party SEO Tools, Services & Advice](https://developers.google.com/search/docs/fundamentals/third-party-seo)
- [Do I Need an SEO?](https://developers.google.com/search/docs/fundamentals/do-i-need-seo)
- [Introducing Search Generative AI performance reports](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports)
- [Update to the Site Reputation Policy (avgust 2026)](https://developers.google.com/search/blog/2026/08/update-site-reputation-policy)
- [March 2024 core update and new spam policies](https://developers.google.com/search/blog/2024/03/core-update-spam-policies)
- [HTTPS as a ranking signal (2014)](https://developers.google.com/search/blog/2014/08/https-as-ranking-signal)
- [Demystifying the duplicate content penalty (2008)](https://developers.google.com/search/blog/2008/09/demystifying-duplicate-content-penalty)
- [Search Console: Performance report metrics](https://support.google.com/webmasters/answer/7042828)
- [Search Console: Advanced filtering and comparison](https://support.google.com/webmasters/answer/17011165)
- [Search Console: Core Web Vitals report](https://support.google.com/webmasters/answer/9205520)
- [Search Console: Generative AI performance report](https://support.google.com/webmasters/answer/16984139)
- [CrUX Methodology](https://developer.chrome.com/docs/crux/methodology)
- [web.dev: Core Web Vitals](https://web.dev/articles/vitals)
- [web.dev: The business impact of Core Web Vitals](https://web.dev/case-studies/vitals-business-impact)
- [Google blog: How AI Mode is changing search](https://blog.google/products-and-platforms/products/search/ai-mode-us-insights/)
- [Google blog: New opportunities, control and insights for website owners](https://blog.google/products-and-platforms/products/search/new-controls-website-owners/)

**Studije i nezavisna istraživanja**
- [Pew Research Center: Do people click on links in Google AI summaries? (jul 2025)](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/)
- [Zyppy: Google Rewrites 61% of Page Title Tags](https://zyppy.com/seo/google-title-rewrite-study/)
- [Ahrefs: How Often Does Google Rewrite Meta Descriptions?](https://ahrefs.com/blog/meta-description-study/)
- [Ahrefs: AI Overviews Reduce Clicks by 58%](https://ahrefs.com/blog/ai-overviews-reduce-clicks-update/)
- [Ahrefs: The Great Decoupling](https://ahrefs.com/blog/the-great-decoupling/)
- [Ahrefs: 96.55% of Content Gets No Traffic From Google](https://ahrefs.com/blog/search-traffic-study/)
- [SparkToro: In 2026, Less than One Third of Google Searches Still Send a Click](https://sparktoro.com/blog/in-2026-less-than-one-third-of-google-searches-still-send-a-click/)
- [SearchPilot: What is SEO A/B testing](https://www.searchpilot.com/resources/blog/what-is-seo-split-testing)
- [SearchPilot: 10 SEO A/B tests with over 10% impact](https://www.searchpilot.com/resources/blog/10-seo-ab-tests-with-an-impact-of-over-10-percent)
- [SearchPilot: Most surprising tests of 2025](https://www.searchpilot.com/resources/case-studies/a-look-back-at-the-most-surprising-tests-of-2025)
- [Whitespark: 2026 Local Search Ranking Factors](https://whitespark.ca/local-search-ranking-factors/)
- [BrightLocal: Local Consumer Review Survey 2026](https://www.brightlocal.com/research/local-consumer-review-survey/)
- [Semrush Ranking Factors Study](https://go.semrush.com/Ranking-Factors.html)

**Industrijski izvještaji i izjave Googleovih predstavnika**
- [Search Engine Land: Google changed 76% of title tags in Q1 2025](https://searchengineland.com/google-changed-76-of-title-tags-in-q1-2025-heres-what-that-means-454847)
- [Search Engine Land: Links are not a top 3 ranking factor, says Gary Illyes](https://searchengineland.com/links-google-search-ranking-factor-gary-illyes-432422)
- [Search Engine Land: Mobile-first indexing is complete](https://searchengineland.com/google-says-mobile-first-indexing-is-complete-after-almost-7-years-434011)
- [Search Engine Land: AI performance reports rolling out globally](https://searchengineland.com/google-search-console-ai-performance-reports-and-search-generative-ai-control-rolling-out-globally-486269)
- [Search Engine Land: Google zero-click searches reach 68% in early 2026](https://searchengineland.com/google-zero-click-searches-2026-study-479717)
- [Search Engine Land: Bing search ranking factors](https://searchengineland.com/a-deeper-dive-into-more-of-the-bing-search-ranking-factors-339714)
- [Search Engine Roundtable: Structured data does not make your site rank better (Mueller, april 2025)](https://www.seroundtable.com/google-structured-data-ranking-39232.html)
- [Search Engine Roundtable: Quality Raters Guidelines not a guide for rankings (Mueller, maj 2026)](https://www.seroundtable.com/google-search-quality-raters-guidelines-rankings-41414.html)
- [Search Engine Roundtable: Google does not endorse llms.txt (januar 2026)](https://www.seroundtable.com/google-does-not-endorse-llms-txt-40789.html)
- [Search Engine Roundtable: Google may recrawl URLs multiple times per day to every few months](https://www.seroundtable.com/google-recrawl-url-rate-37311.html)
- [Search Engine Roundtable: Google says give SEOs 4 to 12 months (Maile Ohye)](https://www.seroundtable.com/google-give-seos-4-12-months-23419.html)
- [Search Engine Journal: Google rewrites meta descriptions over 70% of the time (Portent)](https://www.searchenginejournal.com/google-rewrites-meta-descriptions-over-70-of-the-time/382140/)
- [Search Engine Journal: Google's new guidance claims authority over SEO tools and AEO/GEO](https://www.searchenginejournal.com/googles-new-guidance-claims-authority-over-seo-tools-and-aeo-geo/578162/)
- [uSERP: Google confirms fixing headings won't improve rankings](https://userp.io/news/google-confirms-fixing-headings-wont-improve-rankings/)
- [Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)

---

*Dokument pripremljen 14.09.2026. Brojevi i citati su tačni na taj datum. Google mijenja dokumentaciju često, pa svaki citat iz Google docsa treba provjeriti prije nego što uđe u marketinški materijal.*