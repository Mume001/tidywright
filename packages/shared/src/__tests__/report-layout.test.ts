import { describe, expect, it } from 'vitest'
import {
  biggestProblemSentence,
  buildGroups,
  buildReportLayout,
  codesCoveredByFixes,
  groupCountLabel,
} from '../report-layout'
import { GROUP_WEIGHTS } from '../checks-catalog'
import { mock } from '../mocks'
import type { AuditSummary, CheckGroup, CheckResult, Fix, Severity } from '../types'

function check(
  code: string,
  group: CheckGroup,
  status: CheckResult['status'],
  severity: Severity = 'warning',
): CheckResult {
  return { code, group, severity, status, title: code, detail: 'detail', evidence: null }
}

const FIXES: Fix[] = [
  {
    kind: 'title',
    severity: 'critical',
    label: 'Title tag',
    before: null,
    after: 'x',
    reasons: [],
  },
  { kind: 'meta', severity: 'critical', label: 'Meta', before: null, after: 'y', reasons: [] },
]

function summary(priority: string[]): AuditSummary {
  return {
    groups: {} as AuditSummary['groups'],
    counts: { critical: 0, warning: 0, notice: 0, passed: 0 },
    priority,
    passed: [],
    failed: [],
    warnings: [],
    headline: 'h',
    intro: 'i',
  }
}

describe('codesCoveredByFixes', () => {
  it('claims every check a written fix answers', () => {
    const checks = [
      check('title_present', 'tags', 'fail'),
      check('title_length', 'tags', 'warn'),
      check('meta_present', 'tags', 'fail'),
      check('h1_present', 'content', 'fail'),
    ]
    expect([...codesCoveredByFixes(FIXES, checks)].sort()).toEqual([
      'meta_present',
      'title_length',
      'title_present',
    ])
  })

  it('claims nothing when there are no fixes, which is the score_only report', () => {
    expect(codesCoveredByFixes([], [check('title_present', 'tags', 'fail')]).size).toBe(0)
  })
})

describe('buildGroups', () => {
  it('leaves out a group where nothing ran, instead of showing false green', () => {
    const groups = buildGroups([
      check('title_present', 'tags', 'fail'),
      check('img_alt_present', 'media', 'skipped'),
    ])
    expect(groups.map((g) => g.group)).toEqual(['tags'])
  })

  it('orders groups by what they cost in the score', () => {
    const groups = buildGroups([
      check('a11y_x', 'accessibility', 'pass'),
      check('title_present', 'tags', 'pass'),
      check('page_status', 'indexing', 'pass'),
    ])
    const weights = groups.map((g) => GROUP_WEIGHTS[g.group])
    expect(weights).toEqual([...weights].sort((a, b) => b - a))
  })

  it('sorts failures first, then warnings, then passes', () => {
    const group = buildGroups([
      check('c', 'tags', 'pass'),
      check('a', 'tags', 'fail'),
      check('b', 'tags', 'warn'),
    ])[0]!
    expect(group.checks.map((c) => c.code)).toEqual(['a', 'b', 'c'])
  })

  it('puts the heavier severity first inside one status', () => {
    const group = buildGroups([
      check('light', 'tags', 'fail', 'notice'),
      check('heavy', 'tags', 'fail', 'critical'),
    ])[0]!
    expect(group.checks.map((c) => c.code)).toEqual(['heavy', 'light'])
  })

  it('scores a group only on what ran', () => {
    const group = buildGroups([
      check('a', 'tags', 'pass', 'critical'),
      check('b', 'tags', 'skipped', 'critical'),
    ])[0]!
    expect(group.score).toBe(100)
    expect(group.ran).toBe(1)
    expect(group.allPassed).toBe(true)
    expect(groupCountLabel(group)).toBe('All 1 passed')
  })

  it('counts warnings as needing attention', () => {
    const group = buildGroups([check('a', 'tags', 'warn'), check('b', 'tags', 'pass')])[0]!
    expect(groupCountLabel(group)).toBe('1 of 2 need attention')
  })
})

