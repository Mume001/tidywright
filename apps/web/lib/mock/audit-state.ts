import type { Audit, AuditStatus } from '@tw/shared'
import {
  demoBaseAudit,
  DEMO_TOKENS,
  hostOf,
  retargetAudit,
  staticAuditByToken,
  type ResolvedForm,
} from './resolve'

/**
 * The only moving part in the F1 mock: an audit that is not finished yet.
 *
 * The report has to poll something, and a status that never changes proves
 * nothing. So a submitted or demo audit walks the same states the worker will
 * walk in B2, on a clock, and the page finds out about it exactly the way it
 * will find out about the real one.
 *
 * State lives in this module, which means it lives in one server process and
 * disappears on restart. That is fine for a mock and is the reason a report you
 * created before editing a file can go missing after the dev server reloads.
 */

/** Roughly the eight seconds docs/13-widget-spec.md aims for. */
const STEPS: readonly { until: number; status: AuditStatus }[] = [
  { until: 1_500, status: 'queued' },
  { until: 3_000, status: 'fetching' },
  { until: 4_500, status: 'checking' },
  { until: 7_000, status: 'generating' },
]

export const MOCK_RUN_MS = STEPS[STEPS.length - 1]!.until

interface Run {
  /** What the audit becomes once the clock runs out. */
  finished: Audit
  startedAt: number
  /** demo-pending-stuck, so the "taking longer than usual" copy is reachable. */
  frozen: boolean
}

const runs = new Map<string, Run>()
const submissions = new Map<string, string>()
const unsubscribed = new Set<string>()

/** Tests and the dev server both want a way back to a known state. */
export function resetMockAudits(): void {
  runs.clear()
  submissions.clear()
  unsubscribed.clear()
}

function isPending(status: AuditStatus): boolean {
  return status !== 'done' && status !== 'failed' && status !== 'expired'
}

function statusAt(run: Run, now: number): AuditStatus {
  if (run.frozen) return 'queued'
  const elapsed = now - run.startedAt
  for (const step of STEPS) {
    if (elapsed < step.until) return step.status
  }
  return 'done'
}

/** A pending audit shows its address and nothing else. There is no score yet. */
function pendingShape(finished: Audit, status: AuditStatus): Audit {
  return {
    ...finished,
    status,
    score: null,
    summary: null,
    checks: [],
    fixes: [],
    finishedAt: null,
  }
}

function finishedShape(finished: Audit, now: number): Audit {
  return { ...finished, status: 'done', finishedAt: new Date(now).toISOString() }
}

/**
 * What a finished version of this audit looks like. A seeded audit that is still
 * queued carries no findings of its own, so it borrows the demo report and wears
 * its own address.
 */
function finishedFor(audit: Audit): Audit {
  if (audit.checks.length > 0) return audit
  const base = retargetAudit(
    demoBaseAudit(),
    { url: audit.url, host: hostOf(audit.url) },
    audit.token,
  )
  return { ...base, id: audit.id, agencyId: audit.agencyId, leadId: audit.leadId }
}

/**
 * The single lookup every report route uses. Checks the running audits first,
 * then the seeded data and the demo aliases.
 */
export function findAudit(token: string, now = Date.now()): Audit | null {
  const run = runs.get(token)
  if (run) {
    const status = statusAt(run, now)
    return status === 'done' ? finishedShape(run.finished, now) : pendingShape(run.finished, status)
  }

  const audit = staticAuditByToken(token)
  if (!audit) return null
  if (!isPending(audit.status)) return audit

  // First look at a pending audit starts its clock, so the animation is always
  // seen from the beginning however long the tab sat closed.
  const fresh: Run = {
    finished: finishedFor(audit),
    startedAt: now,
    frozen: token === DEMO_TOKENS.pendingStuck,
  }
  runs.set(token, fresh)
  return pendingShape(fresh.finished, statusAt(fresh, now))
}

export interface CreateAuditInput {
  context: ResolvedForm
  url: string
  host: string
  email: string
  variant?: Audit['variant']
}

function dedupeKey(publicKey: string, url: string, email: string, now: number): string {
  const day = new Date(now).toISOString().slice(0, 10)
  return `${publicKey}|${url}|${email}|${day}`
}

/** An address already checked today gets the report it already has. */
export function existingSubmission(
  publicKey: string,
  url: string,
  email: string,
  now = Date.now(),
): string | null {
  return submissions.get(dedupeKey(publicKey, url, email, now)) ?? null
}

export function createAudit(input: CreateAuditInput, now = Date.now()): Audit {
  const token = `mk${Math.random().toString(36).slice(2, 12)}${now.toString(36)}`
  const base = retargetAudit(demoBaseAudit(), { url: input.url, host: input.host }, token)

  const finished: Audit = {
    ...base,
    agencyId: input.context.agency.id,
    leadId: null,
    variant: input.variant ?? 'full',
    url: input.url,
    finalUrl: input.url,
    createdAt: new Date(now).toISOString(),
    finishedAt: null,
  }

  runs.set(token, { finished, startedAt: now, frozen: false })
  submissions.set(dedupeKey(input.context.embedKey.publicKey, input.url, input.email, now), token)

  return pendingShape(finished, 'queued')
}

export function markUnsubscribed(token: string): void {
  unsubscribed.add(token)
}

export function isUnsubscribed(token: string): boolean {
  return unsubscribed.has(token)
}
