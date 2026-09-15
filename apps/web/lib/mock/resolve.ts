import { mock, SITES } from '@tw/shared/mocks'
import type { Agency, Audit, Branding, EmbedKey, Lead } from '@tw/shared'

/**
 * Reading the F0 mock dataset the way the API will read the database in B4.
 *
 * Every lookup here has a matching route in docs/17-backend-spec.md, and nothing
 * outside this folder knows the data is fake. When B1 lands, these functions get
 * a Supabase query and the screens do not change.
 *
 * The dataset is generated from seed 42, so its keys and tokens are stable but
 * unreadable. The demo aliases below exist so a test page, a bookmark and a
 * phone can all reach a known state without anyone copying a 32 character token.
 */

/** The key printed in public/test-embed.html. */
export const DEMO_KEY = 'pk_live_demo'

export const DEMO_TOKENS = {
  done: 'demo-done',
  clean: 'demo-clean',
  pending: 'demo-pending',
  pendingStuck: 'demo-pending-stuck',
  failedFetch: 'demo-failed-fetch',
  failedBlocked: 'demo-failed-blocked',
  expired: 'demo-expired',
  scoreOnly: 'demo-score-only',
} as const

export type DemoToken = (typeof DEMO_TOKENS)[keyof typeof DEMO_TOKENS]

export function agencyById(id: string): Agency | null {
  return mock.agencies.find((a) => a.id === id) ?? null
}

export function agencyBySlug(slug: string): Agency | null {
  return mock.agencies.find((a) => a.slug === slug.toLowerCase()) ?? null
}

export function brandingFor(agencyId: string): Branding | null {
  return mock.branding.find((b) => b.agencyId === agencyId) ?? null
}

/** The agency the whole demo runs as: paid, branded, with a booking link. */
export function demoAgency(): Agency {
  return mock.agencies[0]!
}

export function keyByPublicKey(publicKey: string): EmbedKey | null {
  if (publicKey === DEMO_KEY) {
    return (
      mock.embedKeys.find((k) => k.agencyId === demoAgency().id && k.status === 'active') ?? null
    )
  }
  return mock.embedKeys.find((k) => k.publicKey === publicKey) ?? null
}

export function leadById(id: string): Lead | null {
  return mock.leads.find((l) => l.id === id) ?? null
}

/** The alias printed on the test page, so /u/ is reachable without copying 43 characters. */
export const DEMO_UNSUBSCRIBE_TOKEN = 'demo-lead'

/**
 * Resolves the /u/<token> link by unsubscribe_token and by nothing else.
 *
 * Never by id: whoever ends up holding this link, and it travels through mail
 * servers and log files to get anywhere, must not thereby hold a primary key.
 * docs/18-data-model.md.
 */
export function leadByToken(token: string): Lead | null {
  if (token === DEMO_UNSUBSCRIBE_TOKEN) {
    return mock.leads.find((l) => l.unsubscribeToken !== null) ?? null
  }
  return mock.leads.find((l) => l.unsubscribeToken !== null && l.unsubscribeToken === token) ?? null
}

function baseDoneAudit(): Audit {
  const found = mock.audits.find(
    (a) => a.status === 'done' && a.summary !== null && a.fixes.length === 3 && a.score !== null,
  )
  if (!found) throw new Error('mock data has no finished audit to build the demo reports from')
  return found
}

let auditCounter = 0

