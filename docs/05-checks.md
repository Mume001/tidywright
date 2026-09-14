# Katalog provjera

Status: **potvrđeno 14.09.2026.** Zamjenjuje raniju listu od 40 provjera.

Ovaj dokument je **generisan iz koda**, iz `packages/shared/src/checks-catalog.ts`.
Ako se razlikuje od koda, kod je u pravu. Regeneriše se skriptom kad se katalog mijenja,
da ne bi odlutao kao što dokumentacija uvijek odluta.

Legenda ozbiljnosti: K kritično, V visoko, N nisko.
Legenda popravke: A generišemo ispravljenu vrijednost, R samo prijavljujemo problem.
Kolona "Treba": šta audit mora dohvatiti prije nego što provjera može da radi.
`stranica` znači da je dovoljan onaj jedan dohvat koji ionako radimo.

## Zašto ovoliko

Ranija verzija je imala 29 provjera u fazi 1. To je bilo premalo, i to iz pogrešnog
razloga: opseg "jedna stranica" sam pobrkao s opsegom "malo provjera". S jednog dohvata
HTML-a i zaglavlja odgovora može se provjeriti višestruko više.

Agencija ovo prodaje svom klijentu. Izvještaj s 29 stavki izgleda kao besplatna
igračka. Izvještaj sa 174 provjere, od kojih dvije trećine dolaze s gotovom popravkom,
izgleda kao posao koji neko naplaćuje. To je razlika između "hvala, pogledaću" i
"koliko bi koštalo da vi ovo uradite".

**Ali dubina ide u podatke, ne u prvi ekran.** Istraživanje konkurencije je pokazalo da
je najčešća žalba na postojeće alate upravo "predugačak i pretehnički izvještaj".
Izvještaj je zato slojevit, i taj raspored je obavezan:

1. Ocjena, deset podocjena, i rečenica koja kaže šta je najveći problem.
2. **Tri gotove popravke.** To je proizvod. Posjetilac ih može kopirati odmah.
3. Prioriteti: šest nalaza poredanih po tome šta prvo popraviti.
4. Sve ostalo, po grupama, sklopljeno. Otvara ko hoće.

Onaj ko hoće dubinu je nađe. Onaj ko hoće samo da zna šta da uradi vidi tri stvari.
Redoslijed prioriteta računa `prioritise()` u `packages/shared/src/score.ts`: prvo
ozbiljnost, pa težina grupe, pa da li popravku umijemo napisati.

## Koliko košta jedan audit

Cijeli katalog radi sa **najviše pet zahtjeva** prema tuđem serveru: sama stranica,
`robots.txt`, `sitemap.xml`, i do dva provjeravanja resursa (recimo da li slika za
dijeljenje stvarno postoji). Bez PageSpeeda, bez crawla, bez čekanja od trideset
sekundi. Sve iz grupe Speed se čita iz HTML-a i zaglavlja onog prvog dohvata.

To je i zaštita za tuđi sajt i zaštita za nas: audit ostaje ispod 15 sekundi i ispod
jednog centa.

## Ocjena

Svaka grupa se ocjenjuje **samo po provjerama koje su stvarno radile**. Stranica bez
slika ne gubi bodove zato što nema alt tekstova.

Ukupna ocjena je ponderisani prosjek grupa, po težinama iz tabele ispod, a ne prosjek
svih provjera. Razlog je važan: kad bi se brojale provjere, dodavanje četrnaest
pristupačnosti odjednom bi pristupačnost učinilo najvećim faktorom SEO ocjene, što nije
tačno i učinilo bi broj besmislenim. Težine kažu šta koliko vrijedi za pretragu,
nezavisno od toga koliko smo provjera slučajno napisali u kojoj grupi.

Neuspjela provjera gubi svu svoju težinu, upozorenje pola. Kritično nosi 3, visoko 2,
nisko 1.

## Sažetak

