# Katalog provjera

Status: **potvrđeno 14.09.2026.** Zamjenjuje raniju listu od 40 provjera.

Ovaj dokument je **generisan iz koda**, iz `packages/shared/src/checks-catalog.ts`.
Ako se razlikuje od koda, kod je u pravu. Regeneriše se skriptom kad se katalog mijenja,
da ne bi odlutao kao što dokumentacija uvijek odluta.

Legenda ozbiljnosti: K kritično, V visoko, N nisko.
Legenda uticaja: `blokator`, `prikaz`, `kvalitet`, `higijena`. Objašnjeno niže.
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
Redoslijed prioriteta računa `prioritise()` u `packages/shared/src/score.ts`.

## Uticaj: šta provjera stvarno vrijedi

Ovo je nova kolona i ona mijenja redoslijed u izvještaju. Dokazi po oznaci su u
`docs/35-fix-effectiveness.md`, tabela u 1.1 i slojevi u završnom dijelu A.

Težina grupe kaže koliko jedna oblast vrijedi. Uticaj kaže koliko vrijedi **jedna
provjera**, i to nije isto pitanje. Grupa Page tags nosi i nedostajući naslov i naslov
napisan velikim slovima. Prvo je poluga, drugo je sitnica, a težina grupe ih izjednačava.

Četiri oznake:

| Oznaka | Značenje | Šta smijemo reći |
|---|---|---|
| `blokator` | Ako je pokvareno, stranica možda neće biti popuzana, indeksirana ni prikazana. Binarno. | "Ovo je moglo da vas košta sve." Jedina tvrdnja u proizvodu koja je i dramatična i istinita |
| `prikaz` | Mijenja kako stranica izgleda u rezultatima ili kad se podijeli. Pomjera klikove, ne poziciju. | "Utiče na to kako izgledate u rezultatima." Nikad "utiče na poziciju" |
| `kvalitet` | Stvarni faktor koji nije ni binaran ni poluga za klik: tanak i dupliran sadržaj, interni linkovi, brzina, signali povjerenja. | "Ovo Google mjeri, ali sporo i posredno" |
| `higijena` | Uredno, pristupačno, usklađeno, bez mjerljivog efekta na pretragu. | Prodaje se kao pristupačnost i urednost, **nikad kao SEO dobitak** |

Tražene su bile tri oznake: preduslov za indeksiranje, poluga za CTR, i kozmetika. Upisane
su četiri, i to je jedina izmjena u odnosu na traženo. Razlog je što bez četvrte oznake
tanak sadržaj, interni linkovi i Core Web Vitals padaju u kozmetiku, a to nisu: tanak i
dupliran sadržaj je jedini on-page faktor koji core update može ozbiljno kazniti, a
interni linkovi su jedina poluga autoriteta koju mali sajt uopšte kontroliše. Ako se
oznaka `kvalitet` ukine, te provjere idu u kozmetiku i izvještaj ih prestane isticati.

### Kako se raspoređuju

| Grupa | blokator | prikaz | kvalitet | higijena | Ukupno |
|---|---|---|---|---|---|
| Indexing | 16 | 0 | 1 | 11 | 28 |
| Page tags | 0 | 17 | 2 | 7 | 26 |
| Content | 0 | 0 | 15 | 11 | 26 |
| Structured data | 0 | 18 | 0 | 2 | 20 |
| Speed | 0 | 0 | 8 | 8 | 16 |
| Images and media | 0 | 1 | 5 | 9 | 15 |
| Social sharing | 0 | 11 | 0 | 2 | 13 |
| Mobile | 3 | 0 | 0 | 5 | 8 |
| Security and trust | 1 | 0 | 0 | 9 | 10 |
| Accessibility | 0 | 0 | 0 | 14 | 14 |
| **Ukupno** | **20** | **47** | **31** | **78** | **176** |

Dvadeset blokatora od 176. Istraživanje je procijenilo 10 do 15; kod nas ih je više jer
je kanonikal kod nas pet provjera a u istraživanju jedna rečenica. Raspored je ono što
treba gledati, ne tačan broj: **blokatora je malo i oni nose cijelu priču.**

Nekoliko oznaka koje iznenađuju, sa razlogom:

