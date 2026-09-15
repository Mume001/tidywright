# 0009 Kad se dokument i nacrt ne slažu, nacrt pobjeđuje

Datum: 14.09.2026.
Status: prihvaćeno

## Kontekst

Gradnja F1 je otkrila pet mjesta gdje `docs/15-frontend-spec.md` ili
`docs/27-design-system.md` kažu jedno, a nacrt u `design/phase1/` pokazuje drugo. Sve
sam ih morao razriješiti da bih uopšte mogao napisati kod, pa su ostale zapisane kao
otvoreno pitanje 17 uz molbu da ih Mume pogleda.

To je bio pogrešan oblik. Otvoreno pitanje je mjesto za odluku koja još nije donesena, a
ove su već bile donesene, samo nezapisane. Nezapisana odluka se sljedeći put donosi
ponovo, i ne mora isto.

## Odluka

**Pravilo: kad se dokument i nacrt ne slažu oko toga kako nešto izgleda, nacrt
pobjeđuje, a dokument se ispravlja u istom PR-u.** Nacrt je ono što je neko stvarno
pogledao i rekao "da, ovako". Rečenica u dokumentu je opis tog nacrta, i kad se razilaze,
opis je taj koji je pogriješio.

Pravilo važi za izgled. Ne važi za činjenice (ime, brojka, pravilo pristupačnosti,
sigurnosno ograničenje), jer nacrt o njima ne odlučuje i zna biti stariji od odluke.

## Pet stavki, razvrstanih po tome ko je bio u pravu

### Nacrt je bio u pravu, dokument ispravljen

**1. Kartica popravke: "Now" i "Suggested" jedno pored drugog.** `docs/13` i `docs/15`
su govorili "jedno ispod drugog", nacrt ih ima u dvije kolone. Pored, jer je ovo
poređenje, a poređenje se čita u paru. Ispod 768 px se slaže u kolonu, provjereno na 360,
500, 767, 768 i 1280 px. Blokovi se poravnavaju po vrhu, da jednoredni "Now" ne postane
prazna kutija pored deset redova JSON-LD-a. Ispravljeni `docs/15` 2.1 i `docs/13`.

**2. Prsten ocjene uzima boju po rasponu ocjene, ne po brendu agencije.**
`docs/27-design-system.md` je nabrajao prsten među mjestima gdje se koristi boja
agencije, "ako je kontrast dovoljan". Nacrt ima žuti prsten na ocjeni 58. Boja po
rasponu, jer plavi prsten na ocjeni 34 ne kaže posjetiocu da je 34 loše, a to je jedino
što prsten treba da kaže. Boja agencije ostaje na traci na vrhu, dugmetu i linkovima.
Ispravljen `docs/27`.

**3. Kartica u temi izvještaja je bijela, ne siva.** `docs/27` je imao
`--panel: #F7F7F8`, nacrt ima bijele kartice s ivicom. Sada je `--panel: #FFFFFF`, pa
"panel" u obje teme znači isto: površina kartice. Bez toga bi svaka komponenta morala
znati u kojoj je temi. Ispravljen `docs/27`.

### Nacrt je bio stariji od odluke, nacrt ispravljen

**4. "Powered by Tidywright", ne "Powered by SiteAuditServer".** Nacrt je crtan prije
nego što je ime odlučeno u `decisions/0007`, pa nosi ime neutralne domene za posluživanje
umjesto imena proizvoda. Ovo nije izgled nego činjenica, pa pravilo ne važi: kod prati
`docs/15` 2.1. Ispravljeni `design/phase1/EmbedForm.dc.html`,
`design/phase1/Report.dc.html` i `docs/32-glossary.md`.

### Ni dokument ni nacrt, nego mjerenje

**5. `--tx3` u temi izvještaja je `#6F6F7A`, ne `#8E8E99`.** Original je 3,2:1 na bijeloj.
To je u redu za placeholder, za šta ga app tema i koristi, ali izvještaj u toj boji piše
prave rečenice: datum u zaglavlju, liniju ispod svake od deset traka, podnožje. Sada je
4,96:1. Ovdje ne odlučuje ni dokument ni nacrt nego `docs/27` vlastito pravilo da tekst
mora 4,5:1, koje je jače od pojedinačne vrijednosti u paleti. Ispravljen `docs/27`.

## Posljedica

Pitanje 17 u `docs/11-open-questions.md` se zatvara. Ubuduće se ovakvo neslaganje ne
prijavljuje kao pitanje nego se razriješi po pravilu gore i dokument se ispravi odmah.

Ako Mume pri vizuelnom pregledu F1 kaže drugačije za bilo koju od pet stavki, svaka se
vraća u jednom fajlu, i tada se mijenja i ovaj zapis.
