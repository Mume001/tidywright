# Otvorena pitanja

Redoslijed je namjeran. Svako sljedeće zavisi od prethodnog.

## 1. Prvi kanal. ODLUČENO

Widget za audit s prikazom popravki. Vidi `decisions/0004-first-channel.md`.

## 2. Opseg prve verzije widgeta. ODLUČENO

Vidi `decisions/0005-widget-scope.md` i specifikaciju `docs/13-widget-spec.md`.

## 3. Cijena. PRIJEDLOG SPREMAN

Prijedlog u `docs/24-billing.md`: Free 50 audita s "powered by", Starter 39 $ (500),
Agency 99 $ (2.500), Pro 249 $ (10.000), godišnje 10 za 12, trial 14 dana Starter bez
kartice. Treba Mumetovo da ili promjena brojki. Ne blokira frontend (ekran cijena
se pravi s ovim brojkama i mijenja u jednoj datoteci).

## 4. Uređivanje popravke

Odgođeno do faze 3. U widgetu se popravka samo prikazuje.

## 5. Stack. ODLUČENO

Supabase, Next.js, zaseban radnik. Vidi `decisions/0006-stack.md`.

## 6. Ime i domene. ODLUČENO

Tidywright, tidywright.com, tidywright.app, siteauditserver.com. Vidi
`decisions/0007-name-and-domains.md`. Ostaje provjera žiga prije javnog izlaska.

## 7. Pravna strana. RAZRAĐENO, ČEKA FIRMU

Šta treba i kako je u `docs/23-compliance.md`. Ostaje odluka o pravnom licu (pitanje 9).

## 8. Vertikala kao drugi kanal

Advokati na WordPressu su jedini kandidat koji je prošao istraživanje. Odluka o tome
čeka prve podatke iz widgeta.


## 9. Pravno lice i Stripe. OTVORENO, ČEKA MUMETA

Jedino pitanje koje ja ne mogu zatvoriti. Traži njegov novac, njegov identitet i njegovu
poresku izloženost.

Za naplatu i za DPA treba pravno lice. Opcije:

| Opcija | Trošak | Stripe | Napomena |
|---|---|---|---|
| Firma u BiH | najjeftinije, već poznat teren | **provjeriti**, BiH u septembru 2026. nije na Stripe listi podržanih zemalja naloga | ako ne prolazi, ostale dvije |
| Estonija, e-Residency | oko 100 EUR jednokratno, 300 do 600 EUR godišnje računovodstvo | da | EU firma, uredno za GDPR |
| Delaware LLC, Stripe Atlas | 500 USD jednokratno | da, uključen | uključuje EIN i bankovni račun; godišnja prijava u SAD |

Blokira fazu 2 (naplata), ne fazu 1. Odluka treba do kraja F2, dakle za oko šest sedmica.

## 10 do 14. ZATVORENO odlukom 0008

Vercel u fazi 1, Luna primarni model s Haikuom kao rezervom, besplatni plan pokazuje
izvještaj odmah uz limite i prekidač po agenciji, Cloudflare kreće na Free planu,
marketing tekstovi idu kakvi jesu i mijenjaju se kroz PR. Razlozi su u
`decisions/0008-otvorena-tehnicka-pitanja.md`.

## 15. Šta traži Mumetovu ruku, a nije odluka

Nije pitanje nego lista radnji koje niko osim njega ne može uraditi:

1. **Nalozi i kartica**, redom kako trebaju: Hetzner i Supabase i Vercel i Cloudflare
   (F0 do B1), Resend (B5), OpenAI i Anthropic (B3), Sentry i Axiom i Better Stack
   (B4), Stripe (faza 2, poslije pitanja 9).
2. **Mjesečni budžet do prvog prihoda.** Stepenica A je oko 70 do 110 dolara mjesečno.
   Ako je to previše, mijenjaju se odluke 1 i 4 iz 0008 (sve na jedan Hetzner server,
   oko 15 dolara).
3. **Pet pilot agencija.** Ja ne znam koga on zna. AdConnecta je prva, treba još četiri.
4. **Advokat za ToS, privacy i DPA**, 300 do 600 EUR. Može čekati do B6, ali ne dalje.
5. **Cijene.** Prijedlog je Free, 39, 99, 249. On ih može promijeniti u jednoj datoteci
   (`packages/shared/plans.ts`), ali treba da ih pogleda prije nego što odu na marketing
   stranicu.