- **Alt tekst je `higijena`.** Za web pretragu vrijedi skoro ništa, za Google Images malo,
  za pristupačnost i pravnu usklađenost mnogo. Oznaka mjeri samo pretragu. Alt tekst i
  dalje radimo i dalje generišemo, samo ga ne prodajemo kao SEO.
- **Strukturirani podaci su `prikaz`, ne faktor rangiranja.** Google to sada kaže vrlo
  direktno. Vrijednost je uslovna: ako stranica dobije rich result, CTR može porasti; ako
  ne dobije, efekat je nula.
- **`faq_opportunity` je `higijena`**, jer Google ukida FAQ rich result. Provjera ostaje,
  ali prestaje biti prilika.
- **Cijela grupa Accessibility je `higijena`.** To ne znači da je nevažna, nego da nije
  SEO. Za pristupačnost imamo bolji argument od izmišljenog.
- **`favicon_present` je `prikaz`**, jer Google prikazuje favicon u mobilnim rezultatima.
  Jedina provjera iz grupe slika koja stvarno mijenja kako izgledate u pretrazi.

### Šta je oznaka promijenila u kodu

`prioritise()` je ranije sortirao po ozbiljnosti, pa težini grupe, pa popravljivosti. Sada
je prvi ključ **uticaj puta ozbiljnost**, pa tek onda težina grupe, popravljivost i
razlika između pada i upozorenja.

Množenje, ne sabiranje. Da se sabira, kozmetička `prikaz` sitnica bi nadjačala kritičan
`kvalitet` problem, što je ista greška u drugom ruhu. Ovako blokator koji je kritičan nosi
12, prikaz koji je kritičan 9, kvalitet koji je kritičan 6, a prikaz koji je sitnica 3.

Konkretno: `lorem_ipsum` (kritično, kvalitet) sada ide iznad `title_caps` (sitnica,
prikaz). Ranije je bilo obrnuto, jer Page tags nosi 18 a Content 14. `noindex` ide iznad
svega. `title_present` i dalje ide iznad `img_alt_present`. Sve tri stvari su testovi u
`packages/shared/src/__tests__/catalog.test.ts`.

**Ocjena se ovim nije mijenjala.** I dalje je ponderisani prosjek grupa. Promjena ocjene
po sloju, koju `35-fix-effectiveness.md` predlaže (blokatori oko 50 posto ocjene), je
zaseban posao i traži odluku, jer mijenja svaki broj koji smo ikom pokazali. Zapisano
ovdje da se ne izgubi.

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

| Grupa | Provjera | Kritičnih | Blokatora | Popravljivo | Težina u ocjeni |
|---|---|---|---|---|---|
| Indexing | 28 | 7 | 16 | 61% | 18 |
| Page tags | 26 | 3 | 0 | 96% | 18 |
| Content | 26 | 2 | 0 | 31% | 14 |
| Structured data | 20 | 3 | 0 | 95% | 12 |
| Speed | 16 | 0 | 0 | 31% | 10 |
| Images and media | 15 | 0 | 0 | 73% | 8 |
| Social sharing | 13 | 0 | 0 | 77% | 6 |
| Mobile | 8 | 1 | 3 | 63% | 6 |
| Security and trust | 10 | 1 | 1 | 80% | 4 |
| Accessibility | 14 | 0 | 0 | 79% | 4 |
| **Ukupno** | **176** | **17** | **20** | **68%** | **100** |

Kritično i blokator nisu isto, i zato stoje jedno pored drugog. Ozbiljnost kaže koliko je
loše kad provjera padne unutar svoje teme. Uticaj kaže vrijedi li ta tema pretrazi.
`lorem_ipsum` je kritično a nije blokator; `canonical_self` je upozorenje a jeste.

U widgetu faze 1 radi 174 od 176. Ostale traže crawl cijelog sajta i dolaze u fazi 3.

## Indexing

Whether search engines can reach this page and know it is the real one.

Težina u ukupnoj ocjeni: 18 od 100.

