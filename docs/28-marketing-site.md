# Marketing sajt (tidywright.com)

Stranice, poruke, struktura, tehnika. Sajt je za agencije. Vlasnici sajtova dolaze u
fazi 3 i dobijaju vlastitu stranicu tada.

## Poruka

Naslov: **"Turn your website audit form into a lead machine that shows the fix."**
Podnaslov: "Embed a branded SEO audit on your site. Visitors get a score and three
ready-to-use fixes. You get the lead. Free to start, no card."

Tri tačke ispod (šta nas razlikuje):
1. **Shows the fix, not just the problem.** Every report includes a rewritten title,
   meta description and structured data the visitor can copy today.
2. **Your brand only.** On paid plans nothing says Tidywright. Your domain sends the
   email.
3. **No cookies, no scripts to explain.** The form lives in an iframe on our side.
   Your cookie banner stays as it is.

Ton: konkretan, bez "revolutionary", bez "AI-powered" u naslovu (AI se pominje jednom,
u objašnjenju kako nastaju popravke). Brojevi gdje ih imamo (29 checks, under 15
seconds, 3 fixes).

## Stranice

| Ruta | Sadržaj | Faza |
|---|---|---|
| `/` | hero s živim widgetom (naš vlastiti obrazac, pravi audit), tri tačke, kako radi u 3 koraka sa slikama, primjer izvještaja (statična slika + link na pravi demo izvještaj), poređenje s "just a score" alatima, cijene sažeto, FAQ, CTA | 1 |
| `/pricing` | 4 plana, godišnje/mjesečno prekidač, tabela svih razlika, FAQ o naplati | 1 (Free + Starter), 2 (sve) |
| `/docs` | dokumentacija za ugradnju: WordPress, Webflow, Squarespace, Wix, Framer, HTML; webhook; API; branding; email domain | 1 |
| `/docs/embed` i podstranice | jedna po platformi, s tačnim koracima i slikama | 1 |
| `/demo` | pravi hostovani obrazac s našim brendom (`/a/tidywright` na siteauditserver) | 1 |
| `/report-example` | statični izvještaj za `example-agency.com` | 1 |
| `/for-agencies` | duža stranica: kako agencije koriste, ROI računica (leadovi × stopa × vrijednost), integracija s njihovim CRM kroz webhook/Zapier | 2 |
| `/compare/seoptimer`, `/compare/mysiteauditor` | poštena tabela, naše prednosti i njihove | 2 |
| `/bot` | ko je TidywrightBot, kako blokirati | 1 |
| `/legal/terms`, `/privacy`, `/dpa`, `/subprocessors`, `/cookies` | iz `legal/*.md` | 1 |
| `/changelog` | iz Markdown fajlova, RSS | 1 |
| `/blog` | tek kad ima šta, ne prazan | 3 |
| `/status` | redirect na status.tidywright.com | 1 |

## Struktura naslovne, sekcija po sekcija

1. **Nav:** logo, Docs, Pricing, Log in, Start free (lime).
2. **Hero:** naslov, podnaslov, obrazac uživo (pravi `/e/pk_live_...` iframe s našim
   ključem), ispod "No card. 50 free audits a month."
3. **Logo traka:** prazna dok nema kupaca, ne izmišljati. Umjesto toga "Built for
   agencies on WordPress, Webflow, Squarespace, Framer" s ikonama platformi.
4. **Kako radi:** tri kartice: Embed (kod, 2 min), Visitor gets report (slika
   izvještaja), You get the lead (slika inboxa i dashboarda).
5. **Izvještaj izbliza:** velika slika izvještaja s tri FixCard-a, anotacije.
6. **Razlika:** dvije kolone "Score-only tools" vs "Tidywright": problem vs fix, generic
   PDF vs your brand, tracking scripts vs iframe, lead in email vs lead in dashboard +
   webhook.
7. **Za koga:** SEO agencije, web studiji, freelanceri, hosting firme (svaka jedna
   rečenica).
8. **Cijene sažeto:** Free i Starter kartice, link na sve.
9. **FAQ:** 8 pitanja (does it slow my site, GDPR, can I edit the fixes, what sites can
   it audit, JS sites, limits, cancel, white label).
10. **CTA:** "Put an audit form on your site today." Start free.
11. **Footer:** proizvod, docs, legal, status, changelog, kontakt, "Made in Bosnia"
    ako Mume želi, adresa firme.

## SEO sajta (naša vlastita)

- Ciljne fraze: "seo audit widget", "embeddable seo audit tool", "white label seo
  audit tool", "seo audit lead generation", "seoptimer alternative". Volumen je mali
  ali namjera je tačna. Jedna stranica po frazi (naslovna, /for-agencies, /compare/*).
- Tehnički: Next.js statičan export gdje može, `next/image`, Core Web Vitals zelene
  (embed iframe se učitava `loading="lazy"` ispod prvog ekrana, hero verzija odmah ali
  je mala).
- Strukturirani podaci: `SoftwareApplication`, `FAQPage`, `Organization`.
- Naš vlastiti sajt mora imati ocjenu 95+ u našem auditu. Ako ne, to je prvi bug.

## Tehnika

- Isti Next.js monorepo, `apps/web` s `(marketing)` route grupom, ili zaseban
  `apps/site` ako marketing sajt treba drugi deploy ritam. Početak: ista aplikacija,
  jer dijele dizajn sistem i widget.
- Sadržaj u MDX (`content/`), ne u CMS-u. Promjena teksta je PR.
- Analitika: Plausible (9 $) ili self-host Umami na Coolify (0). Bez kolačića, bez
  bannera. Događaji: signup_click, demo_submit, pricing_view, docs_view.
- Slike izvještaja se generišu iz pravog izvještaja Playwright screenshotom u CI, da
  budu uvijek tačne kad se dizajn promijeni.

## Lansiranje

1. **Tiho (sedmica 1 poslije M6):** sajt gore, 5 do 10 agencija iz ličnog kruga
   (AdConnecta prva) dobija pozivnicu, cilj: 3 ugradnje i 50 pravih audita.
2. **Directories (sedmica 2 do 4):** Product Hunt (utorak, priprema 2 sedmice), BetaList,
   AlternativeTo (kao alternativa SEOptimeru, MySiteAuditoru), SaaSHub, G2 profil
   (traži 10 recenzija za prikaz), Capterra.
3. **Zajednice (stalno, bez spama):** r/SEO, r/webdev, r/agency, Indie Hackers, WP
   Facebook grupe: odgovori na pitanja "how do I get leads from my site", s alatom
   pomenutim samo kad je relevantan.
4. **Sadržaj (od mjeseca 2):** "We audited 1,000 agency websites, here's what's broken"
   iz naših anonimizovanih podataka. To je jedini sadržaj koji drugi ne mogu napisati.
5. **Integracije kao kanal (faza 2):** Zapier/Make integracija (webhook je već tu) i
   listing u njihovim direktorijima; WordPress plugin "Tidywright Audit Form" koji
   samo ubacuje shortcode (mali, brz pregled, ulaz u direktorij bez SEO plugin
   konkurencije).

Vidi `12-channel-research.md` za zašto nije cold outreach i nije Shopify.
