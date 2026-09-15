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
