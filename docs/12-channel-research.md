# Istraživanje kanala

Istraženo 13. septembra 2026. sa osam paralelnih agenata. Svaki je dobio isti nalog:
provjeri na primarnim izvorima, označi šta je provjereno a šta zaključeno, ne izmišljaj
brojke. Ovdje je sažetak. Zaključak je na dnu.

## Šta je palo

### WordPress direktorij kao glavni kanal
- Pretraga direktorija rangira po broju instalacija na logaritamskoj skali bez gornje
  granice, a ocjene su stisnute u nebitnost. Interni tiket meta.trac #8298 to dokumentuje.
  Primjer: SiteGround je 31.5.2026. sam instalirao svoj plugin na milion sajtova i za
  nekoliko dana bio #2 u pretrazi sa ocjenom 1,3.
- Studija 7.032 pluginova (dev.to, avgust 2026): 88 posto novih koji su probili već su
  imali distribuciju prije ulaska. Od 69 nepoznatih autora uspjela su 2.
- Oko 980 pluginova se bori za tag "seo". Yoast ima 27.811 ocjena.
- Upravljanje: sudski spor Automattic protiv WP Engine traje i u augustu 2026. Direktorij
  kontroliše jedna osoba bez žalbenog mehanizma. Od 5.6.2026. sva ažuriranja pluginova
  imaju obavezno kašnjenje od 24 sata, što znači da ne možeš isti dan popraviti klijenta
  kad promijeniš API.
- Smjernica 5 zabranjuje probne periode i zaključane funkcije unutar pluginova.
- Pregled traje realno 2 do 6 sedmica, oko 29 posto podnesaka se odbija.
- **Presuda: sekundarni kanal, nikad glavni.** Besplatni plugin služi kao ulaz za promet
  koji dovedeš odnekud drugdje.

### Hladan kontakt s agencijama kao prvi kanal
- Prosječna stopa odgovora na hladne mailove 3,43 posto (Instantly, milijarde poruka,
  2025). Duboka personalizacija koja to nadmašuje košta 10 do 15 minuta po mailu.
- Pet sati sedmično daje oko 20 mailova sedmično, što je 1 do 2 kupca mjesečno u najboljem
  slučaju.
- Od novembra 2025. Google i Microsoft trajno odbijaju mail bez SPF, DKIM, DMARC i
  poravnanja domena. Nije više meko kažnjavanje, nego 550 greška.
- Zajednice gdje su agencije zabranjuju prodavce: r/SEO briše promociju alata, Online
  Geniuses (53.000 članova) izričito zabranjuje promotivne poruke.
- Medijana WordPress agencije je jedna osoba i oko 50.000 dolara godišnje (The Admin Bar,
  n=622). "Agencija od 5 do 50 ljudi" je vrh tržišta, ne sredina.
- Agencije se opiru alatima koji diraju klijentske sajtove: "nepregledane automatske
  izmjene na klijentskim sajtovima su rizik za reputaciju".
- **Presuda: nije prvi kanal.** Radi kao instrument za učenje, 20 do 30 mailova sedmično
  ka agencijama kojima možeš navesti postojećeg kupca.

### Shopify App Store
- Kategorija SEO ima 1.114 aplikacija. Vrh drži šest freemium paketa s automatskim
  popravkama i 2.400 do 5.500 ocjena, sve s podrškom 24 sata i značkom Built for Shopify.
  Aplikacije koje samo auditiraju (Plug in SEO, Webrex Audit) su segment koji gubi.
- Pregled traje 1 do 4 mjeseca, s tihim odbijanjima. Naplata mora ići kroz Shopify.
- Pisanje u trgovinu je nativno za title, meta, alt, preusmjerenja i JSON-LD, ali ne za
  fajlove teme bez izuzeća.