| Grupa | Provjera | Kritičnih | Popravljivo | Težina u ocjeni |
|---|---|---|---|---|
| Indexing | 28 | 7 | 61% | 18 |
| Page tags | 26 | 3 | 96% | 18 |
| Content | 26 | 2 | 31% | 14 |
| Structured data | 20 | 3 | 95% | 12 |
| Speed | 16 | 0 | 31% | 10 |
| Images and media | 15 | 0 | 73% | 8 |
| Social sharing | 13 | 0 | 77% | 6 |
| Mobile | 8 | 1 | 63% | 6 |
| Security and trust | 10 | 1 | 80% | 4 |
| Accessibility | 14 | 0 | 79% | 4 |
| **Ukupno** | **176** | **17** | **68%** | **100** |

U widgetu faze 1 radi 174 od 176. Ostale traže crawl cijelog sajta i dolaze u fazi 3.

## Indexing

Whether search engines can reach this page and know it is the real one.

Težina u ukupnoj ocjeni: 18 od 100.

| Kod | Provjera | Ozb. | Popravka | Treba | Faza |
|---|---|---|---|---|---|
| `page_status` | Page loads | K | R | headers | 1 |
| `https_active` | Secure connection | K | R | headers | 1 |
| `https_redirect` | http sends to https | K | A | headers | 1 |
| `www_duplicate` | One address only | K | A | headers | 1 |
| `noindex` | Page may be indexed | K | R | stranica | 1 |
| `robots_header_noindex` | No noindex in headers | K | R | headers | 1 |
| `robots_blocks` | robots.txt allows this page | K | A | robots | 1 |
| `robots_exists` | robots.txt exists | V | A | robots | 1 |
| `robots_valid` | robots.txt is valid | V | A | robots | 1 |
| `robots_not_html` | robots.txt is a text file | V | A | robots | 1 |
| `sitemap_declared` | Sitemap is declared | V | A | robots | 1 |
| `sitemap_reachable` | Sitemap loads | V | A | sitemap | 1 |
| `sitemap_valid` | Sitemap is valid XML | V | A | sitemap | 1 |
| `canonical_present` | Canonical tag | V | A | stranica | 1 |
| `canonical_absolute` | Canonical is a full URL | V | A | stranica | 1 |
| `canonical_self` | Canonical points here | V | A | stranica | 1 |
| `canonical_single` | One canonical tag | V | A | stranica | 1 |
| `canonical_scheme` | Canonical matches the address | V | A | stranica | 1 |
| `redirect_chain` | Short path to the page | N | A | headers | 1 |
| `meta_refresh` | No meta refresh | V | A | stranica | 1 |
| `url_length` | Readable address | N | R | stranica | 1 |
| `url_params` | Clean address | N | R | stranica | 1 |
| `url_case` | Lowercase address | N | R | stranica | 1 |
| `url_underscores` | Words separated by dashes | N | R | stranica | 1 |
| `soft_404` | Not a disguised error | V | R | stranica | 1 |
| `amp_link` | No stale AMP link | N | R | stranica | 1 |
| `hreflang_return` | Language links point back | V | A | stranica | 3 |
| `pagination_tags` | Pagination is clean | N | R | stranica | 1 |

## Page tags

The words Google shows in results. This is where most clicks are won or lost.

Težina u ukupnoj ocjeni: 18 od 100.

