/**
 * Guards that run on model output before a fix is ever shown to a visitor.
 * docs/33-model-prompts.md.
 *
 * Three separate concerns, deliberately not merged:
 *
 *   1. Invented facts. The agency pastes our text onto a real business. A made up
 *      phone number or city is the worst thing this product can do.
 *   2. Spam wording. Gets the agency's domain a penalty and gets us complaints.
 *   3. Sounding generated. Nobody is harmed, but the agency's client says "this was
 *      written by ChatGPT" and the agency stops using us. For this product that is
 *      the failure mode that actually happens, so it gets its own pass.
 */

export const SPAM_WORDS = [
  'click here',
  'best price',
  'cheapest',
  'guaranteed',
  '100%',
  '#1',
  'number one',
  'act now',
  'limited time',
  'call now',
  'free shipping on everything',
] as const

/** Allowed only when the page itself says it. Checked against page content. */
export const CLAIM_WORDS = ['award-winning', 'leading provider', 'trusted by thousands'] as const

export const AI_TELL_WORDS = [
  'delve',
  'leverage',
  'elevate',
  'unlock',
  'unleash',
  'empower',
  'foster',
  'ignite',
  'streamline',
  'seamless',
  'robust',
  'curated',
  'bespoke',
  'cutting-edge',
  'transformative',
  'revolutionary',
  'world-class',
  'comprehensive',
  'holistic',
  'myriad',
  'plethora',
  'vibrant',
  'nestled',
  'boasts',
  'tapestry',
  'beacon',
  'realm',
  "in today's",
  'ever-evolving',
  'your trusted partner',
  'we pride ourselves',
  'look no further',
  'next level',
  'one-stop shop',
  'state of the art',
  'game-changer',
  'dive into',
  'navigating the',
  'at the end of the day',
] as const

/**
 * Words businesses use to sell themselves. Three of these in a row is the cadence
 * that gives generated copy away. Three ordinary nouns is just a list.
 */
const SELLING_WORDS = new Set([
  'fast',
  'quick',
  'reliable',
  'affordable',
  'cheap',
  'professional',
  'quality',
  'efficient',
  'modern',
  'innovative',
  'flexible',
  'scalable',
  'secure',
  'simple',
  'easy',
  'powerful',
  'seamless',
  'robust',
  'trusted',
  'friendly',
  'experienced',
  'dedicated',
  'comprehensive',
  'effective',
  'custom',
  'premium',
  'expert',
  'honest',
  'transparent',
  'responsive',
  'creative',
  'beautiful',
  'stunning',
])

export const INJECTION_MARKERS = [
  'as an ai',
  'as a language model',
  'ignore previous',
  'ignore all previous',
  'system prompt',
  'i cannot',
  "i'm sorry, but",
  'disregard the above',
] as const

import { findGenericCopy } from './specificity'

export interface Violation {
  rule: 'invented' | 'spam' | 'ai_tell' | 'injection' | 'generic'
  detail: string
}

function wordPresent(haystack: string, needle: string): boolean {
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Word boundaries only where the term starts and ends with a word character,
  // so "#1" and "in today's" still match.
  const pattern = /^\w.*\w$/.test(needle) ? `\\b${escaped}\\b` : escaped
  return new RegExp(pattern, 'i').test(haystack)
}

/** Reads as machine-written. docs/33, "Zvuči kao AI". */
export function findAiTells(text: string, opts: { isTitle?: boolean } = {}): Violation[] {
  const out: Violation[] = []
  const push = (detail: string) => out.push({ rule: 'ai_tell', detail })

  if (/[\u2014\u2013]/.test(text)) push('em or en dash')

  for (const word of AI_TELL_WORDS) {
    if (wordPresent(text, word)) push(`banned word: ${word}`)
  }

  // "fast, reliable and affordable". The tell is three SELLING words in a row, not
  // any list of three. "header, nav or main" is a factual enumeration and must pass,
  // which is what writing 176 real check sentences taught us.
  const triple = text.match(/\b([\w-]+),\s+([\w-]+),?\s+(?:and|or)\s+([\w-]+)\b/i)
  if (triple && triple.slice(1, 4).some((w) => SELLING_WORDS.has(w.toLowerCase()))) {
    push('three selling words in a row')
  }

  if (/\bnot just\b[^.!?]*\bbut\b/i.test(text)) push('pattern: not just X, but Y')
  // The tell is the opener "Whether you are X or Y, ...", not the ordinary clause
  // "shows whether you are open".
  if (/(?:^|[.!?]\s+)whether (?:you|your)\b/i.test(text)) push('pattern: whether you')
  if (/\b(?:no [\w-]+\.\s*){2}/i.test(text)) push('pattern: No X. No Y.')

  // Models love a colon in a title. People writing their own title tag rarely use one.
  if (opts.isTitle && text.includes(':')) push('colon in title')

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12)
  if (sentences.length === 2) {
    const [a, b] = sentences as [string, string]
    if (Math.abs(a.length - b.length) < 3) push('two sentences of near identical length')
  }

  return out
}

