# Dizajn sistem

Tokeni, komponente i pravila izvučeni iz osam dizajniranih ekrana u `design/`. Ovo je
ono što Claude Code pretvara u `packages/ui` i Tailwind temu prije nego što napravi
ijedan ekran. Aplikacija je tamna. Izvještaj posjetiocu je svijetao i prima boju
agencije.

## Dvije teme

| | App (tamna) | Izvještaj i obrazac (svijetla, brendirana) |
|---|---|---|
| Ko gleda | agencija, staff | posjetilac, na sajtu agencije |
| Brend | naš | agencijin, naš samo "powered by" na free |
| Boja naglaska | lime, fiksno | `branding.primary_color`, s automatskim kontrastom |
| Fontovi | Space Grotesk, IBM Plex Sans, IBM Plex Mono | sistemski stack (posjetilac ne učitava naše fontove, brže i neutralnije) |

## Tokeni boja, app

```css
:root[data-theme="app"] {
  --bg:      #0F0E11;   /* podloga stranice */
  --panel:   #17161A;   /* kartice, sidebar */
  --panel2:  #1D1B21;   /* ugniježdena površina, hover reda */
  --raise:   #232027;   /* input, dropdown, tooltip */
  --line:    #2A272F;   /* ivice */
  --line2:   #3A3542;   /* ivice u fokusu, jače linije */
  --tx:      #ECEAF0;   /* primarni tekst */
  --tx2:     #A8A2B2;   /* sekundarni tekst, labele */
  --tx3:     #6F6A7A;   /* tercijarni, placeholder, onemogućeno */
  --lime:    #B6E24A;   /* naglasak, primarno dugme, aktivna stavka, dobro */
  --lime-d:  #7E9E2A;   /* naglasak pritisnut, ivica na lime površini */
  --lime-l:  #C9EE72;   /* link hover */
  --on-lime: #16200A;   /* tekst na lime dugmetu */
  --amber:   #E7A33C;   /* upozorenje, srednje */
  --coral:   #E2705A;   /* kritično, greška, brisanje */
  --violet:  #9B8CF4;   /* informacija, AI oznaka, avatar */
  --on-violet: #17131F;
}
```

Semantika ocjene (score ring, badge, bar):
| Raspon | Boja |
|---|---|
| 80 do 100 | lime |
| 50 do 79 | amber |
| 0 do 49 | coral |

Na tamnoj temi iste boje služe i za traku i za tekst, jer na `--panel` prolaze i jedno i
drugo (lime 12:1, amber 8,3:1, coral 5,7:1). Svejedno postoje i kao `--*-ink` tokeni, s
istim vrijednostima, da komponenta koja se piše jednom radi i u temi izvještaja gdje se
razlikuju. Vidi "Površina i tekst su dva tokena".

Ozbiljnost nalaza: `critical` coral, `warning` amber, `notice` violet, `passed` lime,
`info` tx2.

## Tokeni boja, izvještaj

```css
:root[data-theme="report"] {
  --bg:      #FFFFFF;
  --panel:   #FFFFFF;   /* kartica je bijela s ivicom, kao na nacrtu */
  --panel2:  #EFEFF3;   /* traka mjerača, ugniježdena površina */
  --line:    #E6E6EA;
  --tx:      #16161A;
  --tx2:     #5B5B66;
  --tx3:     #6F6F7A;   /* 4,96:1 na bijeloj, vidi Dostupnost */
  --brand:   var(--agency-primary);         /* iz branding.primary_color */
  --on-brand: var(--agency-on-primary);      /* računa se: #fff ili #111 po WCAG kontrastu */
  --ink:     var(--agency-ink);              /* ista boja, zatamnjena dok ne prođe 4,5:1 na bijeloj */
  --good:    #2E9E5B;   /* traka i prsten */
  --warn:    #D9822B;
  --bad:     #D64545;
  --good-ink: #1E7042;  /* iste tri kao tekst, vidi "Površina i tekst su dva tokena" */
  --warn-ink: #985716;
  --bad-ink:  #B33636;
}
```

