# Ekrani

Osam ekrana je dizajnirano 12. septembra 2026. Izvori su u `design/`, slike u
`design/renders/`. Živa verzija na kojoj se može zumirati:
https://claude.ai/code/artifact/4e217941-97c3-4ab3-b07a-f64201c8e06b

Uzorak podataka je iz stvarnog audita adconnecta.com, da ekrani izgledaju kao pravi nalog.
Ekrani su statični prikazi, nisu klikabilni.

## Glavni tok, slijeva nadesno

| Ekran | Fajl | Šta radi |
|---|---|---|
| Pregled sajta | `Main.dc.html` | zdravlje, primijenjene popravke, šta čeka, klikovi iz Search Consolea |
| Nalazi | `Findings.dc.html` | 40 provjera grupisanih, oznaka da li je popravka automatska |
| Pregled jedne popravke | `FixReview.dc.html` | razlika prije i poslije, obrazloženje, prikaz kako izgleda u pretrazi |
| Red popravki | `FixQueue.dc.html` | grupno odobravanje, dnevnik primijenjenog, vraćanje unazad |

## Podrška

| Ekran | Fajl | Šta radi |
|---|---|---|
| Svi sajtovi | `Sites.dc.html` | agencijski pogled, zdravlje po sajtu, red čekanja |
| Search podaci | `SearchData.dc.html` | klikovi, prikazi, CTR, pozicija, upiti bez stranice |
| Konekcije | `Connections.dc.html` | četiri načina isporuke, status, šta smijemo dirati |
| Izvještaji | `Reports.dc.html` | sadržaj izvještaja, bijela etiketa, pregled |

## Odluke koje su ugrađene u dizajn

- Ekran Konekcije je napisan kao prodajni argument, ne kao podešavanje. Tu se objašnjava
  da izmjena ostaje kupcu. To je jedina stvar koja nas razlikuje, pa mora biti vidljiva
  unutar proizvoda, ne samo na marketing sajtu.
- Na pregledu popravke piše "Nothing has changed on the live site yet" i "Reversible for
  90 days". Povjerenje se gradi tekstom na mjestu odluke.
- Nema grafikona koji prikazuju kupljene podatke, jer ih nemamo. Sve što se prikazuje je
  iz crawla ili iz kupčevog Search Consolea.

## Otvoreno

- Marketing sajt još nije dizajniran.
- Nema ekrana za onboarding, prijavu, ni za grešku pri primjeni popravke.
- Nema mobilne verzije.

## Ekrani faze 1 (dodano 14.09.2026.)

Osam ekrana iznad su faza 3. Za fazu 1 (widget i agencijski app) postoji drugo platno,
`design/phase1/`, s jedanaest artboarda: marketing naslovna, obrazac u pet stanja,
izvještaj i njegova tri posebna stanja, auth, onboarding, i pet ekrana app-a (pregled,
leadovi, embed kod, brendiranje, naplata). Opis svakog stanja je u
`docs/15-frontend-spec.md`, a tokeni u `docs/27-design-system.md`. Ekran za audite,
tim i podešavanja nije nacrtan jer slijedi isti obrazac kao leadovi i brendiranje;
Claude Code ih pravi iz specifikacije i komponenti.
