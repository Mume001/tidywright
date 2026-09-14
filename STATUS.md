# Gdje smo

Zadnja izmjena: 14. septembar 2026. (F0 gotov)

## Faza 1 je OTVORENA: gradnja widgeta

## Urađeno

- [x] Ručni audit stvarnog sajta (adconnecta.com) kao dokaz da jezgro radi
- [x] Istraživanje konkurencije, 7 proizvoda u kategoriji, `docs/02-market.md`
- [x] Troškovna analiza, provjerene cijene svih API-ja, `docs/03-economics.md`
- [x] Finansijski model, tri scenarija kroz 24 mjeseca, `model/`
- [x] Dizajn osam ekrana aplikacije, `design/`
- [x] Istraživanje kanala, 8 agenata, `docs/12-channel-research.md`
- [x] Četiri odluke zapisane u `decisions/`, uključujući prvi kanal

## Odlučeno u ovoj sesiji

- Prvi kanal: widget za audit s prikazom popravki, `decisions/0004`
- Opseg widgeta: tri gotove popravke, ocjena sa četiri podocjene, bez PageSpeeda, jedna
  stranica, `decisions/0005`
- Stack: Next.js, Supabase, zaseban radnik, `decisions/0006`
- Specifikacija za gradnju: `docs/13-widget-spec.md`
- Ime i domene: Tidywright, `decisions/0007`

## Urađeno 13. i 14.09. (noćna sesija, 19 novih dokumenata)

- [x] Mapa proizvoda, svaka ruta i ekran, matrica dozvola, API i poslovi
- [x] Model podataka za sve faze, izbor baze objašnjen, infrastruktura na Hetzneru u
      tri stepenice s cijenama, kapacitet za 100.000 agencija
- [x] Sigurnost, GDPR, naplata, nadzor i deploy, email, dizajn sistem, marketing sajt,
      faza 3 konektori, testiranje, plan gradnje, rječnik
- [x] Drugo dizajn platno: ekrani faze 1 (obrazac, izvještaj, dashboard, onboarding)
- [x] Promptovi za model napisani doslovno, s validacijom i test setom (`docs/33`)
- [x] Katalog provjera proširen sa 29 na **176**, od toga 174 radi u widgetu bez crawla
      i 68 posto dolazi s gotovom popravkom (`docs/05-checks.md`, generisan iz koda)
- [x] Ocjena prepravljena: deset grupa s težinama, grupa se ocjenjuje samo po
      provjerama koje su radile (`packages/shared/src/score.ts`)
- [x] Šest filtera nad izlazom modela: injection, izmišljene činjenice, spam, AI trag,
      generičnost, duplikat (`fix-guard.ts`, `specificity.ts`)
- [x] Pet od šest otvorenih pitanja zatvoreno odlukom `0008`

## F0 je GOTOV

Monorepo, dizajn sistem i mock podaci stoje. Provjereno prije commita: format, lint,
tipovi, testovi i buildovi prolaze, Storybook se builda.

- pnpm workspaces plus Turborepo, TypeScript 6.0.3 (ne 7, jer `typescript-eslint` još
  ne podržava 7), ESLint s tri naša pravila, Prettier, husky, gitleaks, GitHub Actions
- `packages/shared`: tipovi iz `18-data-model`, `PLANS` kao jedini izvor istine za
  cijene i limite, katalog od 29 provjera, i generator mock podataka sa seedom 42
  (3 agencije, 200 leadova, 500 audita; svako stanje je dostupno u pričama)
- `packages/ui`: tokeni za obje teme na istim imenima, 15 komponenti s pričama
- `apps/web`: Next.js 16, fontovi iz npm-a (ništa ne ide Googleu), `proxy.ts` dijeli
  domene, kontrast boje agencije se računa na serveru

Odstupanja od plana, oba namjerna: Storybook 10 umjesto 9 (verzija 9 više nije
aktuelna), i TypeScript 6 umjesto 7 zbog `typescript-eslint`.

## Sljedeći korak

1. Na Macu: `rm .git/index.lock`, pa `corepack enable && pnpm install`, pa
   `pnpm storybook` da vidiš komponente i `pnpm dev` za aplikaciju.
2. Claude Code kreće na F1 iz `docs/31-build-plan.md`: embed obrazac i izvještaj.
3. Mume otvara naloge iz `docs/11-open-questions.md` pitanje 15, redom kako trebaju.
4. Otvoreno je samo pravno lice za Stripe (pitanje 9), smjer je Estonija, treba do
   kraja F2.

## Miljokazi (iz `docs/31-build-plan.md`)

Frontend s mock podacima:

- [x] F0 monorepo, alati, dizajn sistem, mock sloj, CI
- [ ] F1 embed obrazac, `/embed.js`, izvještaj sa svim stanjima
- [ ] F2 aplikacija: auth, onboarding, svi ekrani, admin, Storybook
- [ ] Kontrolna tačka: pregled s Mumetom
- [ ] F3 marketing sajt

Backend:

- [ ] B1 Supabase, schema, RLS, auth, brendiranje, ključevi
- [ ] B2 radnik, safeFetch, 29 provjera, ocjena, CLI
- [ ] B3 popravke kroz model
- [ ] B4 API, izvještaj uživo, embed, deploy
- [ ] B5 leadovi, emailovi, webhook, zaštita, statistike, retention
- [ ] B6 lansiranje besplatnog plana, pet pilot agencija

## Dnevnik

| Datum       | Šta se desilo                                                                           |
| ----------- | --------------------------------------------------------------------------------------- |
| 12.09.2026. | Ideja nastala iz ručnog audita adconnecta.com                                           |
| 12.09.2026. | Istraživanje konkurencije i troškova, dizajn ekrana                                     |
| 13.09.2026. | Finansijski model i tri scenarija, postavljen ovaj folder                               |
| 13.09.2026. | Istraživanje kanala s 8 agenata, odluka: widget prvi                                    |
| 13.09.2026. | Opseg widgeta i stack odlučeni, specifikacija napisana, faza 1 otvorena                 |
| 13.09.2026. | Ime Tidywright, domene kupljene, folder i dizajn preimenovani                           |
| 14.09.2026. | Noćna sesija: 19 dokumenata (14 do 32), plan gradnje frontend prvo, drugo dizajn platno |
| 14.09.2026. | Promptovi modela (`docs/33`), odluka 0008 zatvara pet otvorenih pitanja                 |
| 14.09.2026. | F0 napravljen i verifikovan: monorepo, dizajn sistem, mock podaci, Next.js              |
| 14.09.2026. | Katalog 29 -> 176 provjera, nova ocjena s težinama, šest filtera kvaliteta, 72 testa    |
