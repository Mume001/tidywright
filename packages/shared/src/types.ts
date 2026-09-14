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

/** Why an audit did not finish. The visitor sees a sentence per code, never the code. */
export type FailureCode =
  | 'fetch_timeout'
  | 'blocked'
  | 'dns'
  | 'too_large'
  | 'ssrf'
  | 'model'
  | 'model_rejected'
  | 'internal'

export type AuditVariant = 'full' | 'score_only'

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
export interface Consent {
  text: string
  version: string
  checked: boolean
  ts: string
  formUrl: string
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