describe('buildReportLayout', () => {
  const checks = [
    check('title_present', 'tags', 'fail', 'critical'),
    check('meta_present', 'tags', 'fail', 'critical'),
    check('h1_present', 'content', 'fail', 'critical'),
    check('og_image', 'social', 'warn'),
    check('img_lazy', 'media', 'warn', 'notice'),
    check('https_active', 'indexing', 'pass', 'critical'),
    check('img_alt_present', 'media', 'skipped'),
  ]

  it('never repeats a finding the three fixes already answered', () => {
    const layout = buildReportLayout({
      checks,
      fixes: FIXES,
      summary: summary(['title_present', 'meta_present', 'h1_present', 'og_image']),
    })
    expect(layout.priority.map((c) => c.code)).toEqual(['h1_present', 'og_image'])
    expect(layout.locked.map((c) => c.code)).toEqual(['img_lazy'])
  })

  it('shows the covered findings again when there are no written fixes', () => {
    const layout = buildReportLayout({
      checks,
      fixes: [],
      summary: summary(['title_present', 'meta_present']),
    })
    expect(layout.priority.map((c) => c.code)).toEqual(['title_present', 'meta_present'])
  })

  it('caps the priority row at six', () => {
    const many = Array.from({ length: 12 }, (_, i) => check(`c${i}`, 'content', 'fail'))
    const layout = buildReportLayout({
      checks: many,
      fixes: [],
      summary: summary(many.map((c) => c.code)),
    })
    expect(layout.priority).toHaveLength(6)
    expect(layout.locked).toHaveLength(6)
  })

  it('ignores a priority code for a check that passed or never ran', () => {
    const layout = buildReportLayout({
      checks,
      fixes: [],
      summary: summary(['https_active', 'img_alt_present', 'og_image']),
    })
    expect(layout.priority.map((c) => c.code)).toEqual(['og_image'])
  })

  it('survives an audit with no summary, which is every pending report', () => {
    const layout = buildReportLayout({ checks, fixes: [], summary: null })
    expect(layout.priority).toEqual([])
    expect(layout.locked).toHaveLength(5)
    expect(layout.problemCount).toBe(5)
    expect(layout.passedCount).toBe(1)
  })

  it('counts only checks that ran', () => {
    const layout = buildReportLayout({ checks, fixes: [], summary: null })
    expect(layout.problemCount + layout.passedCount).toBe(checks.length - 1)
  })
})

describe('biggestProblemSentence', () => {
  it('names the weakest area and the count of critical problems', () => {
    const layout = buildReportLayout({
      checks: [
        check('title_present', 'tags', 'fail', 'critical'),
        check('meta_present', 'tags', 'fail', 'critical'),
        check('https_active', 'indexing', 'pass', 'critical'),
      ],
      fixes: [],
      summary: null,
    })
    expect(biggestProblemSentence(layout, 2)).toBe(
      '2 critical problems are holding this page back. The weakest area is page tags, at 0 out of 100.',
    )
  })

  it('agrees with itself when there is exactly one critical problem', () => {
    const layout = buildReportLayout({
      checks: [
        check('title_present', 'tags', 'fail', 'critical'),
        check('https_active', 'indexing', 'pass', 'critical'),
      ],
      fixes: [],
      summary: null,
    })
    expect(biggestProblemSentence(layout, 1)).toContain('1 critical problem is holding this page')
  })

  it('does not say critical when nothing is', () => {
    const layout = buildReportLayout({
      checks: [check('og_image', 'social', 'warn')],
      fixes: [],
      summary: null,
    })
    expect(biggestProblemSentence(layout, 0)).toContain('1 thing is worth fixing.')
  })

  it('praises a clean page instead of leaving an empty space', () => {
    const layout = buildReportLayout({
      checks: [check('a', 'tags', 'pass'), check('b', 'tags', 'pass')],
      fixes: [],
      summary: null,
    })
    expect(biggestProblemSentence(layout, 0)).toBe(
      'All 2 checks passed. There is nothing here we would change today.',
    )
  })
})

describe('against the mock data', () => {
  const audit = mock.audits.find((a) => a.status === 'done' && a.summary !== null)!

  it('lays out a real audit without losing or duplicating a finding', () => {
    const layout = buildReportLayout({
      checks: audit.checks,
      fixes: audit.fixes,
      summary: audit.summary,
    })
    const covered = codesCoveredByFixes(audit.fixes, audit.checks)
    const shown = [...layout.priority, ...layout.locked].map((c) => c.code)

    expect(new Set(shown).size).toBe(shown.length)
    expect(shown.some((code) => covered.has(code))).toBe(false)
    expect(shown.length + [...covered].filter((c) => c !== undefined).length).toBeGreaterThan(0)
    expect(layout.groups.length).toBeGreaterThan(5)
  })

  it('gives every group a bar with a label and a sentence', () => {
    const layout = buildReportLayout({
      checks: audit.checks,
      fixes: audit.fixes,
      summary: audit.summary,
    })
    for (const group of layout.groups) {
      expect(group.label.length).toBeGreaterThan(2)
      expect(group.intro.length).toBeGreaterThan(20)
      expect(group.score).toBeGreaterThanOrEqual(0)
      expect(group.score).toBeLessThanOrEqual(100)
    }
  })
})
