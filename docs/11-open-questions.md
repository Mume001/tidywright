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

## 19. Sekvenca: agencije prvo ili self-serve prvo. OTVORENO, ČEKA MUMETA

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

**Šta treba odlučiti, konkretno tri stvari:**

1. Prihvata li se ta sekvenca. Ako da, ništa se u planu gradnje ne mijenja.
2. Radi li se test koji bi je oborio. Test je jeftin: besplatni javni audit na našoj
   domeni i oko 2.000 posjetilaca. Ako više od 25 posto korisnika koji dobiju izvještaj
   zaista poveže svoj sajt, ide se self-serve prvo. Traje 4 do 6 sedmica.
3. Model podataka. Istraživanje traži da od početka podržava i organizaciju s više sajtova
   i korisnika s jednim sajtom, jer je to jeftino sada i skupo za šest mjeseci. To dira
   `docs/18-data-model.md` i mora biti riješeno **prije B1**, dakle ranije od svega
   ostalog u ovom pitanju.

Tačka 3 je jedina koja blokira. Tačke 1 i 2 mogu čekati.

## 20. Kolačići i pristanak. OTVORENO

Iz backloga, tačka F: treba dodati traku za kolačiće i evidenciju pristanka.

Prije nego što se to uradi, treba razriješiti jedno neslaganje. `docs/23-compliance.md`
kaže da widget **namjerno ne postavlja nijedan kolačić**, da Turnstile ne postavlja
kolačić za praćenje, da se analitika vodi kroz naš `events` na serveru bez klijentskog
praćenja, i da je to prodajna tačka: agencija ne mora dirati svoj cookie banner da bi nas
ugradila. Marketing sajt koristi analitiku bez kolačića i takođe nema banner.

Dakle traka za kolačiće trenutno nema šta da traži. Ako je uvedemo bez potrebe, gubimo
prodajnu tačku i dobijamo klik koji nikome ne treba.

Evidencija pristanka je druga stvar i ona postoji: `leads.consent` čuva tekst, verziju,
vrijeme, URL stranice i heš IP adrese.

**Pitanje za Mumeta:** je li traka tražena zato što negdje stvarno postavljamo kolačić za
koji ja ne znam, ili zato što je to uobičajeno pa se očekuje. Ako je drugo, prijedlog je
da se ne radi, i da umjesto trake stoji rečenica u podnožju "this form sets no cookies"
koja je tačna i korisna.

**Uslov koji važi u svakom slučaju:** ako ikad uvedemo bilo kakav kolačić koji nije nužan
za rad obrasca, traka postaje obavezna, a ne stvar ukusa. Tada se mijenja i
`docs/23-compliance.md` i `legal/cookie.md`.

## 21. Newsletter kao zasebna prijava. OTVORENO

Iz backloga, tačka G: kad posjetilac pošalje obrazac, prijava ide i na newsletter, i uz
to treba postojati zasebna prijava samo na newsletter, bez audita.

Dva dijela, i samo je drugi jednostavan.

**Zasebna prijava na newsletter** je mali posao i nije sporan. Pitanje je samo gdje živi
(marketing sajt, F3) i ko šalje.

**Automatska prijava svih koji pošalju obrazac je sporna**, iz dva razloga:

1. Marketinški pristanak mora biti odvojen od slanja izvještaja. Izvještaj je ono što je
   posjetilac tražio, newsletter nije. Obrazac već ima `consent_marketing` kao zasebno
   polje upravo zbog toga.
2. Čiji je to newsletter. Po odluci `0010`, tačka 1, posjetilac koji dođe kroz agencijin
   widget je **agencijin lead**. Naš newsletter na tu adresu je isto uzimanje leada kao i
   naš poziv na akciju u njenom izvještaju, samo sporije.

**Prijedlog:** na auditima s naše domene, prijava na newsletter uz zaseban i neoznačen
checkbox. Na agencijinom widgetu, nikad mi. Agencija dobija adresu i svoj pristanak.

Treba Mumetovo da ili ne. Ne blokira ništa u fazi 1.

## 22. Popust na odjavi. OTVORENO

Iz backloga, tačka H: na stranici odjave ponuditi popust da korisnik ostane još mjesec ili
dva. Cilj koji je naveden: zadržati mogućnost slanja reklama na te adrese.

Ovdje se miješaju dvije različite odjave i to treba razdvojiti prije odluke.

**Odjava s emailova (`/u/[token]`).** Mora ostati jedan klik, bez uslova, bez ponude,
bez pitanja zašto. To traže i GDPR i CAN-SPAM i CASL, a CAN-SPAM izričito kaže da
odgovaraju i platforma i agencija. Ponuda popusta na ovoj stranici nije opcija, nego
rizik. Ovdje nema šta da se odlučuje.

**Otkazivanje pretplate (faza 2, Stripe).** Ovdje je ponuda popusta uobičajena i
dozvoljena, i vjerovatno je to i bila namjera. Uz to je istraživanje našlo tvrd argument
za susjednu stvar: za proizvode ispod 25 dolara mjesečno **godišnja naplata daje 62 posto
godišnjeg zadržavanja naspram 41 posto kod mjesečne**. Dvadeset jedan procentni poen.
Godišnji plan nije popust nego mehanizam preživljavanja, i vrijedi više od popusta na
izlazu.

**Pitanje za Mumeta:** je li tačka H mislila na otkazivanje pretplate. Ako jeste, ide u
fazu 2 uz Stripe. Ako je stvarno mislila na odjavu s emailova, odgovor je ne, i razlog je
gore.

Napomena o cilju "zadržati mogućnost slanja reklama": adresa koja se odjavila ide u
suppression listu i više je ne koristimo. To nije podešavanje nego obaveza.

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
