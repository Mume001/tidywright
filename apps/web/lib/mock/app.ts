import { PLANS, type Agency, type Lead } from '@tw/shared'
import { mock } from '@tw/shared/mocks'
import type { OverviewKpi, OverviewLead } from '@tw/ui'

/**
 * What the application screens read until B1. Same shape the API will return,
 * so the swap is one import per screen and no component changes.
 *
 * docs/31-build-plan.md F2a. Everything here is derived from the seeded dataset
 * in packages/shared/mocks, so two runs of the app show the same numbers and a
 * screenshot taken today still matches tomorrow.
 */

/** The signed in human. In B1 this is the session. */
export function currentUser() {
  const user = mock.users[0]!
  return { email: user.email, fullName: user.fullName }
}

/** Every agency this user belongs to, for the picker. */
export function myAgencies(): Agency[] {
  const mine = new Set(
    mock.memberships.filter((m) => m.userId === mock.users[0]!.id).map((m) => m.agencyId),
  )
  const agencies = mock.agencies.filter((a) => mine.has(a.id))
  return agencies.length > 0 ? agencies : mock.agencies.slice(0, 2)
}

export function agencyOr(id: string | undefined): Agency {
  return myAgencies().find((a) => a.id === id) ?? myAgencies()[0]!
}

export function agoLabel(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function hostOfUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** The last thirty rows of stats for one agency, oldest first. */
function statsFor(agencyId: string) {
  return mock.stats
    .filter((s) => s.agencyId === agencyId)
    .sort((a, b) => a.day.localeCompare(b.day))
    .slice(-30)
}

function weekSum(values: readonly number[], offset = 0): number {
  const end = values.length - offset * 7
  return values.slice(Math.max(0, end - 7), end).reduce((a, b) => a + b, 0)
}

/** Whole per cent, and zero rather than Infinity when last week was empty. */
function delta(values: readonly number[]): number {
  const now = weekSum(values)
  const before = weekSum(values, 1)
  if (before === 0) return now === 0 ? 0 : 100
  return Math.round(((now - before) / before) * 100)
}

export function overviewKpis(agencyId: string): OverviewKpi[] {
  const stats = statsFor(agencyId)
  const series = {
    audits: stats.map((s) => s.auditsDone),
    leads: stats.map((s) => s.leadsNew),
    views: stats.map((s) => s.reportViews),
    clicks: stats.map((s) => s.ctaClicks),
  }

  return [
    {
      label: 'Audits this week',
      value: weekSum(series.audits),
      delta: delta(series.audits),
      spark: series.audits.slice(-7),
    },
    {
      label: 'Leads this week',
      value: weekSum(series.leads),
      delta: delta(series.leads),
      spark: series.leads.slice(-7),
    },
    {
      label: 'Report views',
      value: weekSum(series.views),
      delta: delta(series.views),
      spark: series.views.slice(-7),
    },
    {
      label: 'Call to action clicks',
      value: weekSum(series.clicks),
      delta: delta(series.clicks),
      spark: series.clicks.slice(-7),
    },
  ]
}

export function overviewChart(agencyId: string) {
  return statsFor(agencyId).map((s) => ({ day: s.day, value: s.auditsDone }))
}

function scoreForLead(lead: Lead): number | null {
  const audit = mock.audits.find((a) => a.leadId === lead.id && a.status === 'done')
  return audit?.score ?? null
}

export function recentLeads(agencyId: string, limit = 8): OverviewLead[] {
  return mock.leads
    .filter((l) => l.agencyId === agencyId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
    .map((lead) => ({
      id: lead.id,
      email: lead.email,
      host: lead.siteHost,
      score: scoreForLead(lead),
      ago: agoLabel(lead.createdAt),
      href: `/leads/${lead.id}`,
    }))
}

/** Hosts an audit has actually arrived from, which is not the same as configured. */
export function installedHosts(agencyId: string): string[] {
  const hosts = new Set(
    mock.leads
      .filter((l) => l.agencyId === agencyId && l.sourceUrl)
      .map((l) => hostOfUrl(l.sourceUrl!)),
  )
  return [...hosts].slice(0, 4)
}

/**
 * Only on the free plan, because on a paid one this line is noise.
 *
 * Monthly, not daily. docs/15-frontend-spec.md 3.3 says "used today" and
 * docs/22-security.md says fifty a day, but PLANS and the usage_monthly table
 * both count a month, and the code is what the screen has to agree with.
 */
export function usageFor(agencyId: string) {
  const agency = agencyOr(agencyId)
  if (agency.plan !== 'free') return undefined

  const usage = mock.usage.find((u) => u.agencyId === agencyId)
  return {
    used: usage?.auditsUsed ?? 0,
    limit: usage?.auditsLimit ?? PLANS.free.limits.auditsPerMonth,
    plan: PLANS.free.name,
  }
}

/** The three numbers the pilot agreement asks the first five agencies for. */
export function pilotNumbers(agencyId: string) {
  const stats = statsFor(agencyId)
  const submits = stats.reduce((a, s) => a + s.submits, 0)
  const views = stats.reduce((a, s) => a + s.formViews, 0)
  const clicks = stats.reduce((a, s) => a + s.ctaClicks, 0)
  const reportViews = stats.reduce((a, s) => a + s.reportViews, 0)

  return {
    auditsThisMonth: stats.reduce((a, s) => a + s.auditsDone, 0),
    leadRate: views === 0 ? 0 : Math.round((submits / views) * 100),
    ctaRate: reportViews === 0 ? 0 : Math.round((clicks / reportViews) * 100),
  }
}

/** True once any audit exists, which is what makes the overview stop being empty. */
export function hasAnyAudit(agencyId: string): boolean {
  return mock.audits.some((a) => a.agencyId === agencyId)
}

export function embedSnippet(publicKey: string, host = 'https://siteauditserver.com'): string {
  return [
    `<div id="tw-audit"></div>`,
    `<script src="${host}/embed.js" data-key="${publicKey}" defer></script>`,
  ].join('\n')
}

export function firstEmbedKey(agencyId: string): string {
  return mock.embedKeys.find((k) => k.agencyId === agencyId)?.publicKey ?? 'pk_live_demo'
}
