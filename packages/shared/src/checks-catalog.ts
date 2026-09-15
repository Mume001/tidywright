import type { CheckGroup, CheckImpact, Severity } from './types'

/**
 * The check catalogue. docs/05-checks.md.
 *
 * This list is the contract between packages/checks (which implements each one),
 * the report (which labels them), the score (which weights them) and the fix
 * generator (which knows which ones it can repair). Adding a check means a row
 * here, an implementation, and a test. Nothing else.
 *
 * `needs` says what the runner must have fetched before the check can run. It is
 * what lets one audit decide, up front, exactly how many requests it will make to
 * somebody else's server.
 *
 *   html      the parsed document, which we always have
 *   headers   the response headers of that same request
 *   robots    /robots.txt, one extra request, cached per host for an hour
 *   sitemap   the sitemap head, one extra request
 *   probe     a HEAD to one resource named in the page, for example og:image
 *   render    the page opened in a real browser, only for pages with no static text
 *   crawl     the whole site, which means phase 3
 */
export interface CheckDefinition {
  code: string
  group: CheckGroup
  severity: Severity
  /** Row title in the report. Written for the visitor, not for a developer. */
  title: string
  /** One sentence the business owner understands, used when the check fails. */
  failText: string
  /** Can we generate the corrected value, or only report the problem. */
  fixable: boolean
  needs: ('html' | 'headers' | 'robots' | 'sitemap' | 'probe' | 'render' | 'crawl')[]
  /** 1 runs in the widget today. 3 needs the full site crawl. */
  phase: 1 | 3
  /** What it is worth to search. Attached from CHECK_IMPACT, never typed twice. */
  impact: CheckImpact
}

/** A row as it is written below, before the impact table is joined onto it. */
type CheckSpec = Omit<CheckDefinition, 'impact'>

const def = (
  code: string,
  group: CheckGroup,
  severity: Severity,
  title: string,
  failText: string,
  fixable: boolean,
  needs: CheckDefinition['needs'] = ['html'],
  phase: 1 | 3 = 1,
): CheckSpec => ({ code, group, severity, title, failText, fixable, needs, phase })

// ---------------------------------------------------------------------------
// 1. Indexing. Can a search engine reach this page, read it, and know it is the
//    one true copy. Everything else is worthless if this fails.
// ---------------------------------------------------------------------------
const INDEXING: CheckSpec[] = [
  def(
    'page_status',
    'indexing',
    'critical',
    'Page loads',
    'The page did not return a normal 200 response.',
    false,
    ['html', 'headers'],
  ),
  def(
    'https_active',
    'indexing',
    'critical',
    'Secure connection',
    'The page is served over plain http, so browsers mark it as not secure.',
    false,
    ['headers'],
  ),
  def(
    'https_redirect',
    'indexing',
    'critical',
    'http sends to https',
    'The insecure address does not redirect to the secure one, so both versions exist.',
    true,
    ['headers'],
  ),
  def(
    'www_duplicate',
    'indexing',
    'critical',
    'One address only',
    'The site answers on both the www and the non-www address, so Google sees two copies of everything.',
    true,
    ['headers'],
  ),
  def(
    'noindex',
    'indexing',
    'critical',
    'Page may be indexed',
    'This page tells search engines not to index it, so it can never appear in results.',
    false,
  ),
  def(
    'robots_header_noindex',
    'indexing',
    'critical',
    'No noindex in headers',
    'The server sends an X-Robots-Tag that hides this page from search engines.',
    false,
    ['headers'],
  ),
  def(
    'robots_blocks',
    'indexing',
    'critical',
    'robots.txt allows this page',
    'robots.txt blocks this page, so search engines are told not to read it at all.',
    true,
    ['robots'],
  ),
  def(
    'robots_exists',
    'indexing',
    'warning',
    'robots.txt exists',
    'There is no robots.txt, so crawlers get no guidance and no sitemap pointer.',
    true,
    ['robots'],
  ),
  def(
    'robots_valid',
    'indexing',
    'warning',
    'robots.txt is valid',
    'robots.txt has lines search engines cannot parse, so some rules are ignored.',
    true,
    ['robots'],
  ),
  def(
    'robots_not_html',
    'indexing',
    'warning',
    'robots.txt is a text file',
    'robots.txt returns an HTML page instead of plain text, which crawlers treat as broken.',
    true,
    ['robots'],
  ),
  def(
    'sitemap_declared',
    'indexing',
    'warning',
    'Sitemap is declared',
    'robots.txt does not point to a sitemap, so crawlers have to guess which pages exist.',
    true,
    ['robots'],
  ),
  def(
    'sitemap_reachable',
    'indexing',
    'warning',
    'Sitemap loads',
    'The declared sitemap does not load, so search engines get an error instead of your page list.',
    true,
    ['sitemap'],
  ),
  def(
    'sitemap_valid',
    'indexing',
    'warning',
    'Sitemap is valid XML',
    'The sitemap is not valid XML, so search engines discard it.',
    true,
    ['sitemap'],
  ),
  def(
    'canonical_present',
    'indexing',
    'warning',
    'Canonical tag',
    'There is no canonical tag telling Google which address is the real one for this page.',
    true,
  ),
  def(
    'canonical_absolute',
    'indexing',
    'warning',
    'Canonical is a full URL',
    'The canonical tag uses a shortened path. Google expects a full address and may ignore it.',
    true,
  ),
  def(
    'canonical_self',
    'indexing',
    'warning',
    'Canonical points here',
    'The canonical tag points at a different page, which tells Google not to index this one.',
    true,
  ),
  def(
    'canonical_single',
    'indexing',
    'warning',
    'One canonical tag',
    'There is more than one canonical tag, so Google ignores all of them.',
    true,
  ),
  def(
    'canonical_scheme',
    'indexing',
    'warning',
    'Canonical matches the address',
    'The canonical tag uses a different protocol or host than the page it sits on.',
    true,
  ),
  def(
    'redirect_chain',
    'indexing',
    'notice',
    'Short path to the page',
    'Reaching this page takes more than two redirects, which wastes crawl budget and slows visitors.',
    true,
    ['headers'],
  ),
  def(
    'meta_refresh',
    'indexing',
    'warning',
    'No meta refresh',
    'The page uses a meta refresh redirect, which search engines handle badly and users find jarring.',
    true,
  ),
  def(
    'url_length',
    'indexing',
    'notice',
    'Readable address',
    'The address is very long, which looks untrustworthy when shared and gets cut in results.',
    false,
  ),
  def(
    'url_params',
    'indexing',
    'notice',
    'Clean address',
    'The address carries tracking or session parameters, which creates duplicate versions of the page.',
    false,
  ),
  def(
    'url_case',
    'indexing',
    'notice',
    'Lowercase address',
    'The address mixes upper and lower case, which some servers treat as two different pages.',
    false,
  ),
  def(
    'url_underscores',
    'indexing',
    'notice',
    'Words separated by dashes',
    'The address separates words with underscores. Search engines read dashes as word breaks, underscores not.',
    false,
  ),
  def(
    'soft_404',
    'indexing',
    'warning',
    'Not a disguised error',
    'The page returns a success code but its content reads like a not found page.',
    false,
  ),
  def(
    'amp_link',
    'indexing',
    'notice',
    'No stale AMP link',
    'The page links to an AMP version. AMP no longer gives any ranking benefit and adds a copy to maintain.',
    false,
  ),
  def(
    'hreflang_return',
    'indexing',
    'warning',
    'Language links point back',
    'A language version is declared without a matching link back, so search engines ignore the whole set.',
    true,
    ['html'],
    3,
  ),
  def(
    'pagination_tags',
    'indexing',
    'notice',
    'Pagination is clean',
    'The page uses rel next and previous tags, which Google stopped using and which can confuse other engines.',
    false,
  ),
]

