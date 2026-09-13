# Tehnički plan

Status: **potvrđen kroz `decisions/0006-stack.md`.** Ovaj dokument je prvi nacrt i
ostaje kao pregled. Detalji su razrađeni u `docs/14` do `docs/32`: model podataka u
`18-data-model.md` (zamjenjuje nacrt dolje), backend u `17-backend-spec.md`,
infrastruktura u `20-infrastructure.md`, redoslijed gradnje u `31-build-plan.md`.

## Načelo

Dosadan stack, jedan jezik gdje god može, što manje pokretnih dijelova. Sve što nije
jezgro proizvoda se kupuje gotovo ili preskače.

## Prijedlog

| Sloj | Izbor | Zašto |
|---|---|---|
| Aplikacija | Next.js, TypeScript | jedan jezik za web i radnika |
| Baza, auth, storage | Supabase | Postgres plus prijava plus fajlovi bez posebnog posla |
| Red poslova | Postgres red, bez Redisa na početku | manje dijelova, dovoljno za ovaj obim |
| Crawler | Node plus Playwright za render | Playwright samo gdje stranica traži JavaScript |
| Model | jedan dobavljač, grupna obrada za prvi prolaz | trošak i predvidivost |
| Plaćanje | Stripe Checkout plus Billing portal | najmanje vlastitog koda |
| WordPress plugin | PHP, zaseban repozitorij | traži ga WordPress direktorij |
| Hosting | Vercel za web, jedan mali server za radnika | crawl ne pripada u serverless |

## Struktura repozitorija

```
tidywright/
  apps/
    web/            Next.js, dashboard i javni skener
    worker/         crawl, provjere, generisanje popravki
  packages/
    crawler/        dohvat, render, parsiranje, poštovanje robots.txt
    checks/         katalog provjera, jedna datoteka po grupi
    fixes/          determinističke popravke i pozivi modela
    connectors/     wordpress, git, patch, edge
    shared/         tipovi, schema, pomoćne funkcije
  plugins/
    wordpress/      PHP plugin, vlastiti repozitorij kasnije
  docs/             ovaj folder
```

## Model podataka, prvi nacrt (zastarjelo, vidi `18-data-model.md`)

```
accounts        id, name, plan, stripe_customer_id
users           id, account_id, email, role
sites           id, account_id, url, verified_at, verify_method
connections     id, site_id, type, status, credentials_ref
crawls          id, site_id, started_at, finished_at, pages_count, status
pages           id, crawl_id, url, status_code, title, meta, html_hash
findings        id, crawl_id, page_id, check_code, severity, data
fixes           id, finding_id, kind, payload, state, model_used, cost
fix_versions    id, fix_id, before, after, applied_at, rolled_back_at
applications    id, fix_id, connection_id, result, log
reports         id, site_id, period, config, sent_at
```

`state` na popravci: `proposed`, `approved`, `applied`, `rejected`, `rolled_back`, `failed`.

## Tok posla

```
scan  ->  crawl  ->  checks  ->  findings
                                    |
                                    v
                          generate fixes (deterministic + model)
                                    |
                                    v
                            validate  ->  queue (proposed)
                                              |
                                     approval by a person
                                              |
                                              v
                              snapshot  ->  apply  ->  log
                                              |
                                        rollback available
```

## Otvoreno

- Supabase ili čisti Postgres. Supabase štedi sedmice na prijavi i fajlovima, ali vezuje.
- Vlastiti crawler ili DataForSEO On-Page za prvi prolaz. Vlastiti je jeftiniji i
  kontrolisan, njihov je gotov odmah. Vidi cijene u `docs/03-economics.md`.
- Gdje živi WordPress plugin, u istom repozitoriju ili zasebno. Direktorij traži svoj SVN.