## 16. Koji je token u `/u/[token]`. ZATVORENO

Kolona `unsubscribe_token` na `leads`: 32 nasumična bajta kao base64url (43 znaka),
jedinstveni indeks, nullable dok se ne pošalje prvi email. Upisana u
`docs/18-data-model.md`, u tip `Lead`, u mock i u rutu.

Vlastita vrijednost, nikad izvedena iz `id`, ni hešom ni potpisom. Link ide u email i
prolazi kroz tuđe mail servere, log fajlove i automatski pretpregled odjave koji neki
klijenti pokreću, pa ko god ga na kraju ima ne smije time imati i primarni ključ reda.
Pošto je vlastita kolona, jedan link se povlači jednim `UPDATE`-om.

Uz to provjereno: `audits.token` je već zasebna kolona s jedinstvenim indeksom i
`/r/[token]` je koristi svuda, nigdje ne pada na `audit.id`. Popravljeno je jedino to
što je mock sloj pravio `id` iz tokena, pa je ko vidi id u aplikaciji mogao izračunati
javni link.

## 17. Pet mjesta gdje se specifikacija i nacrtani dizajn ne slažu. ZATVORENO

Nije trebalo ni biti pitanje. Odluke su već bile donesene u kodu, samo nezapisane.

Pravilo je sada u `decisions/0009`: kad se dokument i nacrt ne slažu oko toga kako nešto
izgleda, nacrt pobjeđuje i dokument se ispravlja u istom PR-u. Za činjenice (ime, brojka,
pravilo pristupačnosti) pravilo ne važi, jer nacrt o njima ne odlučuje i zna biti stariji
od odluke.

Svih pet stavki je razvrstano i ispravljeno u `decisions/0009`, u `docs/13`, `docs/15`,
`docs/27`, `docs/32` i u dva nacrta. Ubuduće se ovakvo neslaganje ne prijavljuje kao
pitanje nego se razriješi po pravilu.

## 18. Čiji je poziv na akciju u izvještaju. ZATVORENO

Pitanje je otvorio pregled F1: dugme u podnožju izvještaja vodi na razgovor s agencijom,
a trebalo bi voditi na pretplatu i na poruku "spoji svoj sajt pa da mi to odradimo".

Zatvoreno odlukom `decisions/0010`, tačka 1: **u izvještaju koji nosi brend agencije poziv
ostaje agencijin. Pretplata ide samo na auditu s naše domene.** Agencija je widget
stavila zbog tog leada i ne uzimamo joj ga na njenoj stranici. Naš lijevak je besplatni
javni audit na tidywright.com, koji dolazi u F3 i ne košta agenciju ništa.

## 19. Sekvenca: agencije prvo ili self-serve prvo. OTVORENO, ČEKA MJERENJE

Mume 14.09.2026: fokus ne smiju biti samo agencije, treba i vlasnici sajtova koji hoće
sami sebi urediti sajt, jer ih ima daleko više.

Istraživanje je u `docs/37-self-serve-segment.md`. Nalaz je da je premisa tačna a
zaključak nije očigledan.

| | Agencije | Vlasnici sajtova |
|---|---|---|
| Veličina | 80 do 150 hiljada realnih kupaca alata | 10 do 13 miliona sajtova na WordPressu i Shopifyju |
| Dozvoljeni CAC | oko 2.100 $ | oko 137 $ |
| Mjesečni churn u modelu | 2% | 6% |
| Godišnje bruto zadržavanje prihoda | oko 70% (AI proizvodi iznad 250 $) | **23%** (AI proizvodi ispod 50 $) |
| Kako se prodaje | aktivno, partnerstva, greške se smiju praviti | samo organski i kroz marketplace |

Razlika u dozvoljenom CAC-u je petnaest puta. Na 137 dolara i pet plaćenih kupaca na
hiljadu posjetilaca, hiljada posjetilaca ne smije koštati više od 0,68 dolara, a nijedan
plaćeni kanal u SEO kategoriji to ne daje. Organski saobraćaj potreban za ozbiljan
self-serve biznis je 50 do 200 hiljada posjeta mjesečno, dakle 12 do 24 mjeseca rada.

Drugi razlog je apply engine. Naša jedina prava razlika je to što upisujemo izmjenu, i to
je i naš najveći rizik. Agencijski korisnik je tehnički čovjek koji stoji između nas i
klijentovog sajta, primijeti grešku i javi je. Search Atlas ima najbolji apply engine u
kategoriji i **1,8 od 5 na Shopify App Storeu**, uz prijave da je nenadzirana primjena
mijenjala sajtove na neodobrene načine.