// ---------------------------------------------------------------------------
// 2. Page tags. The words Google shows in results. This is where most small
//    sites lose their clicks, and where our fixes do the most obvious good.
// ---------------------------------------------------------------------------
const TAGS: CheckSpec[] = [
  def(
    'title_present',
    'tags',
    'critical',
    'Title tag',
    'The page has no title tag, so Google invents one from whatever text it finds.',
    true,
  ),
  def(
    'title_length',
    'tags',
    'warning',
    'Title length',
    'The title is too short or too long to show in full, so results cut it off mid word.',
    true,
  ),
  def(
    'title_generic',
    'tags',
    'warning',
    'Title says something',
    'The title is generic, like Home or the theme name, and tells nobody what this page offers.',
    true,
  ),
  def(
    'title_brand_only',
    'tags',
    'warning',
    'Title is more than a name',
    'The title is only the business name. Nobody searches for a name they do not know yet.',
    true,
  ),
  def(
    'title_keyword_stuffed',
    'tags',
    'warning',
    'Title reads naturally',
    'The title repeats the same words, which reads as spam to both people and search engines.',
    true,
  ),
  def(
    'title_single',
    'tags',
    'warning',
    'One title tag',
    'There is more than one title tag, and search engines pick unpredictably between them.',
    true,
  ),
  def(
    'title_caps',
    'tags',
    'notice',
    'Title is not shouting',
    'The title is in capitals, which looks like spam in results.',
    true,
  ),
  def(
    'title_separators',
    'tags',
    'notice',
    'Title is easy to read',
    'The title uses several separators in a row, which makes it hard to scan in results.',
    true,
  ),
  def(
    'meta_present',
    'tags',
    'critical',
    'Meta description',
    'There is no description, so Google picks random sentences from the page instead.',
    true,
  ),
  def(
    'meta_length',
    'tags',
    'warning',
    'Description length',
    'The description is longer than results will show, so the ending is cut off.',
    true,
  ),
  def(
    'meta_generic',
    'tags',
    'warning',
    'Description says something',
    'The description is filler and gives nobody a reason to click.',
    true,
  ),
  def(
    'meta_duplicate_title',
    'tags',
    'notice',
    'Description adds to the title',
    'The description repeats the title word for word, wasting the second line in results.',
    true,
  ),
  def(
    'meta_single',
    'tags',
    'notice',
    'One description',
    'There is more than one description tag, so search engines choose unpredictably.',
    true,
  ),
  def(
    'meta_keywords',
    'tags',
    'notice',
    'No meta keywords tag',
    'The page uses the meta keywords tag, which no search engine has used for over a decade and which signals an outdated site.',
    true,
  ),
  def(
    'h1_present',
    'tags',
    'critical',
    'Main heading',
    'The page has no main heading, so neither readers nor search engines know what it is about.',
    true,
  ),
  def(
    'h1_single',
    'tags',
    'warning',
    'One main heading',
    'The page has more than one main heading, so none of them stands out as the subject.',
    true,
  ),
  def(
    'h1_not_empty',
    'tags',
    'warning',
    'Heading has text',
    'The main heading is empty or holds only an image, so it says nothing.',
    true,
  ),
  def(
    'h1_length',
    'tags',
    'notice',
    'Heading length',
    'The main heading is very long, which reads as a paragraph rather than a title.',
    true,
  ),
  def(
    'h1_differs_title',
    'tags',
    'notice',
    'Heading adds to the title',
    'The heading and the title are identical, so the page repeats itself instead of saying two useful things.',
    true,
  ),
  def(
    'heading_order',
    'tags',
    'notice',
    'Heading levels in order',
    'Heading levels skip a step, for example straight from H2 to H4, which breaks the outline.',
    true,
  ),
  def(
    'heading_not_empty',
    'tags',
    'notice',
    'No empty headings',
    'The page has headings with no text in them, usually left over from a theme.',
    true,
  ),
  def(
    'heading_count',
    'tags',
    'notice',
    'Content is broken up',
    'A long page with no subheadings is a wall of text that people scroll past.',
    false,
  ),
  def(
    'lang_declared',
    'tags',
    'warning',
    'Page language',
    'The html lang attribute is missing, so browsers and screen readers guess the language.',
    true,
  ),
  def(
    'lang_matches',
    'tags',
    'notice',
    'Language matches the text',
    'The declared language does not match the text on the page.',
    true,
  ),
  def(
    'charset_declared',
    'tags',
    'warning',
    'Character set',
    'No character set is declared, which is how accented letters turn into question marks.',
    true,
  ),
  def(
    'charset_early',
    'tags',
    'notice',
    'Character set declared early',
    'The character set is declared late in the head, after the browser has already started guessing.',
    true,
  ),
]

