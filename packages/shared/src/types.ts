/**
 * Domain types for phase 1. Mirrors docs/18-data-model.md.
 * When a column changes there, it changes here in the same PR.
 */

export type Plan = 'free' | 'starter' | 'agency' | 'pro'
export type AgencyStatus = 'active' | 'suspended' | 'deleted'
export type Role = 'owner' | 'admin' | 'member' | 'client'

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost' | 'spam'

export type AuditStatus =
  'queued' | 'fetching' | 'checking' | 'generating' | 'done' | 'failed' | 'expired'

/**
 * Why an audit did not finish. The visitor sees a sentence per code, never the code.
 *
 * The class decides whether we retry, how long we wait, whether we escalate to the
 * headless layer, and which sentence the report shows. docs/17-backend-spec.md has the
 * behaviour of each one. challenge and blocked are not the same thing: the first is
 * usually solved by a real browser, the second almost never is.
 */
export type FailureCode =
  // the fetch itself
  | 'dns'
  | 'connect'
  | 'tls'
  | 'timeout'
  | 'http_client'
  | 'http_server'
  | 'ratelimit'
  // they saw us and said no
  | 'challenge'
  | 'blocked'
  | 'robots'
  // we got something we cannot use
  | 'content'
  | 'too_large'
  // ours, not theirs
  | 'ssrf'
  | 'model'
  | 'model_rejected'
  | 'internal'

/** Classes that mean the site refused us, rather than failed to answer. */
export const REFUSED_CODES: readonly FailureCode[] = ['blocked', 'challenge', 'robots']

export type AuditVariant = 'full' | 'score_only'

/**
 * What a check is actually worth to search, as opposed to how loud it looks.
 *
 * A group weight says how much a whole area matters. This says how much one
 * check matters, and the two are not the same: page tags holds both a missing
 * title and a shouting one. Evidence per label is in docs/35-fix-effectiveness.md,
 * the label per check is in docs/05-checks.md.
 *
 *   blocker   if it is wrong the page may not be crawled, indexed or served at
 *             all. Binary. This is the only class we may call costly.
 *   serp      changes how the page looks in results or when shared. Moves
 *             clicks, not position.
 *   quality   a real ranking factor that is neither binary nor a click lever:
 *             thin content, duplicates, internal links, speed, trust signals.
 *   hygiene   tidy, accessible, compliant, and with no measurable effect on
 *             search. Still worth doing, never sold as SEO.
 */
export type CheckImpact = 'blocker' | 'serp' | 'quality' | 'hygiene'

/** The groups the score is broken into. docs/05-checks.md. */
export type CheckGroup =
  | 'indexing'
  | 'tags'
  | 'structured_data'
  | 'content'
  | 'media'
  | 'social'
  | 'performance'
  | 'mobile'
  | 'security'
  | 'accessibility'

export type Severity = 'critical' | 'warning' | 'notice'
export type CheckStatus = 'pass' | 'fail' | 'warn' | 'skipped'

export type FixKind = 'title' | 'meta' | 'jsonld' | 'h1' | 'og' | 'alt'

export interface Agency {
  id: string
  slug: string
  name: string
  plan: Plan
  status: AgencyStatus
  ownerUserId: string
  timezone: string
  createdAt: string
}

export interface User {
  id: string
  email: string
  fullName: string | null
  avatarPath: string | null
  createdAt: string
}

export interface Membership {
  id: string
  agencyId: string
  userId: string
  role: Role
  acceptedAt: string | null
  createdAt: string
}

export interface Branding {
  agencyId: string
  logoPath: string | null
  primaryColor: string
  headline: string
  subline: string
  buttonLabel: string
  reportIntro: string
  ctaLabel: string
  ctaUrl: string
  /** Booking link. When set, the report shows "Book a call" in its header. */
  calendarUrl: string | null
  footerText: string | null
  companyAddress: string | null
  hidePoweredBy: boolean
  consentVersion: string
  privacyPolicyUrl: string | null
  updatedAt: string
}