- Prihod: 0 posto do prvog milion dolara, poslije 15 posto.
- Rupa koja postoji: nijedna aplikacija na vrhu nema pregled razlike prije primjene ni
  vraćanje unazad. Kupci u ocjenama s jednom zvjezdicom vrište upravo o tome ("obrisali
  su sve meta opise na svim stranicama").
- **Presuda: moguće, ali ne bolje od WordPressa.** Traži podršku i mašinu za skupljanje
  ocjena koju jedan čovjek s 20 sati ne može da drži.

### Citiranje u AI asistentima
- Potražnja je stvarna: 51 posto B2B kupaca počinje istraživanje u chatbotu (G2, n=1.076,
  mart 2026).
- Ali ponuda se ne može kupiti ni inženjerski proizvesti: llms.txt nema efekta (SE Ranking
  300.000 domena, Trakkr 37.894 domene), schema nema efekta na citiranje (Ahrefs, 1.885
  stranica, kontrolisano), ocjene objašnjavaju manje od 2 posto varijanse (G2 vlastita
  regresija). ChatGPT mijenja 74 posto izvora sedmično (SISTRIX).
- Šta se citira za "best X tool": liste na trećim sajtovima (100 posto odgovora, AIVO),
  Reddit niti, YouTube, Wikipedia. G2 i Capterra su kapija za uključenje, ne izvor.
- **Presuda: prateći kanal.** Besplatna higijena koja košta nula: G2 i Capterra do 10 pa
  20 ocjena, stranice poređenja s godinom u naslovu, iskreni Reddit komentari, jedan
  YouTube prikaz.

### Hosting partnerstva i platforme
- Hostovi grade ili kupuju umjesto da partneruju: Newfold je kupio Yoast, Brainstorm Force
  napravio SureRank, Hostinger gura "ugrađeno". Gdje partneruju, to su firme s
  investicijom nakon godina (Patchstack, 5 miliona dolara, tek u aprilu 2026. u GoDaddy).
- Duda bira nekoliko partnera po kategoriji i već ima konkurenta (FRANK) u SEO slotu.
  Squarespace nema API za pisanje SEO polja. Cloudflare nema tržnicu.
- Vendasta traži potpisan ugovor i dokaz da si već prodao jednom preprodavcu. Igra za 12.
  mjesec.
- **Wix App Market je jedini dostupan:** 100 posto prihoda prvu godinu, 80 posto poslije,
  Wix naplaćuje. Kategorija SEO ima 101 aplikaciju, Rabbit SEO ima 2.227 ocjena na 15 do
  255 dolara. Item SEO Tags API dozvoljava pisanje titla i meta. Ali Wix publika su mali
  sajtovi s malim budžetom.

### Besplatni alati i lansirne platforme
- Ahrefs objavljuje da su im besplatni alati među najposjećenijim stranicama ali ne
  objavljuje konverziju. Niko je ne objavljuje.
- Jedini rankabilan skup za novu domenu: Open Graph checker (oko 2.500 pretraga mjesečno u
  SAD, konkurencija oglasa 0,01, drže ga mali nezavisni sajtovi). Korisnik je programer ili
  SEO koji upravo objavljuje stranicu, što je naša publika. Gradi se za jedan dan.
- "seo checker", "seo audit tool", "schema validator": nedostižno.
- Product Hunt: stopa isticanja pala sa 60 na 10 posto. Vrijedi jedan dan zbog backlinka
  DR 91. Očekivati stotine posjeta i desetine prijava, ne kupce.
- Plaćeni direktoriji i newsletter sponzorstva: van dometa bez budžeta.

## Šta je preživjelo

### 1. Ugradbeni widget za audit, s prikazom popravki
- Kategorija postoji 13 godina: SEOptimer (59 dolara mjesečno za ugradnju), SE Ranking
  Lead Generator, MySiteAuditor (79 dolara, od 2013, tvrdi 1,5 miliona leadova), WebCEO,
  Semrush, plus talas 2025. i 2026. na 29 do 39 dolara.
- Agencije to kupuju jer im je sticanje klijenata problem broj jedan (AgencyAnalytics,
  n=494: 30 posto). Widget rješava njihov problem, ne dira njihove klijente.
- **Potvrđena rupa:** svih 12 provjerenih proizvoda daje ocjenu i listu problema. Nijedan
  ne prikazuje gotovu popravku, ni napisan title, ni meta opis, ni JSON-LD. Naša faza 2 je
  tačno to.
- Bijela etiketa čini dobavljača nevidljivim. Jedini mehanizam prepoznatljivosti koji je
  kategorija ikad imala je "powered by" na jeftinom paketu, i konkurencija ga baca jer ga
  kupci plaćaju da uklone.
- Nema čuvara kapije: nema reda za pregled, nema platforme koja može obrisati listing.
- Nezavisnih brojki o konverziji nema nigdje. Sve su tvrdnje dobavljača.
- Minimalna verzija: 4 do 6 sedmica za jednog čovjeka.

### 2. Vertikala: male advokatske kancelarije na WordPressu
- Jedina vertikala s provjerenim dokazom da je većina sajtova upisiva: 65 posto WordPress
  u uzorku od 1.323 sajta (Hennessey 2022).
- Najveća provjerena spremnost plaćanja: agencije naplaćuju 2.000 do 10.000 dolara
  mjesečno, FindLaw ima 17.000 firmi na ugovorima od 2 do 3 godine gdje "ne posjeduješ
  svoj sajt".
- Schema je bitna gdje pobjeđuju sadržajne stranice (prakse), a to su advokati. Kod
  zanatlija i restorana pobjeđuju ocjene i GBP, što ne diramo.
- Cijena: pravne zajednice su neprijateljske prema prodavcima, pa je put sadržaj koji
  cilja "Scorpion alternative" i "FindLaw alternative", a to je sporo.
- Zubari, nekretnine, restorani, klinike: zaključane platforme. Shopify: komoditizovano.

### 3. Wix App Market
- Vidi gore. Dostupno i samoposlužno, ali publika s najmanjim budžetom i Wix vlasništvo
  nad sajtom oslabljuje našu glavnu poruku.

## Zaključak istraživanja

Ne postoji kanal na koji se samo pojaviš i dobiješ kupce. Svaki je ili pretrpan, ili
zaključan, ili spor, ili mali. Tri su preživjela, i widget je jedini koji istovremeno:
ima potvrđenu potražnju na našoj cijeni, potvrđenu rupu koja je naša razlika, nema čuvara
kapije, i jeste isti kod kao naša faza 1 i 2.

Odluka je zapisana u `decisions/0004-first-channel.md` kad bude donesena.

## Izvori

Svaki agent je vratio potpunu listu izvora. Najvažniji:
- WordPress smjernice: https://developer.wordpress.org/plugins/wordpress-org/detailed-plugin-guidelines/
- WordPress rangiranje pretrage: https://meta.trac.wordpress.org/ticket/8298
- Studija 7.032 pluginova: https://dev.to/stackedboost/i-measured-7032-wordpress-plugins-to-find-out-how-anyone-gets-their-first-install-g4m
- Kašnjenje ažuriranja 24h: https://www.therepository.email/plugin-developers-and-site-maintainers-push-back-on-wordpress-orgs-24-hour-update-delay
- AgencyAnalytics 2026 benchmark: https://agencyanalytics.com/agency-benchmarks-2026
- The Admin Bar State of the WordPress Agency 2026: https://theadminbar.com/2026-survey/
- G2 istraživanje kupaca, mart 2026: https://www.prnewswire.com/news-releases/new-g2-research-half-of-b2b-software-buyers-now-start-their-research-with-ai-chatbots-302742807.html
- Instantly cold email benchmark 2026: https://instantly.ai/cold-email-benchmark-report-2026
- SEOptimer ugradnja: https://www.seoptimer.com/embeddable-audit-tool/
- MySiteAuditor: https://mysiteauditor.com/pricing
- SE Ranking Lead Generator: https://seranking.com/lead-generation.html
- Shopify SEO kategorija: https://apps.shopify.com/categories/store-design-site-optimization-seo
- Shopify udio prihoda: https://shopify.dev/docs/apps/launch/distribution/revenue-share.md
- Ahrefs schema i AI citiranje: https://ahrefs.com/blog/schema-ai-citations/
- SISTRIX nestabilnost izvora: https://www.sistrix.com/blog/ai-citation-drift-how-stable-are-sources-in-ai-search-results/
- Wix monetizacija: https://dev.wix.com/docs/build-apps/launch-your-app/pricing-and-billing/about-monetizing-your-app
- Ahrefs strategija besplatnih alata: https://ahrefs.com/blog/the-free-tools-seo-strategy/
- Hennessey studija advokatskih sajtova: https://hennessey.com/2022-state-of-law-firm-website-rankings/
- Whitespark faktori lokalnog rangiranja: https://whitespark.ca/local-search-ranking-factors/