// ---------------------------------------------------------------------------
// 3. Structured data. What turns a plain result into one with stars, hours, a
//    map pin or a price. The single biggest untapped item on small sites.
// ---------------------------------------------------------------------------
const SCHEMA: CheckSpec[] = [
  def(
    'jsonld_present',
    'structured_data',
    'critical',
    'Structured data',
    'There is no structured data, so this business cannot appear with hours, a map pin or a price in results.',
    true,
  ),
  def(
    'jsonld_parses',
    'structured_data',
    'critical',
    'Structured data is valid',
    'The structured data on the page is not valid JSON, so search engines discard all of it.',
    true,
  ),
  def(
    'jsonld_context',
    'structured_data',
    'warning',
    'Correct schema context',
    'The structured data does not declare schema.org, so search engines cannot interpret it.',
    true,
  ),
  def(
    'jsonld_type_known',
    'structured_data',
    'warning',
    'Recognised type',
    'The structured data uses a type search engines do not recognise.',
    true,
  ),
  def(
    'org_present',
    'structured_data',
    'warning',
    'Business identified',
    'Nothing on the page tells search engines this is a business with a name and a website.',
    true,
  ),
  def(
    'org_required',
    'structured_data',
    'warning',
    'Business details complete',
    'The business markup is missing a name or a website address, so it is ignored.',
    true,
  ),
  def(
    'localbusiness_address',
    'structured_data',
    'warning',
    'Address in markup',
    'The business is marked as local but carries no address, which is what local results need.',
    true,
  ),
  def(
    'localbusiness_phone',
    'structured_data',
    'notice',
    'Phone in markup',
    'No phone number is marked up, so it cannot show as a call button in results.',
    true,
  ),
  def(
    'localbusiness_hours',
    'structured_data',
    'notice',
    'Opening hours in markup',
    'No opening hours are marked up, so results cannot show whether you are open now.',
    true,
  ),
  def(
    'localbusiness_geo',
    'structured_data',
    'notice',
    'Map position',
    'No coordinates are marked up, which helps map placement for businesses with a hard to find entrance.',
    true,
  ),
  def(
    'breadcrumb_present',
    'structured_data',
    'notice',
    'Breadcrumbs',
    'Deeper pages have no breadcrumb markup, so results show a bare address instead of a path.',
    true,
  ),
  def(
    'website_schema',
    'structured_data',
    'notice',
    'Site identified',
    'The site is not marked up as a website, which is what enables the site name in results.',
    true,
  ),
  def(
    'product_offers',
    'structured_data',
    'warning',
    'Price in markup',
    'A product page has no price marked up, so it cannot show a price in results.',
    true,
  ),
  def(
    'product_availability',
    'structured_data',
    'notice',
    'Stock status in markup',
    'A product page does not say whether the item is in stock.',
    true,
  ),
  def(
    'article_dates',
    'structured_data',
    'notice',
    'Article dates',
    'An article has no published date marked up, so results cannot show how fresh it is.',
    true,
  ),
  def(
    'faq_opportunity',
    'structured_data',
    'notice',
    'FAQ markup',
    'The page has a question and answer section that is not marked up, so it misses the expandable result format.',
    true,
  ),
  def(
    'sameas_links',
    'structured_data',
    'notice',
    'Social profiles linked',
    'Your social profiles are not connected to the business markup, which weakens the knowledge panel.',
    true,
  ),
  def(
    'rating_unsupported',
    'structured_data',
    'critical',
    'No invented ratings',
    'The page claims a star rating with no reviews behind it, which is a manual penalty from Google.',
    false,
  ),
  def(
    'schema_duplicate',
    'structured_data',
    'notice',
    'No duplicate markup',
    'The same type is declared more than once, which sends search engines conflicting information.',
    true,
  ),
  def(
    'microdata_only',
    'structured_data',
    'notice',
    'Modern markup format',
    'The page uses an older markup format that Google reads but no longer prefers.',
    true,
  ),
]