| Kod | Provjera | Ozb. | Popravka | Treba | Faza |
|---|---|---|---|---|---|
| `title_present` | Title tag | K | A | stranica | 1 |
| `title_length` | Title length | V | A | stranica | 1 |
| `title_generic` | Title says something | V | A | stranica | 1 |
| `title_brand_only` | Title is more than a name | V | A | stranica | 1 |
| `title_keyword_stuffed` | Title reads naturally | V | A | stranica | 1 |
| `title_single` | One title tag | V | A | stranica | 1 |
| `title_caps` | Title is not shouting | N | A | stranica | 1 |
| `title_separators` | Title is easy to read | N | A | stranica | 1 |
| `meta_present` | Meta description | K | A | stranica | 1 |
| `meta_length` | Description length | V | A | stranica | 1 |
| `meta_generic` | Description says something | V | A | stranica | 1 |
| `meta_duplicate_title` | Description adds to the title | N | A | stranica | 1 |
| `meta_single` | One description | N | A | stranica | 1 |
| `meta_keywords` | No meta keywords tag | N | A | stranica | 1 |
| `h1_present` | Main heading | K | A | stranica | 1 |
| `h1_single` | One main heading | V | A | stranica | 1 |
| `h1_not_empty` | Heading has text | V | A | stranica | 1 |
| `h1_length` | Heading length | N | A | stranica | 1 |
| `h1_differs_title` | Heading adds to the title | N | A | stranica | 1 |
| `heading_order` | Heading levels in order | N | A | stranica | 1 |
| `heading_not_empty` | No empty headings | N | A | stranica | 1 |
| `heading_count` | Content is broken up | N | R | stranica | 1 |
| `lang_declared` | Page language | V | A | stranica | 1 |
| `lang_matches` | Language matches the text | N | A | stranica | 1 |
| `charset_declared` | Character set | V | A | stranica | 1 |
| `charset_early` | Character set declared early | N | A | stranica | 1 |

## Content

Whether there is enough here to rank, and a clear way to get in touch.

Težina u ukupnoj ocjeni: 14 od 100.

| Kod | Provjera | Ozb. | Popravka | Treba | Faza |
|---|---|---|---|---|---|
| `word_count` | Enough content | V | R | stranica | 1 |
| `text_ratio` | Text to code ratio | N | R | stranica | 1 |
| `placeholder_text` | No placeholder text | K | R | stranica | 1 |
| `lorem_ipsum` | No dummy text | K | R | stranica | 1 |
| `coming_soon` | No unfinished sections | V | R | stranica | 1 |
| `duplicate_paragraphs` | No repeated blocks | N | R | stranica | 1 |
| `sentence_length` | Readable sentences | N | R | stranica | 1 |
| `contact_phone` | Phone number on the page | V | R | stranica | 1 |
| `phone_clickable` | Phone is tappable | V | A | stranica | 1 |
| `contact_email` | Email on the page | N | R | stranica | 1 |
| `email_clickable` | Email is clickable | N | A | stranica | 1 |
| `address_present` | Address on the page | V | R | stranica | 1 |
| `hours_present` | Opening hours | N | R | stranica | 1 |
| `cta_present` | A clear next step | V | R | stranica | 1 |
| `form_present` | A way to get in touch | N | R | stranica | 1 |
| `copyright_year` | Current year in footer | N | A | stranica | 1 |
| `links_have_text` | Links describe themselves | V | A | stranica | 1 |
| `link_text_generic` | Link text is useful | N | A | stranica | 1 |
| `links_not_empty` | No dead links | N | A | stranica | 1 |
| `external_links_safe` | Outbound links are safe | N | A | stranica | 1 |
| `internal_link_count` | Links to the rest of the site | N | R | stranica | 1 |
| `broken_internal_links` | Internal links work | V | A | probe | 3 |
| `mixed_language` | One language per page | N | R | stranica | 1 |
| `privacy_link` | Privacy policy linked | V | R | stranica | 1 |
| `terms_link` | Terms linked | N | R | stranica | 1 |
| `thin_boilerplate` | Content is specific | N | R | stranica | 1 |

## Structured data

What turns a plain result into one with hours, a map pin or a price.

Težina u ukupnoj ocjeni: 12 od 100.

