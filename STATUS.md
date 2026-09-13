# Gdje smo

Zadnja izmjena: 14. septembar 2026.

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
- [x] Pet od šest otvorenih pitanja zatvoreno odlukom `0008`

## Sljedeći korak

1. Claude Code kreće na F0 iz `docs/31-build-plan.md`. Ništa ga ne blokira.
2. Mume otvara naloge iz `docs/11-open-questions.md` pitanje 15, redom kako trebaju.
3. Otvoreno je samo pravno lice za Stripe (pitanje 9), treba do kraja F2.

## Miljokazi (iz `docs/31-build-plan.md`)

Frontend s mock podacima:
- [ ] F0 monorepo, alati, dizajn sistem, mock sloj, CI
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

| Datum | Šta se desilo |
|---|---|
| 12.09.2026. | Ideja nastala iz ručnog audita adconnecta.com |
| 12.09.2026. | Istraživanje konkurencije i troškova, dizajn ekrana |
| 13.09.2026. | Finansijski model i tri scenarija, postavljen ovaj folder |
| 13.09.2026. | Istraživanje kanala s 8 agenata, odluka: widget prvi |
| 13.09.2026. | Opseg widgeta i stack odlučeni, specifikacija napisana, faza 1 otvorena |
| 13.09.2026. | Ime Tidywright, domene kupljene, folder i dizajn preimenovani |
| 14.09.2026. | Noćna sesija: 19 dokumenata (14 do 32), plan gradnje frontend prvo, drugo dizajn platno |
| 14.09.2026. | Promptovi modela (`docs/33`), odluka 0008 zatvara pet otvorenih pitanja |