`--panel` je bijela, ista kao `--bg`. Kartica se u ovoj temi vidi po ivici, ne po
podlozi, kako je nacrtano u `design/phase1/Report.dc.html`. To znači da "panel" u obje
teme znači isto: površina kartice. Zato `FixCard` i `ScoreRing` rade u obje bez posebnog
koda.

Boja agencije se koristi samo za: dugme CTA, linkove, i tanku traku na vrhu. Nikad za
velike površine i nikad za tekst na bijelom ako kontrast padne ispod 4,5:1 (tada se
zatamni algoritmom, `color-mix` prema crnoj dok ne prođe, i rezultat se servira kao
`--agency-ink`).

**Prsten ocjene nije među njima.** Prsten uzima boju po rasponu ocjene, ne po brendu.
Plavi prsten na ocjeni 34 ne kaže posjetiocu da je 34 loše, a to je jedino što prsten i
treba da kaže. Tako je i nacrtano. Vidi `decisions/0009`.

## Tipografija

| Uloga | Font | Veličina / linija | Težina |
|---|---|---|---|
| Naslov stranice | Space Grotesk | 24 / 30 | 600 |
| Naslov kartice | Space Grotesk | 16 / 22 | 600 |
| Tijelo | IBM Plex Sans | 14 / 20 | 400 |
| Malo, labele, tabela | IBM Plex Sans | 12 / 16 | 500, labele uppercase s 0.04em razmakom |
| Broj (ocjena, KPI) | Space Grotesk | 32 do 56 | 700, `font-variant-numeric: tabular-nums` |
| URL, kod, ključ, JSON | IBM Plex Mono | 13 / 18 | 400 |

Izvještaj: sistemski stack `-apple-system, Segoe UI, Roboto, Helvetica, Arial`,
iste veličine, tijelo 15 / 24 jer je stranica za čitanje.

Fontovi se hostuju sami (`next/font` s lokalnim fajlovima), ne Google Fonts, zbog GDPR i
brzine.

## Razmaci, radijusi, sjene

- Skala razmaka 4 px: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.
- Radijus: 6 (input, dugme, badge), 10 (kartica), 14 (modal), 999 (pill, avatar).
- Ivice umjesto sjena u app-u (tamna tema). Jedna sjena za dropdown i modal:
  `0 12px 32px rgba(0,0,0,.45)`.
- Izvještaj: kartice s `1px solid var(--line)` i blagom sjenom `0 1px 2px rgba(0,0,0,.05)`.

## Raspored app-a

- Sidebar 232 px, fiksan, `--panel`, logo gore, navigacija, na dnu birač agencije i
  avatar. Na širini ispod 1024 px se sklapa u ikone (64 px), ispod 768 postaje drawer.
- Gornja traka 56 px: naslov stranice, pretraga (⌘K), dugme primarne akcije desno.
- Sadržaj max 1280 px, padding 24, grid 12 kolona s 20 px razmakom.
- Tabela: red 44 px, zaglavlje 36 px uppercase labele, hover `--panel2`, izabrani red
  lime lijeva ivica 2 px.

## Komponente (`packages/ui`)

Sve na shadcn/ui (Base UI) osnovi, s našim tokenima. Lista koju treba imati prije
prvog ekrana, s varijantama:

