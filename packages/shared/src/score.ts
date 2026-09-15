import {
  CHECK_IMPACT,
  DEFAULT_IMPACT,
  GROUP_WEIGHTS,
  IMPACT_RANK,
  SEVERITY_WEIGHT,
} from './checks-catalog'
import type { CheckGroup, CheckResult, Severity } from './types'

/**
 * How a page becomes a number. docs/05-checks.md.
 *
 * Two rules keep this honest as the catalogue grows:
 *
 *   1. A group is scored only on the checks that actually ran. A page with no
 *      images is not punished for having no alt text.
 *   2. The overall score weights groups by how much they matter to search, not by
 *      how many checks each happens to contain. Otherwise adding fourteen
 *      accessibility checks would quietly make accessibility the biggest factor
 *      on the site, which is not true and would make the number meaningless.
 */

export const ALL_GROUPS = Object.keys(GROUP_WEIGHTS) as CheckGroup[]

/** A failed check loses its full weight, a warning half of it. */
function lostWeight(status: CheckResult['status'], severity: Severity): number {
  if (status === 'fail') return SEVERITY_WEIGHT[severity]
  if (status === 'warn') return SEVERITY_WEIGHT[severity] / 2
  return 0
}

export function scoreGroup(checks: CheckResult[]): number | null {
  const ran = checks.filter((c) => c.status !== 'skipped')
  if (ran.length === 0) return null
  const total = ran.reduce((sum, c) => sum + SEVERITY_WEIGHT[c.severity], 0)
  const lost = ran.reduce((sum, c) => sum + lostWeight(c.status, c.severity), 0)
  return Math.round(((total - lost) / total) * 100)
}

export interface ScoreBreakdown {
  score: number
  groups: Partial<Record<CheckGroup, number>>
  counts: { critical: number; warning: number; notice: number; passed: number }
}

export function scoreChecks(checks: CheckResult[]): ScoreBreakdown {
  const groups: Partial<Record<CheckGroup, number>> = {}
  let weighted = 0
  let weightUsed = 0

  for (const group of ALL_GROUPS) {
    const value = scoreGroup(checks.filter((c) => c.group === group))
    if (value === null) continue
    groups[group] = value
    weighted += value * GROUP_WEIGHTS[group]
    weightUsed += GROUP_WEIGHTS[group]
  }

  const failed = checks.filter((c) => c.status === 'fail')
  const counts = {
    critical: failed.filter((c) => c.severity === 'critical').length,
    warning: checks.filter(
      (c) => c.status === 'warn' || (c.status === 'fail' && c.severity === 'warning'),
    ).length,
    notice: failed.filter((c) => c.severity === 'notice').length,
    passed: checks.filter((c) => c.status === 'pass').length,
  }

  return {
    score: weightUsed === 0 ? 100 : Math.max(0, Math.min(100, Math.round(weighted / weightUsed))),
    groups,
    counts,
  }
}

/**
 * What the report leads with. Nobody reads 176 rows; they read the first six.
 *
 * Impact times severity decides the band, then group weight, then whether we can
 * hand over a finished fix, then failure over warning. The first term is the one
 * that changed after docs/35-fix-effectiveness.md: ordering by group weight alone
 * put a shouting title above lorem ipsum, because page tags is a heavy group and
 * content is a lighter one. Group weight says how much an area matters, which is
 * not the same question as how much this one check is worth.
 *
 * Multiplied rather than added, on purpose. Adding would let a cosmetic SERP
 * notice outrank a critical quality problem, which is the same mistake in a new
 * coat. A missing title still leads. A shouting one no longer does.
 */
export function prioritise(checks: CheckResult[], fixableCodes: ReadonlySet<string>): string[] {
  return checks
    .filter((c) => c.status === 'fail' || c.status === 'warn')
    .map((c) => ({
      code: c.code,
      rank:
        IMPACT_RANK[CHECK_IMPACT[c.code] ?? DEFAULT_IMPACT] * SEVERITY_WEIGHT[c.severity] * 100 +
        (GROUP_WEIGHTS[c.group] ?? 0) +
        (fixableCodes.has(c.code) ? 10 : 0) +
        (c.status === 'fail' ? 5 : 0),
    }))
    .sort((a, b) => b.rank - a.rank)
    .map((c) => c.code)
}