// ---------------------------------------------------------------------------
// 4. Content. Whether there is anything here worth ranking, and whether a
//    visitor can act on it.
// ---------------------------------------------------------------------------
const CONTENT: CheckSpec[] = [
  def(
    'word_count',
    'content',
    'warning',
    'Enough content',
    'The page has very little text, which gives search engines almost nothing to rank it on.',
    false,
  ),
  def(
    'text_ratio',
    'content',
    'notice',
    'Text to code ratio',
    'The page is mostly markup with little readable text, which usually means a heavy theme.',
    false,
  ),
  def(
    'placeholder_text',
    'content',
    'critical',
    'No placeholder text',
    'The page still contains template placeholder text that was never replaced.',
    false,
  ),
  def(
    'lorem_ipsum',
    'content',
    'critical',
    'No dummy text',
    'The page contains lorem ipsum dummy text, which is live on your site right now.',
    false,
  ),
  def(
    'coming_soon',
    'content',
    'warning',
    'No unfinished sections',
    'The page says coming soon or under construction, which tells visitors to come back later and they do not.',
    false,
  ),
  def(
    'duplicate_paragraphs',
    'content',
    'notice',
    'No repeated blocks',
    'The same paragraph appears more than once on the page.',
    false,
  ),
  def(
    'sentence_length',
    'content',
    'notice',
    'Readable sentences',
    'Sentences are long enough that most readers lose the thread, which raises the bounce rate.',
    false,
  ),
  def(
    'contact_phone',
    'content',
    'warning',
    'Phone number on the page',
    'No phone number appears anywhere, which is the first thing a local visitor looks for.',
    false,
  ),
  def(
    'phone_clickable',
    'content',
    'warning',
    'Phone is tappable',
    'The phone number is plain text, so a phone visitor has to copy it by hand instead of tapping to call.',
    true,
  ),
  def(
    'contact_email',
    'content',
    'notice',
    'Email on the page',
    'No email address appears anywhere on the page.',
    false,
  ),
  def(
    'email_clickable',
    'content',
    'notice',
    'Email is clickable',
    'The email address is plain text rather than a link that opens a mail app.',
    true,
  ),
  def(
    'address_present',
    'content',
    'warning',
    'Address on the page',
    'No street address appears, which local search needs and which visitors use to judge whether you are nearby.',
    false,
  ),
  def(
    'hours_present',
    'content',
    'notice',
    'Opening hours',
    'Opening hours are not stated, so visitors do not know when they can come or call.',
    false,
  ),
  def(
    'cta_present',
    'content',
    'warning',
    'A clear next step',
    'The page offers no obvious action to take, so interested visitors leave without contacting you.',
    false,
  ),
  def(
    'form_present',
    'content',
    'notice',
    'A way to get in touch',
    'There is no contact form on the page, so getting in touch takes more effort than it should.',
    false,
  ),
  def(
    'copyright_year',
    'content',
    'notice',
    'Current year in footer',
    'The footer shows an old year, which makes the site look abandoned.',
    true,
  ),
  def(
    'links_have_text',
    'content',
    'warning',
    'Links describe themselves',
    'Some links have no text at all, so neither visitors nor search engines know where they lead.',
    true,
  ),
  def(
    'link_text_generic',
    'content',
    'notice',
    'Link text is useful',
    'Links say click here or read more, which tells nobody what is on the other side.',
    true,
  ),
  def(
    'links_not_empty',
    'content',
    'notice',
    'No dead links',
    'Some links point nowhere, usually a leftover hash or an empty address.',
    true,
  ),
  def(
    'external_links_safe',
    'content',
    'notice',
    'Outbound links are safe',
    'Links that open in a new tab lack the protection attribute, which is a known security weakness.',
    true,
  ),
  def(
    'internal_link_count',
    'content',
    'notice',
    'Links to the rest of the site',
    'The page barely links anywhere else, so visitors and crawlers reach a dead end.',
    false,
  ),
  def(
    'broken_internal_links',
    'content',
    'warning',
    'Internal links work',
    'Links on this page lead to pages that do not exist.',
    true,
    ['probe'],
    3,
  ),
  def(
    'mixed_language',
    'content',
    'notice',
    'One language per page',
    'Two languages appear on the same page, which confuses both readers and search engines.',
    false,
  ),
  def(
    'privacy_link',
    'content',
    'warning',
    'Privacy policy linked',
    'There is no link to a privacy policy, which most privacy laws require once you collect anything.',
    false,
  ),
  def(
    'terms_link',
    'content',
    'notice',
    'Terms linked',
    'There is no link to terms or conditions, which visitors look for before paying or booking anything.',
    false,
  ),
  def(
    'thin_boilerplate',
    'content',
    'notice',
    'Content is specific',
    'Most of the text is generic filler that could sit on any competitor site.',
    false,
  ),
]

// ---------------------------------------------------------------------------
// 5. Images and media. The easiest wins on almost every site, and the ones a
//    client can see the result of immediately.
// ---------------------------------------------------------------------------
const MEDIA: CheckSpec[] = [
  def(
    'img_alt_present',
    'media',
    'warning',
    'Image alt text',
    'Images have no alt text, so search engines and screen readers cannot tell what they show.',
    true,
  ),
  def(
    'img_alt_filename',
    'media',
    'notice',
    'Alt text is real',
    'Some alt text is just the file name, like IMG_2831.jpg, which helps nobody.',
    true,
  ),
  def(
    'img_alt_length',
    'media',
    'notice',
    'Alt text is concise',
    'Some alt text runs to a paragraph, which screen readers read out in full.',
    true,
  ),
  def(
    'img_alt_stuffed',
    'media',
    'notice',
    'Alt text reads naturally',
    'Alt text repeats the same keywords, which search engines treat as spam.',
    true,
  ),
  def(
    'img_dimensions',
    'media',
    'warning',
    'Images reserve their space',
    'Images have no width and height set, so the page jumps around while it loads.',
    true,
  ),
  def(
    'img_lazy',
    'media',
    'notice',
    'Images load when needed',
    'Images below the fold load immediately, which slows the first view for no benefit.',
    true,
  ),
  def(
    'img_modern_format',
    'media',
    'notice',
    'Modern image formats',
    'Images are in older formats. WebP or AVIF would cut their weight by half at the same quality.',
    false,
  ),
  def(
    'img_srcset',
    'media',
    'notice',
    'Right size per device',
    'Images have no responsive sizes, so phones download the desktop version.',
    false,
  ),
  def(
    'img_count',
    'media',
    'notice',
    'Sensible number of images',
    'The page loads a very large number of images, which is usually a slideshow nobody scrolls through.',
    false,
  ),
  def(
    'img_inline_background',
    'media',
    'notice',
    'Images are real images',
    'Key images are CSS backgrounds, which search engines cannot see and screen readers cannot read.',
    false,
  ),
  def(
    'favicon_present',
    'media',
    'notice',
    'Site icon',
    'There is no site icon, so the browser tab and bookmarks show a blank page symbol.',
    true,
  ),
  def(
    'apple_icon',
    'media',
    'notice',
    'Icon for phone home screens',
    'No icon is set for visitors who add the site to a phone home screen.',
    true,
  ),
  def(
    'video_title',
    'media',
    'notice',
    'Video has a title',
    'An embedded video frame has no title, which screen readers announce as unlabelled frame.',
    true,
  ),
  def(
    'iframe_lazy',
    'media',
    'notice',
    'Embeds load when needed',
    'Embedded maps or videos load immediately and can add seconds to the first view.',
    true,
  ),
  def(
    'svg_accessible',
    'media',
    'notice',
    'Icons are labelled',
    'Inline icons carry no label, so screen readers either skip them or read the raw code.',
    true,
  ),
]

