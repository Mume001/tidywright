# Dizajn

Osam ekrana aplikacije, dizajnirano 12.09.2026.

- `*.dc.html` su izvori ekrana. Otvaraju se u browseru i bez alata, ali su namijenjeni
  platnu na kojem su napravljeni.
- `canvas.json` je raspored ekrana na platnu.
- `renders/*.png` su slike istih ekrana, za brz pregled i za Claude Code.

Živa verzija: https://claude.ai/code/artifact/4e217941-97c3-4ab3-b07a-f64201c8e06b

Opis svakog ekrana i odluke ugrađene u dizajn su u `docs/09-screens.md`.

Paleta: tamna podloga 0F0E11, površina 17161A, tekst ECEAF0, naglasak B6E24A,
upozorenje E7A33C, kritično E2705A. Pismo: Space Grotesk za naslove, IBM Plex Sans za
tekst, IBM Plex Mono za URL-ove i kod.

## Faza 1: ekrani widgeta i agencijskog app-a (dodano 14.09.2026.)

Folder `phase1/`. Jedanaest artboarda na drugom platnu:

| Fajl | Šta |
|---|---|
| `Main.dc.html` | marketing naslovna tidywright.com |
| `EmbedForm.dc.html` | obrazac u iframeu, pet stanja, i kako sjedi na sajtu agencije |
| `Report.dc.html` | izvještaj posjetiocu, stanje "done", svijetla tema u boji agencije |
| `ReportStates.dc.html` | izvještaj: u toku, blokiran, istekao |
| `Auth.dc.html` | prijava, registracija, potvrda emaila, MFA |
| `Onboarding.dc.html` | tri koraka |
| `Overview.dc.html`, `Leads.dc.html`, `EmbedCode.dc.html`, `Branding.dc.html`, `Billing.dc.html` | agencijski app |

Živa verzija: https://claude.ai/code/artifact/82c38fa5-1eaf-49df-93cf-c40624ab499b

Northwind Digital je izmišljena agencija za brendirane prikaze. Plava je njena boja, ne
naša. Tokeni i komponente su opisani u `docs/27-design-system.md`, svaki ekran stanje po
stanje u `docs/15-frontend-spec.md`.