| Kod | Provjera | Ozb. | Uticaj | Popravka | Treba | Faza |
|---|---|---|---|---|---|---|
| `page_status` | Page loads | K | blokator | R | headers | 1 |
| `https_active` | Secure connection | K | blokator | R | headers | 1 |
| `https_redirect` | http sends to https | K | blokator | A | headers | 1 |
| `www_duplicate` | One address only | K | blokator | A | headers | 1 |
| `noindex` | Page may be indexed | K | blokator | R | stranica | 1 |
| `robots_header_noindex` | No noindex in headers | K | blokator | R | headers | 1 |
| `robots_blocks` | robots.txt allows this page | K | blokator | A | robots | 1 |
| `robots_exists` | robots.txt exists | V | higijena | A | robots | 1 |
| `robots_valid` | robots.txt is valid | V | blokator | A | robots | 1 |
| `robots_not_html` | robots.txt is a text file | V | higijena | A | robots | 1 |
| `sitemap_declared` | Sitemap is declared | V | higijena | A | robots | 1 |
| `sitemap_reachable` | Sitemap loads | V | higijena | A | sitemap | 1 |
| `sitemap_valid` | Sitemap is valid XML | V | higijena | A | sitemap | 1 |
| `canonical_present` | Canonical tag | V | blokator | A | stranica | 1 |
| `canonical_absolute` | Canonical is a full URL | V | blokator | A | stranica | 1 |
| `canonical_self` | Canonical points here | V | blokator | A | stranica | 1 |
| `canonical_single` | One canonical tag | V | blokator | A | stranica | 1 |
| `canonical_scheme` | Canonical matches the address | V | blokator | A | stranica | 1 |
| `redirect_chain` | Short path to the page | N | kvalitet | A | headers | 1 |
| `meta_refresh` | No meta refresh | V | blokator | A | stranica | 1 |
| `url_length` | Readable address | N | higijena | R | stranica | 1 |
| `url_params` | Clean address | N | higijena | R | stranica | 1 |
| `url_case` | Lowercase address | N | higijena | R | stranica | 1 |
| `url_underscores` | Words separated by dashes | N | higijena | R | stranica | 1 |
| `soft_404` | Not a disguised error | V | blokator | R | stranica | 1 |
| `amp_link` | No stale AMP link | N | higijena | R | stranica | 1 |
| `hreflang_return` | Language links point back | V | blokator | A | stranica | 3 |
| `pagination_tags` | Pagination is clean | N | higijena | R | stranica | 1 |

## Page tags

The words Google shows in results. This is where most clicks are won or lost.

Težina u ukupnoj ocjeni: 18 od 100.

| Kod | Provjera | Ozb. | Uticaj | Popravka | Treba | Faza |
|---|---|---|---|---|---|---|
| `title_present` | Title tag | K | prikaz | A | stranica | 1 |
| `title_length` | Title length | V | prikaz | A | stranica | 1 |
| `title_generic` | Title says something | V | prikaz | A | stranica | 1 |
| `title_brand_only` | Title is more than a name | V | prikaz | A | stranica | 1 |
| `title_keyword_stuffed` | Title reads naturally | V | prikaz | A | stranica | 1 |
| `title_single` | One title tag | V | prikaz | A | stranica | 1 |
| `title_caps` | Title is not shouting | N | prikaz | A | stranica | 1 |
| `title_separators` | Title is easy to read | N | prikaz | A | stranica | 1 |
| `meta_present` | Meta description | K | prikaz | A | stranica | 1 |
| `meta_length` | Description length | V | prikaz | A | stranica | 1 |
| `meta_generic` | Description says something | V | prikaz | A | stranica | 1 |
| `meta_duplicate_title` | Description adds to the title | N | prikaz | A | stranica | 1 |
| `meta_single` | One description | N | prikaz | A | stranica | 1 |
| `meta_keywords` | No meta keywords tag | N | higijena | A | stranica | 1 |
| `h1_present` | Main heading | K | prikaz | A | stranica | 1 |
| `h1_single` | One main heading | V | prikaz | A | stranica | 1 |
| `h1_not_empty` | Heading has text | V | prikaz | A | stranica | 1 |
| `h1_length` | Heading length | N | higijena | A | stranica | 1 |
| `h1_differs_title` | Heading adds to the title | N | prikaz | A | stranica | 1 |
| `heading_order` | Heading levels in order | N | higijena | A | stranica | 1 |
| `heading_not_empty` | No empty headings | N | higijena | A | stranica | 1 |
| `heading_count` | Content is broken up | N | kvalitet | R | stranica | 1 |
| `lang_declared` | Page language | V | higijena | A | stranica | 1 |
| `lang_matches` | Language matches the text | N | higijena | A | stranica | 1 |
| `charset_declared` | Character set | V | kvalitet | A | stranica | 1 |
| `charset_early` | Character set declared early | N | higijena | A | stranica | 1 |

