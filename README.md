# Tidywright

Radni naziv. SaaS koji skenira sajt, nađe SEO probleme, napiše popravke i primijeni ih
tako da ostanu u sistemu koji kupac posjeduje.

Ovaj folder je zajednička memorija projekta. Sve što smo odlučili, sve što još nismo, i
sve što je izmjereno. Cilj je da se ni ja ni Claude Code nikad ne izgubimo u tome šta
gradimo i dokle smo došli.

## Odakle početi

| Ako hoćeš                                             | Otvori                                  |
| ----------------------------------------------------- | --------------------------------------- |
| Razumjeti ideju u dvije minute                        | `docs/01-idea.md`                       |
| Vidjeti dokle smo došli i šta je sljedeće             | `STATUS.md`                             |
| Znati šta konkurencija radi                           | `docs/02-market.md`                     |
| Brojke, cijene, scenarije                             | `docs/03-economics.md`                  |
| Šta tačno gradimo u verziji 1                         | `docs/04-scope.md`                      |
| Listu provjera i popravki                             | `docs/05-checks.md`, `docs/06-fixes.md` |
| Kako popravka stiže na sajt i šta ako pukne           | `docs/07-delivery-and-safety.md`        |
| Tehnički plan                                         | `docs/08-architecture.md`               |
| Dizajn ekrana                                         | `docs/09-screens.md` i `design/`        |
| Šta se tačno gradi u fazi 1                           | `docs/13-widget-spec.md`                |
| Istraživanje kanala                                   | `docs/12-channel-research.md`           |
| Šta još nije odlučeno                                 | `docs/11-open-questions.md`             |
| Sve površine, uloge i tokovi                          | `docs/14-product-map.md`                |
| Svaka ruta i svaki ekran, stanje po stanje            | `docs/15-frontend-spec.md`              |
| Ko šta smije vidjeti (matrica, RLS)                   | `docs/16-access-control.md`             |
| API, poslovi, radnik, model                           | `docs/17-backend-spec.md`               |
| Sve tabele, indeksi, zadržavanje                      | `docs/18-data-model.md`                 |
| Zašto Postgres i Supabase, bez žargona                | `docs/19-database-choice.md`            |
| Hetzner, Cloudflare, Vercel, tri stepenice s cijenama | `docs/20-infrastructure.md`             |
| Koliko sistem podnosi, računica za 100.000            | `docs/21-capacity.md`                   |
| Sigurnost: SSRF, zloupotreba, tajne, incident         | `docs/22-security.md`                   |
| GDPR, DPA, email zakoni, uslovi                       | `docs/23-compliance.md`                 |
| Stripe, planovi, entitlements, dunning                | `docs/24-billing.md`                    |
| Nadzor, alarmi, CI/CD, backup, runbookovi             | `docs/25-observability-and-ops.md`      |
| Email: domene, DNS, zagrijavanje, dobavljač           | `docs/26-email.md`                      |
| Dizajn sistem: tokeni, komponente, stanja             | `docs/27-design-system.md`              |
| Marketing sajt i lansiranje                           | `docs/28-marketing-site.md`             |
| Faza 3: WordPress, GitHub, patch, GSC                 | `docs/29-phase3-connectors.md`          |
| Testiranje                                            | `docs/30-testing.md`                    |
| Redoslijed gradnje, frontend prvo                     | `docs/31-build-plan.md`                 |
| Rječnik termina                                       | `docs/32-glossary.md`                   |
| Tačan tekst promptova i validacija izlaza             | `docs/33-model-prompts.md`              |

## Pokretanje koda

Treba Node 22 (vidi `.nvmrc`) i pnpm.

```bash
corepack enable
pnpm install
pnpm dev           # web aplikacija na http://localhost:3000
pnpm storybook     # biblioteka komponenti na http://localhost:6006
```

Ostalo: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm format`.

```
apps/web/       Next.js: aplikacija, obrazac, izvještaj, marketing
packages/ui/    tokeni i komponente, sa Storybookom
packages/shared/ tipovi, planovi, katalog provjera, mock podaci
db/             migracije i seed (dolazi u B1)
```

Mock podaci iz `packages/shared/src/mocks` (seed 42, tri agencije, 200 leadova,
500 audita) hrane i Storybook i lažni API i kasnije seed baze, pa je ono sto
vidis u prici isto ono sto dobijes u razvoju.

## Pravila ovog foldera

1. Odluka koja je donesena ide u `decisions/` kao zaseban fajl i više se ne raspravlja
   dok neko izričito ne otvori temu ponovo.
2. Sve što nije odlučeno ide u `docs/11-open-questions.md`, s opcijama, ne s prazninom.
3. `STATUS.md` se mijenja na kraju svake sesije. To je jedino mjesto koje kaže dokle smo.
4. Brojka bez izvora ne ide u dokument. Ako je pretpostavka, mora pisati da je pretpostavka.