**Preporuka istraživanja:** agencije ostaju prvi kanal koji naplaćuje, self-serve
infrastruktura se gradi paralelno od prvog dana, self-serve naplata se otvara u šestom do
devetom mjesecu, uz uslov da je stopa neuspjelih primjena ispod 1 posto i stopa vraćanja
unazad ispod 5 posto. Rupa na tržištu je stvarna i tačno tamo gdje smo mi (19 do 39
dolara, upisuje u CMS, sa pregledom i vraćanjem unazad), ali dugoročno, ne sada.

### Šta je odlučeno 15.09.2026.

**Model podataka je odlučen i više nije dio ovog pitanja.** Od prve migracije nosi oba
oblika: organizaciju s više sajtova i korisnika s jednim sajtom. Vidi `decisions/0011`,
tačka 1, i `docs/18-data-model.md`. **B1 je time odblokiran.**

**Do mjerenja: agencije naplaćuju, self-serve se gradi u istom kodu.** To nije odluka o
sekvenci nego stanje mirovanja. Ništa u planu gradnje se ne mijenja, i ništa se ne gradi
dvaput, jer je jezgro zajedničko po `docs/37`, sekcija 6.

### Šta ovo pitanje sada traži: jedan broj, ne sastanak

Sekvenca kanala se ne može odlučiti mišljenjem, jer obje strane imaju jak argument i
nijedna nema podatak. Podatak koji ih razdvaja je jedan:

> **Koliko posto ljudi koji dobiju besplatan izvještaj na našoj domeni zaista poveže svoj
> sajt.**

| | |
|---|---|
| Prag | **25 posto** |
| Iznad praga | ide se self-serve prvo, cijela računica CAC-a se mijenja |
| Ispod praga | ostaje agencijska sekvenca, self-serve naplata u šestom do devetom mjesecu |
| Šta treba | audit stranica na tidywright.com i oko 2.000 posjetilaca |
| Kad je moguće | **poslije F3**, jer audit stranica dolazi s marketinškim sajtom |
| Koliko traje | 4 do 6 sedmica prikupljanja |

Prag od 25 posto nije proizvoljan. Na 137 dolara dozvoljenog CAC-a i pet plaćenih kupaca
na hiljadu posjetilaca, self-serve ne podnosi nijedan plaćeni kanal. Konverzija iznad 25
posto znači da besplatni audit sam nosi akviziciju, a to je jedina okolnost u kojoj
self-serve ekonomija radi bez čekanja od 12 do 24 mjeseca na organski saobraćaj.

**Šta treba instrumentirati kad F3 dođe**, inače se broj ne može izračunati:

1. Događaj po koraku lijevka: posjeta, pokrenut audit, ostavljen email, kreiran nalog,
   **povezan sajt**, odobrena prva ispravka.
2. Brojilac se računa **samo na auditima gdje je korisnik vlasnik domena**. Veliki dio
   ljudi audituje tuđi sajt, iz radoznalosti ili konkurenciju, i te adrese ne konvertuju
   nikad. Bez tog filtera broj je besmislen i previsok.
3. Imenilac je "dobio izvještaj", ne "posjetio stranicu".

Do tada ovo pitanje nema šta da čeka od Mumeta.

## 20. Kolačići i pristanak. ZATVORENO

Iz backloga, tačka F: treba dodati traku za kolačiće i evidenciju pristanka.

Zatvoreno odlukom `decisions/0011`, tačka 2: **nema trake u widgetu, ali se slojevi
razdvajaju.**

- **Widget i izvještaj**: nula kolačića, nikakva traka. To što ih ne postavljamo je
  prodajna tačka i piše se naglas: agencija ne mora dirati svoj cookie banner da bi nas
  ugradila. U podnožju obrasca stoji "this form sets no cookies".
- **Aplikacija**: sesija i CSRF su neophodni i ne traže pristanak. Analitika proizvoda
  traži pristanak, nudi se jednom poslije onboardinga, mijenja u `/settings`, i dok nije
  data se ne učitava.
- **Marketinški sajt**: analitika bez kolačića, pa bez trake. Traka i `legal/cookie.md`
  dolaze u istom PR-u kao i prvi piksel koji postavlja kolačić, ne poslije njega.

