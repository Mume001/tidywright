# Opseg

## Cilj proizvoda, dugoročno

Sve u jednom oko popravke: nađi problem, napiši popravku, prikaži je, primijeni je uz
odobrenje, dokaži rezultat kroz Search Console. Ne sve u jednom oko podataka, jer to
su Semrush i Ahrefs i to košta 129 USD mjesečno. Naše "sve" je cijela petlja od nalaza
do dokaza, na kupčevom sajtu, u kupčevom vlasništvu.

## Prva verzija radi ovo

Widget za agencije. Odlučeno u `decisions/0004-first-channel.md`.

1. Agencija se registruje, unese logo, boju, tekst poziva i link na kalendar.
2. Dobije script tag i div za ugradnju, ili hostovanu stranicu na neutralnoj domeni.
3. Posjetilac na sajtu agencije unese URL i email.
4. Skeniramo tu jednu stranicu, pokrenemo provjere, izračunamo ocjenu.
5. Za tri najvažnija nalaza generišemo gotovu popravku i prikažemo je prije i poslije.
6. Ostatak nalaza je vidljiv kao lista ali zamagljen iza poziva agenciji.
7. Lead ide agenciji na email i webhook. Izvještaj ide posjetiocu na email.
8. Besplatan paket ima vidljiv "powered by". Plaćeni ga uklanja.

## Prva verzija ne radi ovo

| Ne radimo | Zašto |
|---|---|
| Crawl cijelog sajta | Widget skenira jednu stranicu. Cijeli sajt dolazi s nalogom kupca u fazi 3. |
| Primjena popravki na sajt | Faza 3, tek kad agencije to zatraže. |
| WordPress plugin | Faza 3. |
| Search Console | Faza 3, traži nalog vlasnika sajta. |
| Nalog za vlasnika sajta | Prva verzija ima samo nalog agencije. |
| Indeks backlinkova, volumen riječi, procjena prometa | Nikad. Vidi `decisions/0002-buy-no-third-party-data.md`. |
| Tiha automatska primjena | Nikad u verziji 1. Vidi `decisions/0003-nothing-applies-without-approval.md`. |

## Faze gradnje

### Faza 1, widget, 4 do 6 sedmica
Sve iz liste iznad. **Cilj: pet agencija ga postavi besplatno i vrati tri brojke koje
niko nije objavio: audita mjesečno, postotak leadova, i da li gotove popravke zakazuju
više poziva od ocjene.**

### Faza 2, naplata i drugi paket, 2 sedmice
Stripe, uklanjanje "powered by", limit audita, paket za više sajtova agencije.
**Cilj: prvih deset koji plate.**

### Faza 3, primjena popravki, 6 do 8 sedmica
Nalog vlasnika sajta, dokaz vlasništva, crawl cijelog sajta, WordPress plugin, red
odobravanja, snimak i vraćanje unazad, Search Console. Ovo je dio koji je dizajniran u
`design/`. **Cilj: prva agencija primijeni popravke klijentu kroz nas.**

### Faza 4, dashboard i izvještaji, poslije prihoda
Više sajtova u jednom nalogu, mjesečni izvještaji pod brendom agencije, praćenje pozicija
ako ga kupci traže.

Dashboard je i dalje posljednji. Dizajn za njega postoji da se zna kuda se ide.