| Kod | Provjera | Ozb. | Popravka | Treba | Faza |
|---|---|---|---|---|---|
| `jsonld_present` | Structured data | K | A | stranica | 1 |
| `jsonld_parses` | Structured data is valid | K | A | stranica | 1 |
| `jsonld_context` | Correct schema context | V | A | stranica | 1 |
| `jsonld_type_known` | Recognised type | V | A | stranica | 1 |
| `org_present` | Business identified | V | A | stranica | 1 |
| `org_required` | Business details complete | V | A | stranica | 1 |
| `localbusiness_address` | Address in markup | V | A | stranica | 1 |
| `localbusiness_phone` | Phone in markup | N | A | stranica | 1 |
| `localbusiness_hours` | Opening hours in markup | N | A | stranica | 1 |
| `localbusiness_geo` | Map position | N | A | stranica | 1 |
| `breadcrumb_present` | Breadcrumbs | N | A | stranica | 1 |
| `website_schema` | Site identified | N | A | stranica | 1 |
| `product_offers` | Price in markup | V | A | stranica | 1 |
| `product_availability` | Stock status in markup | N | A | stranica | 1 |
| `article_dates` | Article dates | N | A | stranica | 1 |
| `faq_opportunity` | FAQ markup | N | A | stranica | 1 |
| `sameas_links` | Social profiles linked | N | A | stranica | 1 |
| `rating_unsupported` | No invented ratings | K | R | stranica | 1 |
| `schema_duplicate` | No duplicate markup | N | A | stranica | 1 |
| `microdata_only` | Modern markup format | N | A | stranica | 1 |

## Speed

How quickly the page starts showing something useful.

Težina u ukupnoj ocjeni: 10 od 100.

| Kod | Provjera | Ozb. | Popravka | Treba | Faza |
|---|---|---|---|---|---|
| `ttfb` | Server response time | V | R | headers | 1 |
| `html_size` | Page weight | V | R | stranica | 1 |
| `compression` | Compression on | V | A | headers | 1 |
| `cache_headers` | Caching set | V | A | headers | 1 |
| `http_version` | Modern connection | N | R | headers | 1 |
| `render_blocking_js` | Scripts do not block drawing | V | A | stranica | 1 |
| `render_blocking_css` | Stylesheets are lean | V | R | stranica | 1 |
| `script_count` | Number of scripts | N | R | stranica | 1 |
| `third_party_scripts` | Third party weight | V | R | stranica | 1 |
| `inline_styles` | Styles are in files | N | R | stranica | 1 |
| `preconnect` | Outside connections warmed up | N | A | stranica | 1 |
| `font_display` | Text shows while fonts load | N | A | stranica | 1 |
| `font_count` | Number of web fonts | N | R | stranica | 1 |
| `third_party_fonts` | Fonts served from here | N | R | stranica | 1 |
| `dom_size` | Page complexity | N | R | stranica | 1 |
| `redirect_cost` | No wasted round trips | N | R | headers | 1 |

## Images and media

Images that load fast and that search engines can understand.

Težina u ukupnoj ocjeni: 8 od 100.

| Kod | Provjera | Ozb. | Popravka | Treba | Faza |
|---|---|---|---|---|---|
| `img_alt_present` | Image alt text | V | A | stranica | 1 |
| `img_alt_filename` | Alt text is real | N | A | stranica | 1 |
| `img_alt_length` | Alt text is concise | N | A | stranica | 1 |
| `img_alt_stuffed` | Alt text reads naturally | N | A | stranica | 1 |
| `img_dimensions` | Images reserve their space | V | A | stranica | 1 |
| `img_lazy` | Images load when needed | N | A | stranica | 1 |
| `img_modern_format` | Modern image formats | N | R | stranica | 1 |
| `img_srcset` | Right size per device | N | R | stranica | 1 |
| `img_count` | Sensible number of images | N | R | stranica | 1 |
| `img_inline_background` | Images are real images | N | R | stranica | 1 |
| `favicon_present` | Site icon | N | A | stranica | 1 |
| `apple_icon` | Icon for phone home screens | N | A | stranica | 1 |
| `video_title` | Video has a title | N | A | stranica | 1 |
| `iframe_lazy` | Embeds load when needed | N | A | stranica | 1 |
| `svg_accessible` | Icons are labelled | N | A | stranica | 1 |

## Social sharing

What the page looks like when somebody shares the link.

Težina u ukupnoj ocjeni: 6 od 100.