## Content

Whether there is enough here to rank, and a clear way to get in touch.

Težina u ukupnoj ocjeni: 14 od 100.

| Kod | Provjera | Ozb. | Uticaj | Popravka | Treba | Faza |
|---|---|---|---|---|---|---|
| `word_count` | Enough content | V | kvalitet | R | stranica | 1 |
| `text_ratio` | Text to code ratio | N | higijena | R | stranica | 1 |
| `placeholder_text` | No placeholder text | K | kvalitet | R | stranica | 1 |
| `lorem_ipsum` | No dummy text | K | kvalitet | R | stranica | 1 |
| `coming_soon` | No unfinished sections | V | kvalitet | R | stranica | 1 |
| `duplicate_paragraphs` | No repeated blocks | N | kvalitet | R | stranica | 1 |
| `sentence_length` | Readable sentences | N | higijena | R | stranica | 1 |
| `contact_phone` | Phone number on the page | V | kvalitet | R | stranica | 1 |
| `phone_clickable` | Phone is tappable | V | higijena | A | stranica | 1 |
| `contact_email` | Email on the page | N | kvalitet | R | stranica | 1 |
| `email_clickable` | Email is clickable | N | higijena | A | stranica | 1 |
| `address_present` | Address on the page | V | kvalitet | R | stranica | 1 |
| `hours_present` | Opening hours | N | higijena | R | stranica | 1 |
| `cta_present` | A clear next step | V | kvalitet | R | stranica | 1 |
| `form_present` | A way to get in touch | N | higijena | R | stranica | 1 |
| `copyright_year` | Current year in footer | N | higijena | A | stranica | 1 |
| `links_have_text` | Links describe themselves | V | kvalitet | A | stranica | 1 |
| `link_text_generic` | Link text is useful | N | kvalitet | A | stranica | 1 |
| `links_not_empty` | No dead links | N | kvalitet | A | stranica | 1 |
| `external_links_safe` | Outbound links are safe | N | higijena | A | stranica | 1 |
| `internal_link_count` | Links to the rest of the site | N | kvalitet | R | stranica | 1 |
| `broken_internal_links` | Internal links work | V | kvalitet | A | probe | 3 |
| `mixed_language` | One language per page | N | higijena | R | stranica | 1 |
| `privacy_link` | Privacy policy linked | V | higijena | R | stranica | 1 |
| `terms_link` | Terms linked | N | higijena | R | stranica | 1 |
| `thin_boilerplate` | Content is specific | N | kvalitet | R | stranica | 1 |

## Structured data

What turns a plain result into one with hours, a map pin or a price.

Težina u ukupnoj ocjeni: 12 od 100.

| Kod | Provjera | Ozb. | Uticaj | Popravka | Treba | Faza |
|---|---|---|---|---|---|---|
| `jsonld_present` | Structured data | K | prikaz | A | stranica | 1 |
| `jsonld_parses` | Structured data is valid | K | prikaz | A | stranica | 1 |
| `jsonld_context` | Correct schema context | V | prikaz | A | stranica | 1 |
| `jsonld_type_known` | Recognised type | V | prikaz | A | stranica | 1 |
| `org_present` | Business identified | V | prikaz | A | stranica | 1 |
| `org_required` | Business details complete | V | prikaz | A | stranica | 1 |
| `localbusiness_address` | Address in markup | V | prikaz | A | stranica | 1 |
| `localbusiness_phone` | Phone in markup | N | prikaz | A | stranica | 1 |
| `localbusiness_hours` | Opening hours in markup | N | prikaz | A | stranica | 1 |
| `localbusiness_geo` | Map position | N | prikaz | A | stranica | 1 |
| `breadcrumb_present` | Breadcrumbs | N | prikaz | A | stranica | 1 |
| `website_schema` | Site identified | N | prikaz | A | stranica | 1 |
| `product_offers` | Price in markup | V | prikaz | A | stranica | 1 |
| `product_availability` | Stock status in markup | N | prikaz | A | stranica | 1 |
| `article_dates` | Article dates | N | prikaz | A | stranica | 1 |
| `faq_opportunity` | FAQ markup | N | higijena | A | stranica | 1 |
| `sameas_links` | Social profiles linked | N | prikaz | A | stranica | 1 |
| `rating_unsupported` | No invented ratings | K | prikaz | R | stranica | 1 |
| `schema_duplicate` | No duplicate markup | N | prikaz | A | stranica | 1 |
| `microdata_only` | Modern markup format | N | higijena | A | stranica | 1 |

