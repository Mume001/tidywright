import type { CheckGroup, Severity } from './types'

/**
 * The 29 checks the widget runs on a single page. docs/05-checks.md, "Prva verzija".
 * Weight drives the score: critical 3, warning 2, notice 1, within its group.
 *
 * This list is the contract between packages/checks (which implements each one),
 * the report UI (which labels them) and the score. Adding a check means adding a
 * row here, an implementation, and a test.
 */
export interface CheckDefinition {
  code: string
  group: CheckGroup
  severity: Severity
  /** Shown as the row title in the report. */
  title: string
  /** One sentence a small business owner understands, used when the check fails. */
  failText: string
  /** Whether we can generate a fix for it, or only report it. */
  fixable: boolean
}

export const CHECKS: CheckDefinition[] = [
  // A. Indexing and duplicates
  {
    code: 'www_duplicate',
    group: 'indexing',
    severity: 'critical',
    title: 'One address only',
    failText:
      'The site answers on both the www and the non-www address, so Google sees two copies.',
    fixable: true,
  },
  {
    code: 'https_redirect',
    group: 'indexing',
    severity: 'critical',
    title: 'HTTPS',
    failText: 'The insecure http address does not redirect to https.',
    fixable: true,
  },
  {
    code: 'canonical_missing',
    group: 'indexing',
    severity: 'warning',
    title: 'Canonical tag',
    failText: 'There is no canonical tag telling Google which address is the real one.',
    fixable: true,
  },
  {
    code: 'canonical_mismatch',
    group: 'indexing',
    severity: 'warning',
    title: 'Canonical target',
    failText: 'The canonical tag points somewhere the internal links do not.',
    fixable: true,
  },
  {
    code: 'sitemap_missing',
    group: 'indexing',
    severity: 'warning',
    title: 'Sitemap',
    failText: 'No sitemap was found, and robots.txt does not point to one.',
    fixable: true,
  },
  {
    code: 'robots_blocks',
    group: 'indexing',
    severity: 'critical',
    title: 'robots.txt',
    failText: 'robots.txt blocks a page that should be findable.',
    fixable: true,
  },
  {
    code: 'noindex',
    group: 'indexing',
    severity: 'critical',
    title: 'Indexable',
    failText: 'This page tells search engines not to index it.',
    fixable: false,
  },
  {
    code: 'redirect_chain',
    group: 'indexing',
    severity: 'notice',
    title: 'Redirect chain',
    failText: 'Reaching this page takes more than two redirects.',
    fixable: true,
  },

  // B. Page tags
  {
    code: 'title_missing',
    group: 'tags',
    severity: 'warning',
    title: 'Title tag',
    failText: 'The page has no title tag, so Google invents one.',
    fixable: true,
  },
  {
    code: 'title_length',
    group: 'tags',
    severity: 'notice',
    title: 'Title length',
    failText: 'The title is too short or too long to show fully in results.',
    fixable: true,
  },
  {
    code: 'title_generic',
    group: 'tags',
    severity: 'warning',
    title: 'Title is specific',
    failText:
      'The title is generic, like Home or the theme name, and says nothing about the business.',
    fixable: true,
  },
  {
    code: 'meta_missing',
    group: 'tags',
    severity: 'warning',
    title: 'Meta description',
    failText: 'There is no description, so Google picks random text from the page.',
    fixable: true,
  },
  {
    code: 'meta_length',
    group: 'tags',
    severity: 'notice',
    title: 'Description length',
    failText: 'The description is longer than results will show.',
    fixable: true,
  },
  {
    code: 'h1_missing',
    group: 'tags',
    severity: 'warning',
    title: 'Has an H1',
    failText: 'The page has no main heading.',
    fixable: true,
  },
  {
    code: 'h1_multiple',
    group: 'tags',
    severity: 'warning',
    title: 'One H1',
    failText: 'The page has more than one main heading, so none of them stands out.',
    fixable: true,
  },
  {
    code: 'heading_skip',
    group: 'tags',
    severity: 'notice',
    title: 'Heading order',
    failText: 'Heading levels skip a step, for example H2 straight to H4.',
    fixable: true,
  },

  // C. Structured data
  {
    code: 'jsonld_missing',
    group: 'structured_data',
    severity: 'warning',
    title: 'Structured data',
    failText: 'There is no structured data, so the business cannot appear in rich results.',
    fixable: true,
  },
  {
    code: 'breadcrumb_missing',
    group: 'structured_data',
    severity: 'notice',
    title: 'Breadcrumbs',
    failText: 'Deeper pages have no breadcrumb markup.',
    fixable: true,
  },
  {
    code: 'jsonld_invalid',
    group: 'structured_data',
    severity: 'warning',
    title: 'Structured data is valid',
    failText: 'The structured data on the page does not validate.',
    fixable: true,
  },

  // D and E and F. Content, media, sharing
  {
    code: 'hreflang_missing',
    group: 'content',
    severity: 'warning',
    title: 'Language tags',
    failText: 'The page offers other languages but has no hreflang tags.',
    fixable: true,
  },
  {
    code: 'html_lang',
    group: 'content',
    severity: 'notice',
    title: 'Page language',
    failText: 'The html lang attribute is missing or does not match the text.',
    fixable: true,
  },
  {
    code: 'mixed_language',
    group: 'content',
    severity: 'notice',
    title: 'One language',
    failText: 'Two languages appear on the same page.',
    fixable: false,
  },
  {
    code: 'img_alt_missing',
    group: 'content',
    severity: 'notice',
    title: 'Image alt text',
    failText: 'Some images have no alt text.',
    fixable: true,
  },
  {
    code: 'img_alt_filename',
    group: 'content',
    severity: 'notice',
    title: 'Alt text is real',
    failText: 'Some alt text is just the file name, like IMG_2831.jpg.',
    fixable: true,
  },
  {
    code: 'thin_content',
    group: 'content',
    severity: 'notice',
    title: 'Enough content',
    failText: 'The page has under 200 words, which is thin for ranking.',
    fixable: false,
  },
  {
    code: 'og_missing',
    group: 'content',
    severity: 'notice',
    title: 'Open Graph tags',
    failText: 'og:title or og:description is missing, so shared links look bare.',
    fixable: true,
  },
  {
    code: 'og_image',
    group: 'content',
    severity: 'notice',
    title: 'Share image',
    failText: 'There is no share image, or it is a small square logo.',
    fixable: false,
  },
  {
    code: 'twitter_card',
    group: 'content',
    severity: 'notice',
    title: 'Twitter card',
    failText: 'The twitter:card tag is missing.',
    fixable: true,
  },
  {
    code: 'page_status',
    group: 'indexing',
    severity: 'critical',
    title: 'Page loads',
    failText: 'The page did not return a normal 200 response.',
    fixable: false,
  },
]

export const CHECKS_BY_CODE: ReadonlyMap<string, CheckDefinition> = new Map(
  CHECKS.map((c) => [c.code, c]),
)

export const GROUP_LABELS: Record<CheckGroup, string> = {
  indexing: 'Technical',
  tags: 'Page tags',
  structured_data: 'Structured data',
  content: 'Content and sharing',
}

export const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 3,
  warning: 2,
  notice: 1,
}