| Komponenta | Varijante / stanja |
|---|---|
| `Button` | primary (lime), secondary (raise + line), ghost, danger (coral); sm/md/lg; loading, disabled, s ikonom |
| `Input`, `Textarea` | default, error (coral ivica + poruka), disabled, s prefiksom (https://) |
| `Select`, `Combobox` | |
| `Checkbox`, `Switch`, `RadioGroup` | |
| `Badge` | status (new/contacted/qualified/won/lost/spam), severity, plan |
| `ScoreRing` | 0 do 100, veličine 48/96/160, animiran na mount, boja po rasponu |
| `ScoreBar` | horizontalna, za 4 grupe |
| `KpiCard` | broj, labela, delta (▲ lime / ▼ coral), sparkline (Recharts) |
| `DataTable` | TanStack, sortiranje, filter, cursor paginacija, prazno stanje, skeleton, izbor redova, sticky header |
| `EmptyState` | ikona, naslov, tekst, primarna akcija |
| `Card`, `CardHeader` | |
| `Tabs` | |
| `Dialog`, `Sheet` (side panel), `AlertDialog` (potvrda brisanja) | |
| `DropdownMenu`, `Tooltip`, `Popover` | |
| `Toast` (sonner) | success, error, info |
| `CodeBlock` | mono, dugme copy, highlight za HTML/JSON |
| `CopyField` | input samo za čitanje s copy dugmetom (ključ, embed kod) |
| `FixCard` | before/after, Now/Suggested, reasons lista, Copy, u obje teme |
| `CheckRow` | kod, naslov, status ikona, expand za dokaz |
| `Timeline` | za lead aktivnost i istoriju popravki |
| `DiffView` | before/after tekst i JSON, faza 3 |
| `Stepper` | onboarding 3 koraka, wizard 4 koraka |
| `ColorPicker` | hex input + swatch + kontrast upozorenje |
| `FileUpload` | logo, drag and drop, limit, pregled |
| `PlanCard` | naplata |
| `Banner` | payment failed, trial ending, usage 80%, domain warming |
| `Skeleton` | za svaku listu i karticu |
| `EmbedPreview` | živi iframe obrasca s trenutnim brendiranjem |

Svaka komponenta ima Storybook priču sa svim stanjima i test dostupnosti (axe).

## Ikone

Lucide, 16 px u tabelama i dugmadima, 20 px u navigaciji, stroke 1,75. Nema emojija u
UI-ju.

## Stanja koja svaki ekran mora imati

1. Loading (skeleton, ne spinner, osim u dugmetu)
2. Prazno (prvi put, s uputstvom šta da uradi)
3. Greška (s "Try again" i `req_id` malim slovima za podršku)
4. Normalno
5. Bez dozvole (404 stranica, vidi `16-access-control.md`)

Storybook mora pokazati bar 1 do 4 za svaki ekran prije nego što backend postoji.

## Dostupnost

- Kontrast tekst/podloga bar 4,5:1. Na app temi `--tx2` na `--panel` je 6,8:1, a `--tx3`
  3,4:1, pa se `--tx3` tamo koristi samo za placeholder i onemogućeno.
- U temi izvještaja `--tx3` je `#6F6F7A`, a ne `#8E8E99` kako je prvo pisalo. Izvještaj u
  toj boji piše prave rečenice (datum, linija ispod svake trake grupe, podnožje), a ne
  placeholdere, i `#8E8E99` je 3,2:1 na bijeloj. Sada je 4,96:1.
- Fokus prsten `2px solid var(--lime)` s 2 px offsetom, vidljiv na svemu.
- Sve ikone-dugmad imaju `aria-label`.
- Tabele s pravim `<table>`, ne div grid.
- Izvještaj: `prefers-reduced-motion` gasi animaciju prstena, veličina teksta skalira
  s korisnikovim podešavanjem.
- Iframe obrasca: labele povezane s inputima, greške najavljene kroz `aria-live`.

## Pokret

Malo i brzo: 150 ms za hover i fokus, 250 ms za otvaranje panela, `ease-out`. Prsten
ocjene 800 ms jednom. Ništa drugo se ne animira.

## Tailwind 4 postavljanje

`packages/ui/theme.css` definiše tokene kroz `@theme`, komponente koriste klase
`bg-panel`, `text-tx2`, `border-line`, `bg-lime text-on-lime`. Tema izvještaja
prepisuje iste tokene kroz `[data-theme="report"]`, pa `FixCard` i `ScoreRing` rade u
obje bez posebnog koda. Boja agencije se ubacuje kao inline CSS varijabla na `<html>`
u `/r/[token]` i `/e/[key]` layoutu, izračunata na serveru.