/** A row id for a mock audit, unrelated to its public token. */
function mockAuditId(): string {
  auditCounter += 1
  return `mock-audit-${auditCounter.toString(36).padStart(6, '0')}`
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

/**
 * Every name this audit currently calls the business. The lead's fixture name is
 * the original one; the host is what a report that has already been moved once
 * carries, and that is the one the text actually uses by then.
 */
function currentNames(audit: Audit): string[] {
  const lead = audit.leadId ? leadById(audit.leadId) : null
  const fromLead = SITES.find((s) => s.host === lead?.siteHost)?.name
  return [fromLead, brandNameFromHost(hostOf(audit.url))].filter(
    (name): name is string => typeof name === 'string' && name.length > 0,
  )
}

/**
 * Rewrites a finished audit onto another address. The checks and the score stay
 * exactly as the mock generated them; only the words naming the business and the
 * host change, so a report for a domain Mume actually types does not talk about
 * somebody else's bakery, and the JSON-LD does not carry a stranger's URL.
 */
export function retargetAudit(
  base: Audit,
  to: { url: string; host: string },
  token: string,
): Audit {
  const fromHost = hostOf(base.url)
  const brand = brandNameFromHost(to.host)
  const names = currentNames(base).filter((name) => name !== brand)

  const swap = (text: string) => {
    let out = text
    for (const name of names) out = out.split(name).join(brand)
    return out.split(fromHost).join(to.host)
  }

  return {
    ...base,
    // Its own value, not `mock-${token}`. An id that spells out the token means
    // anyone who sees the id in the agency app can open the public report, which
    // is the same mistake as an unsubscribe link built from a primary key.
    id: mockAuditId(),
    token,
    url: to.url,
    finalUrl: to.url,
    fixes: base.fixes.map((fix) => ({
      ...fix,
      before: fix.before === null ? null : swap(fix.before),
      after: swap(fix.after),
      reasons: fix.reasons.map(swap),
    })),
  }
}

/** northwind-client.com becomes Northwind Client. Good enough to read. */
export function brandNameFromHost(host: string): string {
  const name = host.replace(/^www\./, '').split('.')[0] ?? host
  return name
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join(' ')
}

let demoCache: Map<string, Audit> | null = null

/**
 * One audit per state the report has to render. Built once, from the same seeded
 * data as everything else, so a story, the test page and a phone all show the
 * same thing.
 */
export function demoAudits(): Map<string, Audit> {
  if (demoCache) return demoCache

  const base = baseDoneAudit()
  const target = { url: 'https://northwind-client.com/', host: 'northwind-client.com' }
  const done = retargetAudit(base, target, DEMO_TOKENS.done)

  const map = new Map<string, Audit>()
  map.set(DEMO_TOKENS.done, done)

  // Nothing failed. The report praises the page instead of showing an empty space.
  const cleanChecks = done.checks.map((c) => ({
    ...c,
    status: 'pass' as const,
    detail: 'Looks right.',
    evidence: null,
  }))
  map.set(DEMO_TOKENS.clean, {
    ...done,
    token: DEMO_TOKENS.clean,
    score: 100,
    checks: cleanChecks,
    fixes: [],
    summary: done.summary && {
      ...done.summary,
      counts: { critical: 0, warning: 0, notice: 0, passed: cleanChecks.length },
      priority: [],
      failed: [],
      warnings: [],
      passed: cleanChecks.map((c) => c.code),
      headline: 'Nothing to fix today',
      intro: 'Every check we run on a single page came back clean.',
    },
  })

  map.set(DEMO_TOKENS.scoreOnly, { ...done, token: DEMO_TOKENS.scoreOnly, variant: 'score_only' })

  for (const [token, failureCode] of [
    [DEMO_TOKENS.failedFetch, 'fetch_timeout'],
    [DEMO_TOKENS.failedBlocked, 'blocked'],
  ] as const) {
    map.set(token, {
      ...done,
      token,
      status: 'failed',
      failureCode,
      score: null,
      summary: null,
      checks: [],
      fixes: [],
    })
  }

  map.set(DEMO_TOKENS.expired, {
    ...done,
    token: DEMO_TOKENS.expired,
    status: 'expired',
    score: null,
    summary: null,
    checks: [],
    fixes: [],
  })

  for (const token of [DEMO_TOKENS.pending, DEMO_TOKENS.pendingStuck]) {
    map.set(token, {
      ...done,
      token,
      status: 'queued',
      score: null,
      summary: null,
      checks: [],
      fixes: [],
      finishedAt: null,
    })
  }

  demoCache = map
  return map
}

/** The finished audit every created and demo report is cloned from. */
export function demoBaseAudit(): Audit {
  return demoAudits().get(DEMO_TOKENS.done)!
}

/** Lookup across the seeded audits and the demo aliases. No mutable state. */
export function staticAuditByToken(token: string): Audit | null {
  return demoAudits().get(token) ?? mock.audits.find((a) => a.token === token) ?? null
}

/**
 * Where the report's call to action points. docs/15-frontend-spec.md 2.1: the
 * agency's own link, then their calendar, and if they have set up neither, an
 * email to the owner. The button is the whole reason the report exists, so it
 * never renders as a dead end.
 */
export function ctaUrlFor(agency: Agency, branding: Branding): string {
  if (branding.ctaUrl) return branding.ctaUrl
  if (branding.calendarUrl) return branding.calendarUrl
  const owner = mock.users.find((u) => u.id === agency.ownerUserId)
  return owner ? `mailto:${owner.email}` : '#'
}

export interface ResolvedReport {
  audit: Audit
  agency: Agency
  branding: Branding
  lead: Lead | null
}

export function reportContext(audit: Audit): ResolvedReport | null {
  const agency = agencyById(audit.agencyId)
  const branding = brandingFor(audit.agencyId)
  if (!agency || !branding) return null
  return { audit, agency, branding, lead: audit.leadId ? leadById(audit.leadId) : null }
}

export interface ResolvedForm {
  agency: Agency
  branding: Branding
  embedKey: EmbedKey
}

export function formContextByKey(publicKey: string): ResolvedForm | null {
  const embedKey = keyByPublicKey(publicKey)
  if (!embedKey || embedKey.status !== 'active') return null
  const agency = agencyById(embedKey.agencyId)
  const branding = brandingFor(embedKey.agencyId)
  if (!agency || !branding) return null
  return { agency, branding, embedKey }
}

export function formContextBySlug(slug: string): ResolvedForm | null {
  const agency = agencyBySlug(slug)
  if (!agency || agency.status !== 'active') return null
  const branding = brandingFor(agency.id)
  const embedKey = mock.embedKeys.find((k) => k.agencyId === agency.id && k.status === 'active')
  if (!branding || !embedKey) return null
  return { agency, branding, embedKey }
}