// ---------------------------------------------------------------------------
// 6. Social sharing. What the page looks like when somebody pastes it into
//    WhatsApp, Facebook or Slack. Cheap to fix, visible to the client at once.
// ---------------------------------------------------------------------------
const SOCIAL: CheckSpec[] = [
  def(
    'og_title',
    'social',
    'warning',
    'Share title',
    'Shared links have no title set, so the address shows instead of a headline.',
    true,
  ),
  def(
    'og_description',
    'social',
    'warning',
    'Share description',
    'Shared links have no description, so the preview is a bare link.',
    true,
  ),
  def(
    'og_image',
    'social',
    'warning',
    'Share image',
    'Shared links have no image, so the preview is a grey box that nobody clicks.',
    true,
  ),
  def(
    'og_image_absolute',
    'social',
    'warning',
    'Share image address',
    'The share image uses a shortened path, which most platforms cannot resolve.',
    true,
  ),
  def(
    'og_image_size',
    'social',
    'notice',
    'Share image size',
    'The share image is small or square, so it is cropped badly or shown as a thumbnail.',
    false,
    ['probe'],
  ),
  def(
    'og_image_loads',
    'social',
    'warning',
    'Share image exists',
    'The share image address returns an error, so previews fall back to nothing.',
    false,
    ['probe'],
  ),
  def(
    'og_url',
    'social',
    'notice',
    'Share address',
    'No canonical share address is set, so shares from tracking links split your counts.',
    true,
  ),
  def(
    'og_type',
    'social',
    'notice',
    'Share type',
    'No content type is set for sharing, so platforms guess at the layout.',
    true,
  ),
  def(
    'og_site_name',
    'social',
    'notice',
    'Site name in shares',
    'The site name is not set, so previews show the bare domain.',
    true,
  ),
  def(
    'og_locale',
    'social',
    'notice',
    'Share language',
    'No language is declared for sharing, which matters for sites with more than one.',
    true,
  ),
  def(
    'twitter_card',
    'social',
    'notice',
    'X and Twitter preview',
    'No card type is set, so links there show as plain text rather than a preview.',
    true,
  ),
  def(
    'twitter_image',
    'social',
    'notice',
    'X and Twitter image',
    'No image is set for that platform, so it falls back or shows nothing.',
    true,
  ),
  def(
    'social_profiles',
    'social',
    'notice',
    'Social profiles linked',
    'The page links to no social profiles, which is a trust signal visitors look for.',
    false,
  ),
]

// ---------------------------------------------------------------------------
// 7. Speed. Everything here is read from the HTML and the response headers of
//    the one request we already made. No PageSpeed call, no extra wait, and it
//    still finds what actually makes small sites slow.
// ---------------------------------------------------------------------------
const PERFORMANCE: CheckSpec[] = [
  def(
    'ttfb',
    'performance',
    'warning',
    'Server response time',
    'The server took a long time to send the first byte, which delays everything else on the page.',
    false,
    ['headers'],
  ),
  def(
    'html_size',
    'performance',
    'warning',
    'Page weight',
    'The HTML alone is heavy before a single image loads, usually a page builder leaving markup behind.',
    false,
  ),
  def(
    'compression',
    'performance',
    'warning',
    'Compression on',
    'The server sends the page uncompressed, which roughly triples what every visitor downloads.',
    true,
    ['headers'],
  ),
  def(
    'cache_headers',
    'performance',
    'warning',
    'Caching set',
    'No caching instructions are sent, so returning visitors download everything again.',
    true,
    ['headers'],
  ),
  def(
    'http_version',
    'performance',
    'notice',
    'Modern connection',
    'The server still uses the older HTTP version, which loads files one after another instead of together.',
    false,
    ['headers'],
  ),
  def(
    'render_blocking_js',
    'performance',
    'warning',
    'Scripts do not block drawing',
    'Scripts in the head stop the page from drawing until they finish downloading.',
    true,
  ),
  def(
    'render_blocking_css',
    'performance',
    'warning',
    'Stylesheets are lean',
    'The page loads many separate stylesheets, each one delaying the first paint.',
    false,
  ),
  def(
    'script_count',
    'performance',
    'notice',
    'Number of scripts',
    'The page loads a lot of separate scripts, which is usually plugins that were never removed.',
    false,
  ),
  def(
    'third_party_scripts',
    'performance',
    'warning',
    'Third party weight',
    'The page loads scripts from many outside domains, and each one is a connection you do not control.',
    false,
  ),
  def(
    'inline_styles',
    'performance',
    'notice',
    'Styles are in files',
    'Large blocks of style sit inside the page, so they are downloaded again on every visit instead of cached.',
    false,
  ),
  def(
    'preconnect',
    'performance',
    'notice',
    'Outside connections warmed up',
    'The page loads from outside domains without warming the connection first, adding delay to each one.',
    true,
  ),
  def(
    'font_display',
    'performance',
    'notice',
    'Text shows while fonts load',
    'Web fonts have no display rule, so text is invisible until the font arrives.',
    true,
  ),
  def(
    'font_count',
    'performance',
    'notice',
    'Number of web fonts',
    'The page loads several font families and weights, each one a separate download before text can show.',
    false,
  ),
  def(
    'third_party_fonts',
    'performance',
    'notice',
    'Fonts served from here',
    'Fonts load from an outside service, which costs a connection and, in the EU, needs a mention in your privacy policy.',
    false,
  ),
  def(
    'dom_size',
    'performance',
    'notice',
    'Page complexity',
    'The page has a very large number of elements, which makes scrolling stutter on older phones.',
    false,
  ),
  def(
    'redirect_cost',
    'performance',
    'notice',
    'No wasted round trips',
    'Getting to this page costs extra redirects, each one a full round trip before anything loads.',
    false,
    ['headers'],
  ),
]

