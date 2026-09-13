# Konkurencija

Istraženo 12. septembra 2026. Sve cijene su sa stranica proizvođača tog dana.

## Ko već radi automatsko popravljanje

| Proizvod | Cijena | Kako se spaja | Gdje izmjena živi |
|---|---|---|---|
| SearchAtlas OTTO | 99 do 999 USD | JavaScript pixel | u browseru, ne u CMS-u |
| Alli AI | 299 do 599 USD | jedna linija koda | overlay, odobrenje obavezno |
| Ahrefs Patches | dodatak na plan | JS snippet ili Cloudflare Worker | worker piše serverski |
| SEOmatic | 99 do 699 USD | piše u CMS preko API-ja | u kupčevom CMS-u |
| SEOJuice | od 24 EUR | plugin i API | nejasno dokumentovano |
| SEOAgent | 49 USD po sajtu | skill u Claude Code, piše u repozitorij | u kupčevom repozitoriju |
| Scrunch AXP, Adobe LLM Optimizer | nije objavljeno | Cloudflare Worker, Akamai, CloudFront | na rubu mreže |

## Šta ovo znači

**Kategorija je gusta.** Sedam proizvoda radi skoro identičnu listu: title, meta, schema,
alt tekstovi, interni linkovi, canonical, preusmjerenja. Cijene su se raspale od 24 EUR do
999 USD za preklapajuću funkcionalnost, što je znak zrele gužve.

**Ahrefs je presudan signal.** Kad igrač s distribucijom ubaci tvoju glavnu funkciju kao
dodatak na postojeći plan, samostalni proizvod ostaje bez odbrane osim cijene.

**Ali svi imaju istu rupu.** JavaScript overlay ima tri problema koje niko nije riješio:

1. Izmjena ne postoji u kupčevom sistemu. Skineš skriptu i nema je.
2. AI crawleri tipa GPTBot i ClaudeBot ne izvršavaju JavaScript, pa ne vide ubačeno.
3. Odgovor tržišta na to je posluživanje drugačijeg HTML-a botovima nego ljudima, što je
   blizu cloakinga i nosi rizik koji niko javno ne kvantifikuje.

Jedini koji ovo rješava drugačije je SEOAgent, koji piše u repozitorij. Mali je i cilja
samo programere.

## Klasični alati, za kalibraciju

| Alat | Ulazna cijena | Šta naplaćuje |
|---|---|---|
| Ahrefs | 129 USD | projekti, praćene riječi, crawl krediti, mjesta |
| Semrush | 139 USD | sajtovi, riječi dnevno, AI upiti, mjesta |
| SE Ranking | 129 USD (+69 za agencijski paket) | isto plus stranice audita |
| Moz | 49 USD | kampanje, riječi, stranice |
| Sitebulb | od 18 USD desktop, 125 cloud | URL-ovi po auditu, mjesta |
| Screaming Frog | 199 GBP godišnje | broj licenci |
| SEOptimer | 29 do 59 USD | crawlovi, riječi, bijela etiketa, ugradbeni widget |

Sitebulb i Screaming Frog su važni kao dokaz: oba su poslovi koji rade **samo od crawla**,
bez ijednog kupljenog podatka. To je model koji kopiramo na strani podataka.

## Šta upozorava

- Rank Math je 31.08.2026. morao pauzirati AI funkciju jer je tiho pravila WordPress
  aplikacijske lozinke bez jasne dozvole. WordPress zajednica je osjetljiva na pisanje
  bez pristanka. Ovo direktno utiče na `docs/07-delivery-and-safety.md`.
- Semrush je ugasio Agency Growth Kit, znači klijentski portali im se nisu isplatili.
  Ono što je preživjelo kod konkurencije je jeftiniji oblik: bijela etiketa na izvještaju
  plus mjesta za klijente.
- Kod OTTO se kupci žale na otkazivanje pretplate i podršku. To je prostor za nas.

## Izvori

- SearchAtlas OTTO: https://searchatlas.com/otto-seo/ i https://help.searchatlas.com/en/articles/11880172-otto-setup-functionality-and-deployment
- Alli AI: https://www.alliai.com/pricing
- Ahrefs Patches: https://ahrefs.com/patches
- SEOmatic: https://seomatic.ai/pricing
- SEOJuice: https://seojuice.com/pricing
- SEOAgent: https://seoagent.com/
- Ahrefs cijene i podaci: https://ahrefs.com/pricing , https://ahrefs.com/big-data
- Semrush cijene: https://www.semrush.com/prices/
- SE Ranking: https://seranking.com/subscription.html
- Sitebulb: https://sitebulb.com/pricing/
- Screaming Frog: https://www.screamingfrog.co.uk/seo-spider/pricing/
- SEOptimer: https://www.seoptimer.com/pricing
- Rank Math incident: https://www.searchenginejournal.com/rank-math-seo-plugin-pauses-controversial-feature-says-it-will-return/587853/
