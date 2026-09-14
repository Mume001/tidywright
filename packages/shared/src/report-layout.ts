import { GROUP_INTROS, GROUP_LABELS, SEVERITY_WEIGHT } from './checks-catalog'
import { ALL_GROUPS, scoreGroup } from './score'
import type { AuditSummary, CheckGroup, CheckResult, Fix, FixKind } from './types'

/**
 * How 176 checks become a page somebody reads. docs/15-frontend-spec.md,
 * "Raspored izvještaja kad ima 174 nalaza".
 *
 * The order is fixed and it is the whole design:
 *
 *   1. score, ten group bars, one sentence naming the worst area
 *   2. the three written fixes, open
 *   3. "Fix this first", six findings from summary.priority
 *   4. the rest, blurred, under the agency's call to action
 *   5. every check, grouped and collapsed
 *
 * This module is the pure half of that: which finding belongs in which row, in
 * which order. It holds no markup so the report, the PDF in phase 2 and the
 * audit detail screen in F2 all lay out the same findings the same way.
 */

/**
 * Which checks a written fix already answers. A finished title, pasted and
 * ready, must not be followed two inches later by "your title is too short".
 * The same finding cannot appear in row 2 and again in rows 3 or 4.
 */
const FIX_COVERS: Record<FixKind, readonly string[]> = {
  title: ['title_'],
  meta: ['meta_'],
  jsonld: ['jsonld_', 'org_', 'localbusiness_'],
  h1: ['h1_'],
  og: ['og_'],
  alt: ['img_alt_'],
}

export function codesCoveredByFixes(
  fixes: readonly Fix[],
  checks: readonly CheckResult[],
): Set<string> {
  const prefixes = fixes.flatMap((fix) => FIX_COVERS[fix.kind] ?? [])
  const covered = new Set<string>()
  for (const check of checks) {
    if (prefixes.some((prefix) => check.code.startsWith(prefix))) covered.add(check.code)
  }
  return covered
}

/** A check that did not run tells the visitor nothing. It is never shown. */
export function ran(check: CheckResult): boolean {
  return check.status !== 'skipped'
}

export function isProblem(check: CheckResult): boolean {
  return check.status === 'fail' || check.status === 'warn'
}

/** Failures first, then warnings, then the passes, greyed out at the bottom. */
const STATUS_ORDER: Record<CheckResult['status'], number> = {
  fail: 0,
  warn: 1,
  pass: 2,
  skipped: 3,
}

function byStatusThenSeverity(a: CheckResult, b: CheckResult): number {
  const status = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
  if (status !== 0) return status
  return SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity]
}

export interface ReportGroup {
  group: CheckGroup
  label: string
  intro: string
  /** Scored on the checks that actually ran, never on the ones that did not. */
  score: number
  ran: number
  problems: number
  allPassed: boolean
  checks: CheckResult[]
}

/**
 * The ten bars, in the order the score weights them, so the group that costs the
 * most sits first. A group where nothing ran is left out: a page with no images
 * is not given a green bar for image checks it never made.
 */
export function buildGroups(checks: readonly CheckResult[]): ReportGroup[] {
  const groups: ReportGroup[] = []

  for (const group of ALL_GROUPS) {
    const mine = checks.filter((c) => c.group === group && ran(c))
    if (mine.length === 0) continue
    const score = scoreGroup(mine)
    if (score === null) continue

    const problems = mine.filter(isProblem).length
    groups.push({
      group,
      label: GROUP_LABELS[group],
      intro: GROUP_INTROS[group],
      score,
      ran: mine.length,
      problems,
      allPassed: problems === 0,
      checks: [...mine].sort(byStatusThenSeverity),
    })
  }

  return groups
}

/** The count in a collapsed group header. */
export function groupCountLabel(group: ReportGroup): string {
  if (group.allPassed) return `All ${group.ran} passed`
  return `${group.problems} of ${group.ran} need attention`
}

export interface ReportLayout {
  groups: ReportGroup[]
  /** Row 2. Empty on the score_only variant, where only the labels are shown. */
  fixes: Fix[]
  /** Row 3, "Fix this first". */
  priority: CheckResult[]
  /** Row 4, blurred under the agency's call to action. */
  locked: CheckResult[]
  /** Everything that failed or warned, however it is presented. */
  problemCount: number
  passedCount: number
}

export interface ReportLayoutInput {
  checks: readonly CheckResult[]
  fixes: readonly Fix[]
  summary: AuditSummary | null
  /** Row 3 length. docs/15-frontend-spec.md says six. */
  priorityLimit?: number
}

export function buildReportLayout({
  checks,
  fixes,
  summary,
  priorityLimit = 6,
}: ReportLayoutInput): ReportLayout {
  const shown = checks.filter(ran)
  const covered = codesCoveredByFixes(fixes, shown)
  const byCode = new Map(shown.map((c) => [c.code, c]))

  const priority: CheckResult[] = []
  for (const code of summary?.priority ?? []) {
    if (priority.length >= priorityLimit) break
    const check = byCode.get(code)
    if (!check || covered.has(code) || !isProblem(check)) continue
    priority.push(check)
  }

  const inPriority = new Set(priority.map((c) => c.code))
  const locked = shown
    .filter((c) => isProblem(c) && !covered.has(c.code) && !inPriority.has(c.code))
    .sort(byStatusThenSeverity)

  return {
    groups: buildGroups(shown),
    fixes: [...fixes],
    priority,
    locked,
    problemCount: shown.filter(isProblem).length,
    passedCount: shown.filter((c) => c.status === 'pass').length,
  }
}

/**
 * The sentence under the score. Written by a rule, never by the model, so it is
 * true by construction and identical for two pages with the same findings.
 * docs/15-frontend-spec.md 2.1.
 */
export function biggestProblemSentence(layout: ReportLayout, criticalCount: number): string {
  if (layout.problemCount === 0) {
    return `All ${layout.passedCount} checks passed. There is nothing here we would change today.`
  }

  const worst = layout.groups.reduce<ReportGroup | null>(
    (lowest, group) => (lowest === null || group.score < lowest.score ? group : lowest),
    null,
  )

  const head =
    criticalCount > 0
      ? `${criticalCount} critical ${criticalCount === 1 ? 'problem' : 'problems'} are holding this page back.`
      : `${layout.problemCount} ${layout.problemCount === 1 ? 'thing is' : 'things are'} worth fixing.`

  if (!worst) return head
  return `${head} The weakest area is ${worst.label.toLowerCase()}, at ${worst.score} out of 100.`
}