export function findSpam(text: string, pageContent = ''): Violation[] {
  const out: Violation[] = []
  const push = (detail: string) => out.push({ rule: 'spam', detail })

  for (const word of SPAM_WORDS) {
    if (wordPresent(text, word)) push(`spam wording: ${word}`)
  }
  // A boast is allowed only when the page makes it itself.
  for (const word of CLAIM_WORDS) {
    if (wordPresent(text, word) && !wordPresent(pageContent, word)) {
      push(`unsupported claim: ${word}`)
    }
  }
  if (text.includes('!')) push('exclamation mark')
  if (/\p{Extended_Pictographic}/u.test(text)) push('emoji')
  if (/\b[A-Z]{3,}\b/.test(text.replace(/\b(?:SEO|CEO|HVAC|LLC|DIY|USA|VAT|PDF|API)\b/g, ''))) {
    push('shouting capitals')
  }
  return out
}

/**
 * Nothing factual may appear that the page does not state. Numbers and hosts are the
 * dangerous ones: a phone number, a price, a postcode, a year, a link elsewhere.
 */
export function findInventedFacts(text: string, pageContent: string): Violation[] {
  const out: Violation[] = []
  const push = (detail: string) => out.push({ rule: 'invented', detail })

  const haystack = pageContent.toLowerCase()

  for (const token of text.match(/\d[\d.,:/-]*\d|\d/g) ?? []) {
    const bare = token.replace(/[.,:/-]+$/, '')
    if (bare.length > 0 && !haystack.includes(bare.toLowerCase())) {
      push(`number not on the page: ${bare}`)
    }
  }

  for (const host of text.match(/\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:[a-z]{2,})\b/gi) ?? []) {
    if (!haystack.includes(host.toLowerCase())) push(`domain not on the page: ${host}`)
  }

  return out
}

export function findInjection(text: string): Violation[] {
  return INJECTION_MARKERS.filter((m) => wordPresent(text, m)).map((m) => ({
    rule: 'injection' as const,
    detail: `injection marker: ${m}`,
  }))
}

export interface GuardContext {
  pageContent: string
  isTitle?: boolean
  /** Business name, so the swap test can strip it. */
  brandName?: string
  /** Town, same reason. */
  location?: string
  /** What the page already had, so we can check the rewrite is an improvement. */
  previous?: string | null
  language?: string
  /** Copy we wrote for OTHER hosts, to catch ourselves repeating a sentence. */
  corpus?: readonly string[]
}

export interface GuardResult {
  ok: boolean
  violations: Violation[]
  /** True when the whole audit must be pulled, not just this one field. */
  poisoned: boolean
}

/**
 * Run every guard over one piece of generated text, in order of how bad the failure
 * is: an injection attempt poisons the audit, an invented fact harms the business,
 * spam harms the domain, sounding generated harms the agency's credibility, and
 * saying nothing wastes everyone's time.
 */
export function guardText(text: string, ctx: GuardContext): GuardResult {
  const violations = [
    ...findInjection(text),
    ...findInventedFacts(text, ctx.pageContent),
    ...findSpam(text, ctx.pageContent),
    ...findAiTells(text, { isTitle: ctx.isTitle }),
    ...findGenericCopy(text, {
      pageContent: ctx.pageContent,
      brandName: ctx.brandName,
      location: ctx.location,
      previous: ctx.previous,
      language: ctx.language,
      corpus: ctx.corpus,
      kind: ctx.isTitle ? 'title' : 'meta',
    }),
  ]
  return {
    ok: violations.length === 0,
    violations,
    poisoned: violations.some((v) => v.rule === 'injection'),
  }
}
