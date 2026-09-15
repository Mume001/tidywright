# Kontekst za Claude Code

Ovo je projekat Tidywright. Prije bilo kakvog rada pročitaj `docs/01-idea.md`,
`docs/04-scope.md` i `STATUS.md`. Odluke koje se ne preispituju su u `decisions/`.

## Šta proizvod radi

Kupac spoji svoj sajt. Mi ga crawlamo, pokrenemo katalog provjera, generišemo konkretne
popravke pomoću jezičkog modela, prikažemo razliku prije i poslije, i nakon odobrenja
upišemo izmjenu u kupčev sistem. Svaka izmjena ima snimak prije i vraćanje unazad.

## Tri pravila koja se ne krše

1. **Popravka mora preživjeti otkazivanje pretplate.** Upisujemo u kupčev WordPress,
   njegov repozitorij ili mu dajemo patch fajl. Ne ubacujemo izmjene JavaScriptom koji
   nestane kad kupac ode. Ovo je jedina stvar koja nas razlikuje od konkurencije.
   Vidi `decisions/0001-fixes-must-outlive-the-subscription.md`.
2. **Ništa ne ide uživo bez odobrenja čovjeka.** Nema tihe automatske primjene u verziji 1.
   Vidi `decisions/0003-nothing-applies-without-approval.md`.
3. **Ne kupujemo tuđe podatke.** Crawl kupčevog sajta, njegov Search Console preko OAuth-a,
   i besplatni Googleov PageSpeed. Bez indeksa backlinkova i bez baze volumena ključnih
   riječi. Vidi `decisions/0002-buy-no-third-party-data.md`.

## Jezik

- Kod, imena varijabli, komentari, poruke u commitu: engleski.
- Tekst koji vidi korisnik proizvoda: engleski.
- Dokumentacija u ovom folderu: bosanski.

## Stanje

Faza 1 je otvorena. Redoslijed gradnje je u `docs/31-build-plan.md`: prvo dizajn sistem
i svi ekrani s mock podacima (F0 do F3), pregled s Mumetom, pa tek onda backend (B1 do
B6). Prije F0 pročitaj `docs/27-design-system.md`, `docs/15-frontend-spec.md` i
`docs/14-product-map.md`. Prije B1 pročitaj `docs/18-data-model.md`,
`docs/16-access-control.md`, `docs/17-backend-spec.md` i `docs/22-security.md`.
Specifikacija proizvoda ostaje `docs/13-widget-spec.md`, provjere `docs/05-checks.md`,
popravke `docs/06-fixes.md`.

## Mapa dokumenata po temi

| Tema                          | Dokument                                                        |
| ----------------------------- | --------------------------------------------------------------- |
| šta gdje živi, uloge, tokovi  | `docs/14-product-map.md`                                        |
| rute i ekrani                 | `docs/15-frontend-spec.md`                                      |
| dozvole i RLS                 | `docs/16-access-control.md`                                     |
| API, poslovi, radnik          | `docs/17-backend-spec.md`                                       |
| tabele                        | `docs/18-data-model.md`                                         |
| infrastruktura i deploy       | `docs/20-infrastructure.md`, `docs/25-observability-and-ops.md` |
| kapacitet                     | `docs/21-capacity.md`                                           |
| sigurnost                     | `docs/22-security.md`                                           |
| verifikacija bota             | `docs/38-bot-verification.md`                                   |
| server                        | `docs/39-server-setup.md`                                       |
| pravo                         | `docs/23-compliance.md`                                         |
| naplata                       | `docs/24-billing.md`                                            |
| email                         | `docs/26-email.md`                                              |
| dizajn                        | `docs/27-design-system.md`, `design/`                           |
| testovi                       | `docs/30-testing.md`                                            |
| redoslijed                    | `docs/31-build-plan.md`                                         |
| promptovi i validacija modela | `docs/33-model-prompts.md`                                      |

## Kako se radi u ovom repozitoriju

- Jedan miljokaz, jedan PR. Ne kreće se na sljedeći dok test iz kolone "gotovo kad" u
  `docs/31-build-plan.md` ne prođe ručno.
- Frontend prvo: nijedna ruta u backendu dok ekran koji je koristi nema četiri priče u
  Storybooku (Loading, Empty, Error, Default).
- Svaki tuđi URL ide samo kroz `safeFetch`. Svaka nova tabela dobija `agency_id`, RLS
  politiku i RLS test u istom PR-u.
- Nikad em dash ni en dash u tekstu koji vidi korisnik ni u dokumentima. Tačka, zarez
  ili novi red.
- Sve što nije u specifikaciji se ne gradi. Ako nešto fali, dodaj pitanje u
  `docs/11-open-questions.md` umjesto da pretpostaviš.
- Na kraju svake sesije ažuriraj `STATUS.md`: koji miljokaz, šta radi, šta ne radi.
- SSRF zaštita i limiti iz specifikacije nisu opcionalni ni u prvom commitu.
- Nikad ne upisuj tajne u repozitorij. `.env.example` sa praznim vrijednostima.