// ---------------------------------------------------------------------------
// 8. Mobile. Most of these visitors are on a phone, and most small sites were
//    checked on a laptop.
// ---------------------------------------------------------------------------
const MOBILE: CheckSpec[] = [
  def(
    'viewport_present',
    'mobile',
    'critical',
    'Mobile viewport',
    'The page has no viewport tag, so phones show the desktop layout shrunk to unreadable size.',
    true,
  ),
  def(
    'viewport_valid',
    'mobile',
    'warning',
    'Viewport is correct',
    'The viewport tag is malformed, so phones fall back to the desktop layout.',
    true,
  ),
  def(
    'viewport_zoom',
    'mobile',
    'warning',
    'Zoom allowed',
    'The page blocks pinch to zoom, which fails accessibility rules and frustrates anyone with weaker eyesight.',
    true,
  ),
  def(
    'fixed_width',
    'mobile',
    'warning',
    'Nothing wider than the screen',
    'Elements are set to a fixed width wider than a phone screen, which forces sideways scrolling.',
    false,
  ),
  def(
    'font_size_small',
    'mobile',
    'notice',
    'Readable text size',
    'Text is set small enough that phone visitors have to zoom to read it.',
    false,
  ),
  def(
    'tap_targets',
    'mobile',
    'notice',
    'Buttons are tappable',
    'Links and buttons sit close together, so phone visitors tap the wrong one.',
    false,
  ),
  def(
    'theme_color',
    'mobile',
    'notice',
    'Browser colour',
    'No theme colour is set, so the phone browser bar stays default grey instead of matching the brand.',
    true,
  ),
  def(
    'manifest',
    'mobile',
    'notice',
    'Home screen support',
    'There is no web manifest, so adding the site to a phone home screen gives a generic icon and name.',
    true,
  ),
]

// ---------------------------------------------------------------------------
// 9. Security and trust. Not ranking factors in themselves, but a visitor who
//    sees a warning leaves, and an agency that spots an exposed version number
//    has a conversation to open.
// ---------------------------------------------------------------------------
const SECURITY: CheckSpec[] = [
  def(
    'mixed_content',
    'security',
    'critical',
    'No insecure resources',
    'The secure page loads images or scripts over an insecure connection, which breaks the padlock.',
    true,
  ),
  def(
    'hsts',
    'security',
    'notice',
    'Strict transport security',
    'The site does not tell browsers to always use the secure version, leaving the first visit exposed.',
    true,
    ['headers'],
  ),
  def(
    'x_content_type',
    'security',
    'notice',
    'Content type respected',
    'The server does not stop browsers guessing file types, which is a known attack route.',
    true,
    ['headers'],
  ),
  def(
    'frame_protection',
    'security',
    'notice',
    'Cannot be framed',
    'Nothing stops another site loading yours inside a frame and passing it off as theirs.',
    true,
    ['headers'],
  ),
  def(
    'csp_present',
    'security',
    'notice',
    'Content security policy',
    'There is no content security policy, which is the main defence against injected scripts.',
    false,
    ['headers'],
  ),
  def(
    'referrer_policy',
    'security',
    'notice',
    'Referrer policy',
    'No referrer policy is set, so full addresses leak to every site you link to.',
    true,
    ['headers'],
  ),
  def(
    'generator_exposed',
    'security',
    'notice',
    'Software version hidden',
    'The page publishes which software and version it runs, which is the first thing an automated attack looks for.',
    true,
  ),
  def(
    'outdated_library',
    'security',
    'warning',
    'Libraries are current',
    'The page loads a script library that is years out of date and has known vulnerabilities.',
    false,
  ),
  def(
    'server_header',
    'security',
    'notice',
    'Server details hidden',
    'The server announces its exact version in every response.',
    true,
    ['headers'],
  ),
  def(
    'cookies_secure',
    'security',
    'notice',
    'Cookies protected',
    'Cookies are set without the flags that stop them being read over an insecure connection.',
    true,
    ['headers'],
  ),
]

// ---------------------------------------------------------------------------
// 10. Accessibility. Checkable from the markup alone. It is also the group that
//     carries legal weight in more and more countries, which is a real reason
//     for an agency to call a prospect.
// ---------------------------------------------------------------------------
const ACCESSIBILITY: CheckSpec[] = [
  def(
    'a11y_lang',
    'accessibility',
    'warning',
    'Language for screen readers',
    'Without a declared language a screen reader reads the page in the wrong accent, often unintelligibly.',
    true,
  ),
  def(
    'a11y_img_alt',
    'accessibility',
    'warning',
    'Images described',
    'Images without alt text are announced as unlabelled image, so that part of the page is lost.',
    true,
  ),
  def(
    'a11y_form_labels',
    'accessibility',
    'warning',
    'Form fields labelled',
    'Form fields have no labels, so a screen reader user cannot tell what to type where.',
    true,
  ),
  def(
    'a11y_button_text',
    'accessibility',
    'warning',
    'Buttons have names',
    'Buttons contain only an icon with no label, so they are announced as button and nothing else.',
    true,
  ),
  def(
    'a11y_link_purpose',
    'accessibility',
    'notice',
    'Links make sense alone',
    'Links read as click here out of context, and screen reader users often navigate by link list.',
    true,
  ),
  def(
    'a11y_heading_order',
    'accessibility',
    'notice',
    'Headings in order',
    'Skipped heading levels break the outline that screen reader users navigate by.',
    true,
  ),
  def(
    'a11y_landmarks',
    'accessibility',
    'notice',
    'Page regions marked',
    'The page has no header, nav or main regions, so there is no way to skip to the content.',
    false,
  ),
  def(
    'a11y_skip_link',
    'accessibility',
    'notice',
    'Skip to content',
    'There is no skip link, so keyboard users tab through the whole menu on every page.',
    true,
  ),
  def(
    'a11y_tabindex',
    'accessibility',
    'notice',
    'Natural tab order',
    'The page forces a custom tab order, which almost always ends up trapping or skipping something.',
    true,
  ),
  def(
    'a11y_autofocus',
    'accessibility',
    'notice',
    'No forced focus',
    'The page moves focus on load, which disorients screen reader and keyboard users.',
    true,
  ),
  def(
    'a11y_iframe_title',
    'accessibility',
    'notice',
    'Frames labelled',
    'Embedded frames have no title, so they are announced as frame with no explanation.',
    true,
  ),
  def(
    'a11y_table_headers',
    'accessibility',
    'notice',
    'Tables have headers',
    'Data tables have no header cells, so screen readers read the numbers without saying what they mean.',
    true,
  ),
  def(
    'a11y_contrast_inline',
    'accessibility',
    'notice',
    'Readable colours',
    'Text colours set in the page are too close to their background to read comfortably.',
    false,
  ),
  def(
    'a11y_focus_visible',
    'accessibility',
    'notice',
    'Focus is visible',
    'The page removes the focus outline, so keyboard users cannot see where they are.',
    false,
  ),
]