export interface EmbedKey {
  id: string
  agencyId: string
  publicKey: string
  label: string
  allowedOrigins: string[]
  status: 'active' | 'revoked'
  lastUsedAt: string | null
  createdAt: string
}

/** Proof the visitor agreed. Written once, never edited. docs/23-compliance.md. */
/** One tick, with the exact words that were next to it. Evidence, not a flag. */
export interface ConsentRecord {
  text: string
  version: string
  checked: boolean
  /** Null when it was never ticked. A false record is still a record. */
  ts: string | null
  formUrl: string
}

/**
 * Two consents, never one. `service` is required and is permission to send the
 * report the visitor asked for. `marketing` is optional, unchecked by default,
 * and its own record. One tick covering both purposes is bundling, and consent
 * has to be specific and freely given per purpose. decisions/0011 point 3,
 * docs/18-data-model.md.
 */
export interface Consent {
  service: ConsentRecord
  marketing: ConsentRecord
}

export interface Lead {
  id: string
  agencyId: string
  embedKeyId: string | null
  email: string
  siteUrl: string
  siteHost: string
  name: string | null
  phone: string | null
  status: LeadStatus
  sourceUrl: string | null
  utm: { source?: string; medium?: string; campaign?: string }
  consent: Consent
  country: string | null
  firstViewedAt: string | null
  notes: string | null
  /**
   * The secret in the /u/<token> link, 32 random bytes as base64url. Its own
   * value, never derived from the id: this link travels through mail servers,
   * log files and the automatic unsubscribe preview some clients run, and
   * whoever ends up holding it must not thereby hold a primary key. Null until
   * the first email to this lead is sent. docs/18-data-model.md.
   */
  unsubscribeToken: string | null
  unsubscribedAt: string | null
  createdAt: string
}

export interface CheckResult {
  code: string
  group: CheckGroup
  severity: Severity
  status: CheckStatus
  title: string
  detail: string
  evidence: string | null
}

export interface Fix {
  kind: FixKind
  severity: Severity
  label: string
  before: string | null
  after: string
  reasons: string[]
}

/** The small blob kept on the audit row. The full result lives in object storage. */
export interface AuditSummary {
  groups: Record<CheckGroup, number>
  /** Counts by severity, so the header can say "3 critical, 12 warnings" without
   *  walking the full check list. */
  counts: { critical: number; warning: number; notice: number; passed: number }
  /** The codes the report leads with, in the order it shows them. */
  priority: string[]
  passed: string[]
  failed: string[]
  warnings: string[]
  headline: string
  intro: string
}

export interface Audit {
  id: string
  agencyId: string
  leadId: string | null
  token: string
  url: string
  finalUrl: string | null
  status: AuditStatus
  failureCode: FailureCode | null
  score: number | null
  summary: AuditSummary | null
  fixes: Fix[]
  checks: CheckResult[]
  variant: AuditVariant
  fetchMs: number | null
  checkMs: number | null
  modelMs: number | null
  model: string | null
  costUsdMicros: number
  viewedAt: string | null
  viewCount: number
  expiresAt: string
  createdAt: string
  finishedAt: string | null
}

/** What an agency is allowed to do. Derived from the plan, never read from Stripe. */
export interface Entitlements {
  agencyId: string
  auditsPerMonth: number
  embedKeysMax: number
  teamSeats: number
  concurrentAudits: number
  hidePoweredBy: boolean
  pdf: boolean
  webhook: boolean
  export: boolean
  customDomain: boolean
  retentionDaysMax: number
  source: 'plan' | 'manual' | 'trial'
}

export interface UsageMonthly {
  agencyId: string
  period: string
  auditsUsed: number
  auditsLimit: number
  resetsAt: string
}

export interface StatsDaily {
  agencyId: string
  day: string
  formViews: number
  submits: number
  auditsDone: number
  auditsFailed: number
  reportViews: number
  ctaClicks: number
  leadsNew: number
}
