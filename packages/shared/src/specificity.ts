import type { Violation } from './fix-guard'

/**
 * Catches copy that is true, clean, and says nothing.
 *
 * The word filters in fix-guard.ts catch text that sounds generated. They do not
 * catch "Quality kitchen services for your home. Contact us to learn more." That
 * sentence breaks no rule and is worthless, because every kitchen fitter on earth
 * could paste it.
 *
 * Four signals, none of which needs a human:
 *
 *   1. Density.   How much of the text is information rather than filler.
 *   2. Swap test.  Remove the brand and the town. Is anything left that is true of
 *                  this business and not of its competitor across the road?
 *   3. Lift.       Is it more specific than the title the page already had? If not,
 *                  we are churning, not fixing.
 *   4. Corpus.     Have we written nearly this same sentence for a different domain?
 *                  Only we can run this one, because only we hold our own output.
 *
 * What stays human: whether the copy is persuasive. That is a higher bar than
 * "not generic", and we are not trying to clear it automatically.
 */

/** Grammar. Carries no information in any copy. */
const STOPWORDS_EN = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'but',
  'if',
  'of',
  'to',
  'in',
  'on',
  'at',
  'by',
  'for',
  'with',
  'from',
  'as',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'we',
  'our',
  'us',
  'you',
  'your',
  'they',
  'their',
  'it',
  'its',
  'this',
  'that',
  'these',
  'those',
  'there',
  'here',
  'can',
  'will',
  'would',
  'should',
  'may',
  'more',
  'most',
  'all',
  'any',
  'every',
  'each',
  'no',
  'not',
  'so',
  'than',
  'then',
  'when',
  'where',
  'who',
  'what',
  'how',
  'why',
  'up',
  'out',
  'over',
  'into',
  'about',
])

/**
 * Words that look like content but are true of every business. A sentence built
 * only from these is a sentence about nothing.
 */
const GENERIC_EN = new Set([
  'service',
  'services',
  'solution',
  'solutions',
  'product',
  'products',
  'business',
  'company',
  'quality',
  'professional',
  'professionals',
  'expert',
  'experts',
  'experience',
  'experienced',
  'team',
  'staff',
  'customer',
  'customers',
  'client',
  'clients',
  'need',
  'needs',
  'offer',
  'offers',
  'offering',
  'provide',
  'provides',
  'providing',
  'best',
  'great',
  'good',
  'top',
  'leading',
  'trusted',
  'reliable',
  'affordable',
  'competitive',
  'dedicated',
  'committed',
  'passionate',
  'friendly',
  'local',
  'home',
  'help',
  'helping',
  'work',
  'working',
  'contact',
  'call',
  'learn',
  'find',
  'get',
  'see',
  'visit',
  'today',
  'now',
  'years',
  'range',
  'wide',
  'full',
  'complete',
  'perfect',
  'right',
  'choice',
  'care',
  'support',
  'options',
  'welcome',
  'specialist',
  'specialists',
  'specializing',
  'satisfaction',
  'guarantee',
])

const TOKEN = /[\p{L}\p{N}][\p{L}\p{N}'-]*/gu

export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(TOKEN) ?? []).filter((t) => t.length > 1)
}

/**
 * Words that actually carry meaning: not grammar, not business filler.
 * The lists are English. For other languages only density is skipped; the swap
 * test, the lift test and the corpus test still work, because they compare text
 * against text rather than against a word list.
 */
export function contentTerms(text: string, language = 'en'): string[] {
  const tokens = tokenize(text)
  if (language !== 'en') return [...new Set(tokens)]
  return [...new Set(tokens.filter((t) => !STOPWORDS_EN.has(t) && !GENERIC_EN.has(t)))]
}

/** Character trigrams, for comparing two short strings without a model. */
function trigrams(text: string): Set<string> {
  const clean = ` ${text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()} `
  const out = new Set<string>()
  for (let i = 0; i < clean.length - 2; i += 1) out.add(clean.slice(i, i + 3))
  return out
}