/**
 * What each check is actually worth to search. docs/05-checks.md holds the same
 * table for people, docs/35-fix-effectiveness.md holds the evidence per label.
 *
 * It is a separate table rather than an eighth argument to def() because it was
 * written in one pass from one document, and because reading it as a block is
 * the only way to see that the shape is right: twenty blockers, not a hundred.
 * A check missing from here throws on import, and the test says so more kindly.
 */
export const CHECK_IMPACT: Readonly<Record<string, CheckImpact>> = {
  // Indexing. Everything that decides whether the page exists for a search
  // engine at all. Canonicals are five checks here and one line in the research,
  // so the count runs higher than its estimate of ten to fifteen.
  page_status: 'blocker',
  https_active: 'blocker',
  https_redirect: 'blocker',
  www_duplicate: 'blocker',
  noindex: 'blocker',
  robots_header_noindex: 'blocker',
  robots_blocks: 'blocker',
  robots_exists: 'hygiene', // a missing robots.txt means allow all, RFC 9309
  robots_valid: 'blocker', // a malformed one can disallow by accident
  robots_not_html: 'hygiene',
  sitemap_declared: 'hygiene', // Google: under 500 pages you probably need none
  sitemap_reachable: 'hygiene',
  sitemap_valid: 'hygiene',
  canonical_present: 'blocker',
  canonical_absolute: 'blocker',
  canonical_self: 'blocker',
  canonical_single: 'blocker',
  canonical_scheme: 'blocker',
  redirect_chain: 'quality',
  meta_refresh: 'blocker',
  url_length: 'hygiene',
  url_params: 'hygiene',
  url_case: 'hygiene',
  url_underscores: 'hygiene',
  soft_404: 'blocker',
  amp_link: 'hygiene',
  hreflang_return: 'blocker', // for a multilingual site. Zero for one language
  pagination_tags: 'hygiene',

  // Page tags. Google rewrites 62 to 76 per cent of titles, so these raise the
  // odds of keeping our words. They do not move position.
  title_present: 'serp',
  title_length: 'serp', // 51 to 60 characters is rewritten least, Zyppy
  title_generic: 'serp',
  title_brand_only: 'serp',
  title_keyword_stuffed: 'serp',
  title_single: 'serp',
  title_caps: 'serp',
  title_separators: 'serp', // a pipe is dropped or replaced 41 per cent of the time
  meta_present: 'serp',
  meta_length: 'serp',
  meta_generic: 'serp',
  meta_duplicate_title: 'serp',
  meta_single: 'serp',
  meta_keywords: 'hygiene', // Google does not read it
  h1_present: 'serp', // an input to the title link, not a ranking factor
  h1_single: 'serp',
  h1_not_empty: 'serp',
  h1_length: 'hygiene',
  h1_differs_title: 'serp', // an h1 matching the title is rewritten far less
  heading_order: 'hygiene', // Google: out of order does not matter to search
  heading_not_empty: 'hygiene',
  heading_count: 'quality',
  lang_declared: 'hygiene', // Google detects language itself, this is for readers
  lang_matches: 'hygiene',
  charset_declared: 'quality', // mojibake is indexed, and indexed wrong
  charset_early: 'hygiene',

  // Structured data. Not a ranking factor. It qualifies a page for rich results,
  // which is a click lever when it lands and nothing when it does not.
  jsonld_present: 'serp',
  jsonld_parses: 'serp',
  jsonld_context: 'serp',
  jsonld_type_known: 'serp',
  org_present: 'serp',
  org_required: 'serp',
  localbusiness_address: 'serp',
  localbusiness_phone: 'serp',
  localbusiness_hours: 'serp',
  localbusiness_geo: 'serp',
  breadcrumb_present: 'serp',
  website_schema: 'serp',
  product_offers: 'serp',
  product_availability: 'serp',
  article_dates: 'serp',
  faq_opportunity: 'hygiene', // Google is withdrawing the FAQ rich result
  sameas_links: 'serp',
  rating_unsupported: 'serp', // invented ratings lose the rich result, not the rank
  schema_duplicate: 'serp',
  microdata_only: 'hygiene',

  // Content. Thin and duplicated content is the one on-page family a core update
  // can genuinely punish. Contact details are trust, which is why they sit here.
  word_count: 'quality',
  text_ratio: 'hygiene',
  placeholder_text: 'quality',
  lorem_ipsum: 'quality',
  coming_soon: 'quality',
  duplicate_paragraphs: 'quality',
  sentence_length: 'hygiene',
  contact_phone: 'quality',
  phone_clickable: 'hygiene',
  contact_email: 'quality',
  email_clickable: 'hygiene',
  address_present: 'quality',
  hours_present: 'hygiene',
  cta_present: 'quality',
  form_present: 'hygiene',
  copyright_year: 'hygiene',
  links_have_text: 'quality', // internal links are the only authority lever a small site owns
  link_text_generic: 'quality',
  links_not_empty: 'quality',
  external_links_safe: 'hygiene',
  internal_link_count: 'quality',
  broken_internal_links: 'quality',
  mixed_language: 'hygiene',
  privacy_link: 'hygiene',
  terms_link: 'hygiene',
  thin_boilerplate: 'quality',

  // Images and media. Alt text is accessibility and compliance, not search.
  // The favicon is the exception: Google shows it in mobile results.
  img_alt_present: 'hygiene',
  img_alt_filename: 'hygiene',
  img_alt_length: 'hygiene',
  img_alt_stuffed: 'hygiene',
  img_dimensions: 'quality', // missing dimensions are the usual cause of CLS
  img_lazy: 'quality',
  img_modern_format: 'quality',
  img_srcset: 'quality',
  img_count: 'hygiene',
  img_inline_background: 'hygiene',
  favicon_present: 'serp',
  apple_icon: 'hygiene',
  video_title: 'hygiene',
  iframe_lazy: 'quality',
  svg_accessible: 'hygiene',

  // Social sharing. A share preview is a click lever on somebody else's surface.
  og_title: 'serp',
  og_description: 'serp',
  og_image: 'serp',
  og_image_absolute: 'serp',
  og_image_size: 'serp',
  og_image_loads: 'serp',
  og_url: 'serp',
  og_type: 'serp',
  og_site_name: 'serp',
  og_locale: 'hygiene',
  twitter_card: 'serp',
  twitter_image: 'serp',
  social_profiles: 'hygiene',

  // Speed. Core Web Vitals are a confirmed but weak ranking factor and a much
  // better documented conversion factor. Sold as the second, never the first.
  ttfb: 'quality',
  html_size: 'quality',
  compression: 'quality',
  cache_headers: 'quality',
  http_version: 'hygiene',
  render_blocking_js: 'quality',
  render_blocking_css: 'quality',
  script_count: 'hygiene',
  third_party_scripts: 'quality',
  inline_styles: 'hygiene',
  preconnect: 'hygiene',
  font_display: 'hygiene',
  font_count: 'hygiene',
  third_party_fonts: 'hygiene',
  dom_size: 'hygiene',
  redirect_cost: 'quality',

  // Mobile. Since July 2024 Google indexes with the smartphone crawler only, so
  // a site that does not work on a phone is not a warning, it is not indexed.
  viewport_present: 'blocker',
  viewport_valid: 'blocker',
  viewport_zoom: 'hygiene',
  fixed_width: 'blocker',
  font_size_small: 'hygiene',
  tap_targets: 'hygiene',
  theme_color: 'hygiene',
  manifest: 'hygiene',

  // Security and trust. Real work, and with one exception not search work.
  mixed_content: 'blocker',
  hsts: 'hygiene',
  x_content_type: 'hygiene',
  frame_protection: 'hygiene',
  csp_present: 'hygiene',
  referrer_policy: 'hygiene',
  generator_exposed: 'hygiene',
  outdated_library: 'hygiene',
  server_header: 'hygiene',
  cookies_secure: 'hygiene',

  // Accessibility. Every one of these is hygiene for search and none of them is
  // hygiene for the person using a screen reader. The label measures one thing.
  a11y_lang: 'hygiene',
  a11y_img_alt: 'hygiene',
  a11y_form_labels: 'hygiene',
  a11y_button_text: 'hygiene',
  a11y_link_purpose: 'hygiene',
  a11y_heading_order: 'hygiene',
  a11y_landmarks: 'hygiene',
  a11y_skip_link: 'hygiene',
  a11y_tabindex: 'hygiene',
  a11y_autofocus: 'hygiene',
  a11y_iframe_title: 'hygiene',
  a11y_table_headers: 'hygiene',
  a11y_contrast_inline: 'hygiene',
  a11y_focus_visible: 'hygiene',
}