| Kod | Provjera | Ozb. | Popravka | Treba | Faza |
|---|---|---|---|---|---|
| `og_title` | Share title | V | A | stranica | 1 |
| `og_description` | Share description | V | A | stranica | 1 |
| `og_image` | Share image | V | A | stranica | 1 |
| `og_image_absolute` | Share image address | V | A | stranica | 1 |
| `og_image_size` | Share image size | N | R | probe | 1 |
| `og_image_loads` | Share image exists | V | R | probe | 1 |
| `og_url` | Share address | N | A | stranica | 1 |
| `og_type` | Share type | N | A | stranica | 1 |
| `og_site_name` | Site name in shares | N | A | stranica | 1 |
| `og_locale` | Share language | N | A | stranica | 1 |
| `twitter_card` | X and Twitter preview | N | A | stranica | 1 |
| `twitter_image` | X and Twitter image | N | A | stranica | 1 |
| `social_profiles` | Social profiles linked | N | R | stranica | 1 |

## Mobile

How the page behaves on the phone most of your visitors are using.

Težina u ukupnoj ocjeni: 6 od 100.

| Kod | Provjera | Ozb. | Popravka | Treba | Faza |
|---|---|---|---|---|---|
| `viewport_present` | Mobile viewport | K | A | stranica | 1 |
| `viewport_valid` | Viewport is correct | V | A | stranica | 1 |
| `viewport_zoom` | Zoom allowed | V | A | stranica | 1 |
| `fixed_width` | Nothing wider than the screen | V | R | stranica | 1 |
| `font_size_small` | Readable text size | N | R | stranica | 1 |
| `tap_targets` | Buttons are tappable | N | R | stranica | 1 |
| `theme_color` | Browser colour | N | A | stranica | 1 |
| `manifest` | Home screen support | N | A | stranica | 1 |

## Security and trust

Signals visitors and browsers use to decide whether to trust the site.

Težina u ukupnoj ocjeni: 4 od 100.

| Kod | Provjera | Ozb. | Popravka | Treba | Faza |
|---|---|---|---|---|---|
| `mixed_content` | No insecure resources | K | A | stranica | 1 |
| `hsts` | Strict transport security | N | A | headers | 1 |
| `x_content_type` | Content type respected | N | A | headers | 1 |
| `frame_protection` | Cannot be framed | N | A | headers | 1 |
| `csp_present` | Content security policy | N | R | headers | 1 |
| `referrer_policy` | Referrer policy | N | A | headers | 1 |
| `generator_exposed` | Software version hidden | N | A | stranica | 1 |
| `outdated_library` | Libraries are current | V | R | stranica | 1 |
| `server_header` | Server details hidden | N | A | headers | 1 |
| `cookies_secure` | Cookies protected | N | A | headers | 1 |

## Accessibility

Whether people using a screen reader or a keyboard can use the page.

Težina u ukupnoj ocjeni: 4 od 100.

| Kod | Provjera | Ozb. | Popravka | Treba | Faza |
|---|---|---|---|---|---|
| `a11y_lang` | Language for screen readers | V | A | stranica | 1 |
| `a11y_img_alt` | Images described | V | A | stranica | 1 |
| `a11y_form_labels` | Form fields labelled | V | A | stranica | 1 |
| `a11y_button_text` | Buttons have names | V | A | stranica | 1 |
| `a11y_link_purpose` | Links make sense alone | N | A | stranica | 1 |
| `a11y_heading_order` | Headings in order | N | A | stranica | 1 |
| `a11y_landmarks` | Page regions marked | N | R | stranica | 1 |
| `a11y_skip_link` | Skip to content | N | A | stranica | 1 |
| `a11y_tabindex` | Natural tab order | N | A | stranica | 1 |
| `a11y_autofocus` | No forced focus | N | A | stranica | 1 |
| `a11y_iframe_title` | Frames labelled | N | A | stranica | 1 |
| `a11y_table_headers` | Tables have headers | N | A | stranica | 1 |
| `a11y_contrast_inline` | Readable colours | N | R | stranica | 1 |
| `a11y_focus_visible` | Focus is visible | N | R | stranica | 1 |