## Speed

How quickly the page starts showing something useful.

Težina u ukupnoj ocjeni: 10 od 100.

| Kod | Provjera | Ozb. | Uticaj | Popravka | Treba | Faza |
|---|---|---|---|---|---|---|
| `ttfb` | Server response time | V | kvalitet | R | headers | 1 |
| `html_size` | Page weight | V | kvalitet | R | stranica | 1 |
| `compression` | Compression on | V | kvalitet | A | headers | 1 |
| `cache_headers` | Caching set | V | kvalitet | A | headers | 1 |
| `http_version` | Modern connection | N | higijena | R | headers | 1 |
| `render_blocking_js` | Scripts do not block drawing | V | kvalitet | A | stranica | 1 |
| `render_blocking_css` | Stylesheets are lean | V | kvalitet | R | stranica | 1 |
| `script_count` | Number of scripts | N | higijena | R | stranica | 1 |
| `third_party_scripts` | Third party weight | V | kvalitet | R | stranica | 1 |
| `inline_styles` | Styles are in files | N | higijena | R | stranica | 1 |
| `preconnect` | Outside connections warmed up | N | higijena | A | stranica | 1 |
| `font_display` | Text shows while fonts load | N | higijena | A | stranica | 1 |
| `font_count` | Number of web fonts | N | higijena | R | stranica | 1 |
| `third_party_fonts` | Fonts served from here | N | higijena | R | stranica | 1 |
| `dom_size` | Page complexity | N | higijena | R | stranica | 1 |
| `redirect_cost` | No wasted round trips | N | kvalitet | R | headers | 1 |

## Images and media

Images that load fast and that search engines can understand.

Težina u ukupnoj ocjeni: 8 od 100.

| Kod | Provjera | Ozb. | Uticaj | Popravka | Treba | Faza |
|---|---|---|---|---|---|---|
| `img_alt_present` | Image alt text | V | higijena | A | stranica | 1 |
| `img_alt_filename` | Alt text is real | N | higijena | A | stranica | 1 |
| `img_alt_length` | Alt text is concise | N | higijena | A | stranica | 1 |
| `img_alt_stuffed` | Alt text reads naturally | N | higijena | A | stranica | 1 |
| `img_dimensions` | Images reserve their space | V | kvalitet | A | stranica | 1 |
| `img_lazy` | Images load when needed | N | kvalitet | A | stranica | 1 |
| `img_modern_format` | Modern image formats | N | kvalitet | R | stranica | 1 |
| `img_srcset` | Right size per device | N | kvalitet | R | stranica | 1 |
| `img_count` | Sensible number of images | N | higijena | R | stranica | 1 |
| `img_inline_background` | Images are real images | N | higijena | R | stranica | 1 |
| `favicon_present` | Site icon | N | prikaz | A | stranica | 1 |
| `apple_icon` | Icon for phone home screens | N | higijena | A | stranica | 1 |
| `video_title` | Video has a title | N | higijena | A | stranica | 1 |
| `iframe_lazy` | Embeds load when needed | N | kvalitet | A | stranica | 1 |
| `svg_accessible` | Icons are labelled | N | higijena | A | stranica | 1 |

## Social sharing

What the page looks like when somebody shares the link.

Težina u ukupnoj ocjeni: 6 od 100.