/**
 * How much one impact class outranks the next when the report decides what to
 * lead with. Multiplied by severity rather than added to it, so a critical
 * quality problem still beats a cosmetic SERP one. docs/05-checks.md.
 */
export const IMPACT_RANK: Record<CheckImpact, number> = {
  blocker: 4,
  serp: 3,
  quality: 2,
  hygiene: 1,
}

/** What a check with no label counts as. Only a code outside the catalogue. */
export const DEFAULT_IMPACT: CheckImpact = 'quality'

export const IMPACT_LABELS: Record<CheckImpact, string> = {
  blocker: 'Blocks indexing',
  serp: 'Changes how you appear',
  quality: 'Quality and structure',
  hygiene: 'Housekeeping',
}

const withImpact = (c: CheckSpec): CheckDefinition => {
  const impact = CHECK_IMPACT[c.code]
  if (!impact) throw new Error(`checks-catalog: ${c.code} has no impact label`)
  return { ...c, impact }
}

/** Every check, in report order. */
export const CHECKS: CheckDefinition[] = [
  ...INDEXING,
  ...TAGS,
  ...SCHEMA,
  ...CONTENT,
  ...MEDIA,
  ...SOCIAL,
  ...PERFORMANCE,
  ...MOBILE,
  ...SECURITY,
  ...ACCESSIBILITY,
].map(withImpact)

/** What the widget runs today: everything that needs no crawl of the whole site. */
export const PHASE_1_CHECKS = CHECKS.filter((c) => c.phase === 1)

export const CHECKS_BY_CODE: ReadonlyMap<string, CheckDefinition> = new Map(
  CHECKS.map((c) => [c.code, c]),
)

export const GROUP_LABELS: Record<CheckGroup, string> = {
  indexing: 'Indexing',
  tags: 'Page tags',
  structured_data: 'Structured data',
  content: 'Content',
  media: 'Images and media',
  social: 'Social sharing',
  performance: 'Speed',
  mobile: 'Mobile',
  security: 'Security and trust',
  accessibility: 'Accessibility',
}

/**
 * One line per group, shown under the group score. It tells the visitor why the
 * group matters before they read a single finding.
 */
export const GROUP_INTROS: Record<CheckGroup, string> = {
  indexing: 'Whether search engines can reach this page and know it is the real one.',
  tags: 'The words Google shows in results. This is where most clicks are won or lost.',
  structured_data: 'What turns a plain result into one with hours, a map pin or a price.',
  content: 'Whether there is enough here to rank, and a clear way to get in touch.',
  media: 'Images that load fast and that search engines can understand.',
  social: 'What the page looks like when somebody shares the link.',
  performance: 'How quickly the page starts showing something useful.',
  mobile: 'How the page behaves on the phone most of your visitors are using.',
  security: 'Signals visitors and browsers use to decide whether to trust the site.',
  accessibility: 'Whether people using a screen reader or a keyboard can use the page.',
}

/**
 * Not every group matters equally to search. A missing title costs more than a
 * missing skip link. Weights sum to 100 and are used for the overall score only;
 * each group still shows its own honest sub-score.
 */
export const GROUP_WEIGHTS: Record<CheckGroup, number> = {
  indexing: 18,
  tags: 18,
  content: 14,
  structured_data: 12,
  performance: 10,
  media: 8,
  social: 6,
  mobile: 6,
  security: 4,
  accessibility: 4,
}

export const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 3,
  warning: 2,
  notice: 1,
}

/** Requests one audit makes beyond the page itself, so the cost is never a surprise. */
export const EXTRA_REQUESTS = {
  robots: 1,
  sitemap: 1,
  probe: 2,
} as const