Detalji u `docs/23-compliance.md`, sekcija "Kolačići i pristanak".

## 21. Newsletter kao zasebna prijava. ZATVORENO

Iz backloga, tačka G: kad posjetilac pošalje obrazac, prijava ide i na newsletter, i uz
to treba postojati zasebna prijava samo na newsletter, bez audita.

Zatvoreno odlukom `decisions/0011`, tačka 3: **newsletter da, ali pristanak razdvojen.**

- **Dva polja u obrascu.** Jedno obavezno, bez kojeg se izvještaj ne šalje. Jedno
  neobavezno i neoznačeno po defaultu, za newsletter. Jedno polje za oboje je bundling i
  pada na GDPR provjeri, jer pristanak mora biti specifičan po svrsi. Unaprijed označena
  kvačica nije pristanak nego propust da se odznači.
- **Zasebna prijava samo na newsletter ide na našu domenu**, ne u agencijin widget. Isti
  razlog kao poziv na akciju u `0010`, tačka 1: posjetilac koji je došao kroz agencijin
  widget je njen lead.
- `leads.consent` sada nosi dva zapisa, `service` i `marketing`, i `checked: false` je
  jednako valjan dokaz kao i `true`.

Usput je nađeno da je `audit-form.tsx` slao `consent_marketing: true` kao konstantu, dakle
svi su bili prijavljeni bez pitanja. Popravljeno.

Detalji u `docs/15-frontend-spec.md`, `docs/18-data-model.md` i `docs/26-email.md`.

## 22. Popust na odjavi. ZATVORENO

Iz backloga, tačka H: na stranici odjave ponuditi popust da korisnik ostane još mjesec ili
dva, radi zadržavanja mogućnosti slanja reklama na te adrese.

Zatvoreno odlukom `decisions/0011`, tačka 4. U pitanju su bile pomiješane dvije radnje
koje rade dvije različite osobe.

- **Odjava s emailova ostaje jedan klik, bez uslova i bez ponude.** Traže je GDPR, CASL i
  CAN-SPAM, a CAN-SPAM čini odgovornim i platformu i agenciju. Odjavljena adresa ide u
  `suppressions` i više se ne koristi, pa navedeni cilj ionako nije izvodiv.
- **Popust ide samo na otkazivanje pretplate**, faza 2 uz Stripe: jedan ekran, jedna
  ponuda, dugme za otkazivanje uvijek vidljivo.
- **Godišnji plan se nudi pri kupovini, ne pri otkazivanju.** Ko je došao do dugmeta za
  otkazivanje već je odlučio. Godišnja naplata daje 62 posto zadržavanja naspram 41 kod
  mjesečne u ovoj cjenovnoj klasi, pa vrijedi više od bilo čega ponuđenog na izlazu.

Detalji u `docs/26-email.md` i `docs/24-billing.md`.

## 23. Na koji sloj se odnosi "brend mora biti samo naš". OTVORENO

Iz backloga, tačka I: cijeli brend mora biti na naše ime, ime treće firme se ne spominje
bez obzira što koristimo tuđe servise.

Zahtjev je razuman, ali proizvod ima tri sloja s tri različita odgovora, i treba potvrditi
da je ovo ono što je mišljeno:

| Sloj | Čiji brend | Zašto |
|---|---|---|
| Izvještaj koji vidi posjetilac | **agencijin** | Bijela etiketa je cijeli proizvod, `decisions/0004`. Naše ime se pojavljuje samo kao "Powered by Tidywright" na besplatnom paketu, i plaćeni ga uklanja |
| Aplikacija koju vidi agencija | **naš** | Agencija zna s kim radi |
| Imena dobavljača (model, hosting, Turnstile, email) | **nigdje se ne vide** | Kupac kupuje ishod, ne lanac nabavke |

Ako je mišljen treći red, to je već tako i nema šta da se radi osim jedne provjere. Ako je
mišljen prvi red, to je u sukobu s `decisions/0004` i traži novu odluku, jer bi značilo
kraj bijele etikete.

**Šta treba uraditi u svakom slučaju, i to prije B6:** proći uslove korišćenja svakog
vanjskog servisa koji dodirne izvještaj, jer neki traže vidljivo navođenje izvora. Ako
neki od njih to traži, odluka "ime treće firme se ne spominje" se sudara s ugovorom i
mijenja se izbor dobavljača, ne odluka.