| Kod | Provjera | Ozb. | Uticaj | Popravka | Treba | Faza |
|---|---|---|---|---|---|---|
| `og_title` | Share title | V | prikaz | A | stranica | 1 |
| `og_description` | Share description | V | prikaz | A | stranica | 1 |
| `og_image` | Share image | V | prikaz | A | stranica | 1 |
| `og_image_absolute` | Share image address | V | prikaz | A | stranica | 1 |
| `og_image_size` | Share image size | N | prikaz | R | probe | 1 |
| `og_image_loads` | Share image exists | V | prikaz | R | probe | 1 |
| `og_url` | Share address | N | prikaz | A | stranica | 1 |
| `og_type` | Share type | N | prikaz | A | stranica | 1 |
| `og_site_name` | Site name in shares | N | prikaz | A | stranica | 1 |
| `og_locale` | Share language | N | higijena | A | stranica | 1 |
| `twitter_card` | X and Twitter preview | N | prikaz | A | stranica | 1 |
| `twitter_image` | X and Twitter image | N | prikaz | A | stranica | 1 |
| `social_profiles` | Social profiles linked | N | higijena | R | stranica | 1 |

## Mobile

How the page behaves on the phone most of your visitors are using.

Težina u ukupnoj ocjeni: 6 od 100.

| Kod | Provjera | Ozb. | Uticaj | Popravka | Treba | Faza |
|---|---|---|---|---|---|---|
| `viewport_present` | Mobile viewport | K | blokator | A | stranica | 1 |
| `viewport_valid` | Viewport is correct | V | blokator | A | stranica | 1 |
| `viewport_zoom` | Zoom allowed | V | higijena | A | stranica | 1 |
| `fixed_width` | Nothing wider than the screen | V | blokator | R | stranica | 1 |
| `font_size_small` | Readable text size | N | higijena | R | stranica | 1 |
| `tap_targets` | Buttons are tappable | N | higijena | R | stranica | 1 |
| `theme_color` | Browser colour | N | higijena | A | stranica | 1 |
| `manifest` | Home screen support | N | higijena | A | stranica | 1 |

## Security and trust

Signals visitors and browsers use to decide whether to trust the site.

Težina u ukupnoj ocjeni: 4 od 100.

| Kod | Provjera | Ozb. | Uticaj | Popravka | Treba | Faza |
|---|---|---|---|---|---|---|
| `mixed_content` | No insecure resources | K | blokator | A | stranica | 1 |
| `hsts` | Strict transport security | N | higijena | A | headers | 1 |
| `x_content_type` | Content type respected | N | higijena | A | headers | 1 |
| `frame_protection` | Cannot be framed | N | higijena | A | headers | 1 |
| `csp_present` | Content security policy | N | higijena | R | headers | 1 |
| `referrer_policy` | Referrer policy | N | higijena | A | headers | 1 |
| `generator_exposed` | Software version hidden | N | higijena | A | stranica | 1 |
| `outdated_library` | Libraries are current | V | higijena | R | stranica | 1 |
| `server_header` | Server details hidden | N | higijena | A | headers | 1 |
| `cookies_secure` | Cookies protected | N | higijena | A | headers | 1 |

## Accessibility

Whether people using a screen reader or a keyboard can use the page.

Težina u ukupnoj ocjeni: 4 od 100.

| Kod | Provjera | Ozb. | Uticaj | Popravka | Treba | Faza |
|---|---|---|---|---|---|---|
| `a11y_lang` | Language for screen readers | V | higijena | A | stranica | 1 |
| `a11y_img_alt` | Images described | V | higijena | A | stranica | 1 |
| `a11y_form_labels` | Form fields labelled | V | higijena | A | stranica | 1 |
| `a11y_button_text` | Buttons have names | V | higijena | A | stranica | 1 |
| `a11y_link_purpose` | Links make sense alone | N | higijena | A | stranica | 1 |
| `a11y_heading_order` | Headings in order | N | higijena | A | stranica | 1 |
| `a11y_landmarks` | Page regions marked | N | higijena | R | stranica | 1 |
| `a11y_skip_link` | Skip to content | N | higijena | A | stranica | 1 |
| `a11y_tabindex` | Natural tab order | N | higijena | A | stranica | 1 |
| `a11y_autofocus` | No forced focus | N | higijena | A | stranica | 1 |
| `a11y_iframe_title` | Frames labelled | N | higijena | A | stranica | 1 |
| `a11y_table_headers` | Tables have headers | N | higijena | A | stranica | 1 |
| `a11y_contrast_inline` | Readable colours | N | higijena | R | stranica | 1 |
| `a11y_focus_visible` | Focus is visible | N | higijena | R | stranica | 1 |