export function similarity(a: string, b: string): number {
  const ta = trigrams(a)
  const tb = trigrams(b)
  if (ta.size === 0 || tb.size === 0) return 0
  let shared = 0
  for (const t of ta) if (tb.has(t)) shared += 1
  return shared / (ta.size + tb.size - shared)
}

export interface SpecificityContext {
  pageContent: string
  /** The business name, so the swap test can remove it. */
  brandName?: string
  /** The town, so the swap test can remove it. */
  location?: string
  /** What the page already had. New copy must beat it, not match it. */
  previous?: string | null
  language?: string
  /** Metadata we wrote for OTHER hosts. A near match means we are repeating ourselves. */
  corpus?: readonly string[]
  /** meta descriptions carry more words, so they owe more information. */
  kind?: 'title' | 'meta'
}

export interface SpecificityReport {
  /** Meaningful words that also appear on the page. */
  grounded: string[]
  /** Share of the text that is information rather than filler, 0 to 1. */
  density: number
  /** Anything left once the brand and the town are removed. */
  survivesSwap: boolean
  /** Highest similarity to copy we wrote for a different site. */
  nearestCorpus: number
  violations: Violation[]
}

const MIN_TERMS = { title: 2, meta: 3 } as const
const MIN_DENSITY = { title: 0.3, meta: 0.22 } as const
/** Above this, two descriptions are the same sentence with the nouns changed. */
const CORPUS_LIMIT = 0.6

export function analyseSpecificity(text: string, ctx: SpecificityContext): SpecificityReport {
  const kind = ctx.kind ?? 'meta'
  const language = ctx.language ?? 'en'
  const violations: Violation[] = []
  const push = (detail: string) => violations.push({ rule: 'generic', detail })

  const page = ctx.pageContent.toLowerCase()
  const terms = contentTerms(text, language)
  const grounded = terms.filter((t) => page.includes(t))
  const tokens = tokenize(text)
  const density = tokens.length === 0 ? 0 : terms.length / tokens.length

  // 1. Enough real information, and drawn from this page.
  if (language === 'en') {
    if (grounded.length < MIN_TERMS[kind]) {
      push(`only ${grounded.length} specific term(s) taken from the page, needs ${MIN_TERMS[kind]}`)
    }
    if (density < MIN_DENSITY[kind]) {
      push(
        `${Math.round(density * 100)}% of the words carry information, needs ${Math.round(MIN_DENSITY[kind] * 100)}%`,
      )
    }
  }

  // 2. The swap test. Take out the name and the town and see what is left.
  let stripped = text
  for (const part of [ctx.brandName, ctx.location]) {
    if (part)
      stripped = stripped.replace(
        new RegExp(part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
        ' ',
      )
  }
  const survivesSwap = contentTerms(stripped, language).some((t) => page.includes(t))
  if (!survivesSwap) {
    push(
      'nothing left once the business name and town are removed, a competitor could use this as is',
    )
  }

  // 3. Lift over what the page already had.
  if (ctx.previous && ctx.previous.trim().length > 0) {
    const before = contentTerms(ctx.previous, language).filter((t) => page.includes(t)).length
    if (grounded.length <= before) {
      push(`no more specific than the ${kind} already on the page`)
    }
  }

  // 4. Have we written this before, for somebody else.
  let nearestCorpus = 0
  for (const other of ctx.corpus ?? []) {
    nearestCorpus = Math.max(nearestCorpus, similarity(text, other))
  }
  if (nearestCorpus >= CORPUS_LIMIT) {
    push(`${Math.round(nearestCorpus * 100)}% the same as copy we wrote for another site`)
  }

  return { grounded, density, survivesSwap, nearestCorpus, violations }
}

export function findGenericCopy(text: string, ctx: SpecificityContext): Violation[] {
  return analyseSpecificity(text, ctx).violations
}
