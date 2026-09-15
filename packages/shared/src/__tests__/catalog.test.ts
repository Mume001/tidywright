import { describe, expect, it } from 'vitest'
import {
  CHECKS,
  CHECKS_BY_CODE,
  CHECK_IMPACT,
  GROUP_INTROS,
  GROUP_LABELS,
  GROUP_WEIGHTS,
  IMPACT_RANK,
  PHASE_1_CHECKS,
} from '../checks-catalog'
import { ALL_GROUPS, prioritise, scoreChecks, scoreGroup } from '../score'
import { findAiTells } from '../fix-guard'
import type { CheckResult } from '../types'

describe('catalogue integrity', () => {
  it('has no duplicate codes', () => {
    const seen = new Map<string, number>()
    for (const c of CHECKS) seen.set(c.code, (seen.get(c.code) ?? 0) + 1)
    expect([...seen].filter(([, n]) => n > 1)).toEqual([])
  })

  it('indexes every check by code', () => {
    expect(CHECKS_BY_CODE.size).toBe(CHECKS.length)
  })

  it('uses a snake_case code for every check', () => {
    for (const c of CHECKS) expect(c.code).toMatch(/^[a-z][a-z0-9_]*$/)
  })

  it('gives every group at least six checks, so no score bar is decided by one item', () => {
    for (const group of ALL_GROUPS) {
      expect(CHECKS.filter((c) => c.group === group).length).toBeGreaterThanOrEqual(6)
    }
  })

  it('labels and explains every group', () => {
    for (const group of ALL_GROUPS) {
      expect(GROUP_LABELS[group]?.length).toBeGreaterThan(2)
      expect(GROUP_INTROS[group]?.length).toBeGreaterThan(30)
    }
  })

  it('weights the groups to exactly 100', () => {
    expect(Object.values(GROUP_WEIGHTS).reduce((a, b) => a + b, 0)).toBe(100)
  })

  it('writes every failure in a full sentence a business owner can read', () => {
    for (const c of CHECKS) {
      expect(c.title.length, c.code).toBeGreaterThan(3)
      expect(c.failText.length, c.code).toBeGreaterThan(40)
      expect(c.failText.endsWith('.'), c.code).toBe(true)
      // The report is our own copy. It has to clear the same bar we hold the model to.
      expect(findAiTells(c.failText), c.code).toEqual([])
    }
  })

  it('declares what each check needs before it can run', () => {
    const allowed = new Set(['html', 'headers', 'robots', 'sitemap', 'probe', 'render', 'crawl'])
    for (const c of CHECKS) {
      expect(c.needs.length, c.code).toBeGreaterThan(0)
      for (const n of c.needs) expect(allowed.has(n), `${c.code}: ${n}`).toBe(true)
    }
  })

  it('keeps the widget to a handful of requests, never a crawl', () => {
    for (const c of PHASE_1_CHECKS) {
      expect(c.needs, c.code).not.toContain('crawl')
    }
    const extra = new Set(
      PHASE_1_CHECKS.flatMap((c) => c.needs).filter((n) => n !== 'html' && n !== 'headers'),
    )
    // robots, sitemap and at most a couple of probes. Nothing that walks the site.
    expect([...extra].sort()).toEqual(['probe', 'robots', 'sitemap'])
  })

  it('can repair a meaningful share of what it reports', () => {
    const fixable = PHASE_1_CHECKS.filter((c) => c.fixable).length
    expect(fixable / PHASE_1_CHECKS.length).toBeGreaterThan(0.55)
  })
})

describe('impact labels', () => {
  it('labels every check, and labels nothing that is not a check', () => {
    const codes = new Set(CHECKS.map((c) => c.code))
    for (const c of CHECKS) expect(CHECK_IMPACT[c.code], c.code).toBeDefined()
    for (const code of Object.keys(CHECK_IMPACT)) expect(codes.has(code), code).toBe(true)
  })

  it('uses only the four labels', () => {
    const allowed = new Set(Object.keys(IMPACT_RANK))
    for (const c of CHECKS) expect(allowed.has(c.impact), `${c.code}: ${c.impact}`).toBe(true)
  })

  it('keeps blockers a short list, because that is the only claim we can make loudly', () => {
    const blockers = CHECKS.filter((c) => c.impact === 'blocker')
    expect(blockers.length).toBeGreaterThan(10)
    expect(blockers.length).toBeLessThan(30)
  })

  it('calls no accessibility check a search blocker', () => {
    for (const c of CHECKS.filter((c) => c.group === 'accessibility')) {
      expect(c.impact, c.code).toBe('hygiene')
    }
  })

  it('ranks the labels in the order the report reads them', () => {
    expect(IMPACT_RANK.blocker).toBeGreaterThan(IMPACT_RANK.serp)
    expect(IMPACT_RANK.serp).toBeGreaterThan(IMPACT_RANK.quality)
    expect(IMPACT_RANK.quality).toBeGreaterThan(IMPACT_RANK.hygiene)
  })
})

const check = (
  code: string,
  group: CheckResult['group'],
  severity: CheckResult['severity'],
  status: CheckResult['status'],
): CheckResult => ({ code, group, severity, status, title: code, detail: '', evidence: null })

describe('score', () => {
  it('gives a clean page 100', () => {
    expect(scoreGroup([check('a', 'tags', 'critical', 'pass')])).toBe(100)
  })

  it('gives a wholly broken group 0', () => {
    expect(scoreGroup([check('a', 'tags', 'critical', 'fail')])).toBe(0)
  })

  it('costs a warning half of what a failure costs', () => {
    expect(scoreGroup([check('a', 'tags', 'critical', 'warn')])).toBe(50)
  })

  it('ignores checks that never ran, so a page with no images is not punished', () => {
    const withImages = scoreChecks([
      check('a', 'tags', 'critical', 'pass'),
      check('b', 'media', 'warning', 'fail'),
    ])
    const withoutImages = scoreChecks([
      check('a', 'tags', 'critical', 'pass'),
      check('b', 'media', 'warning', 'skipped'),
    ])
    expect(withoutImages.score).toBeGreaterThan(withImages.score)
    expect(withoutImages.groups.media).toBeUndefined()
  })

  it('weights by what matters to search, not by how many checks a group has', () => {
    const brokenTags = scoreChecks([
      check('a', 'tags', 'critical', 'fail'),
      ...Array.from({ length: 14 }, (_, i) => check(`x${i}`, 'accessibility', 'notice', 'pass')),
    ])
    const brokenA11y = scoreChecks([
      check('a', 'tags', 'critical', 'pass'),
      ...Array.from({ length: 14 }, (_, i) => check(`x${i}`, 'accessibility', 'notice', 'fail')),
    ])
    // Fourteen accessibility notices must not outweigh one missing title.
    expect(brokenTags.score).toBeLessThan(brokenA11y.score)
  })

  it('counts severities for the report header', () => {
    const b = scoreChecks([
      check('a', 'tags', 'critical', 'fail'),
      check('b', 'tags', 'warning', 'fail'),
      check('c', 'media', 'notice', 'fail'),
      check('d', 'media', 'notice', 'pass'),
    ])
    expect(b.counts.critical).toBe(1)
    expect(b.counts.notice).toBe(1)
    expect(b.counts.passed).toBe(1)
  })

  it('stays in range on a real generated audit', () => {
    const result = scoreChecks(
      PHASE_1_CHECKS.map((c, i) =>
        check(c.code, c.group, c.severity, i % 3 === 0 ? 'fail' : i % 3 === 1 ? 'warn' : 'pass'),
      ),
    )
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
    expect(Object.keys(result.groups).length).toBe(ALL_GROUPS.length)
  })
})

describe('what the report leads with', () => {
  it('puts a broken title above a missing skip link', () => {
    const order = prioritise(
      [
        check('a11y_skip_link', 'accessibility', 'notice', 'fail'),
        check('title_present', 'tags', 'critical', 'fail'),
      ],
      new Set(['title_present', 'a11y_skip_link']),
    )
    expect(order[0]).toBe('title_present')
  })

  it('prefers a problem we can fix over one we can only report', () => {
    const order = prioritise(
      [check('reportable', 'tags', 'warning', 'fail'), check('fixable', 'tags', 'warning', 'fail')],
      new Set(['fixable']),
    )
    expect(order[0]).toBe('fixable')
  })

  it('leaves passing checks out of the priority list', () => {
    const order = prioritise([check('ok', 'tags', 'critical', 'pass')], new Set())
    expect(order).toEqual([])
  })

  it('puts a page Google cannot index above anything else', () => {
    const order = prioritise(
      [
        check('title_present', 'tags', 'critical', 'fail'),
        check('noindex', 'indexing', 'critical', 'fail'),
      ],
      new Set(['title_present', 'noindex']),
    )
    expect(order[0]).toBe('noindex')
  })

  it('puts lorem ipsum above a shouting title, which group weight alone did not', () => {
    // title_caps is a notice in a group worth 18. lorem_ipsum is critical in a
    // group worth 14. Before the impact label the lighter group lost.
    const order = prioritise(
      [
        check('title_caps', 'tags', 'notice', 'fail'),
        check('lorem_ipsum', 'content', 'critical', 'fail'),
      ],
      new Set(['title_caps']),
    )
    expect(order[0]).toBe('lorem_ipsum')
  })

  it('still ranks a missing title above a missing alt text', () => {
    const order = prioritise(
      [
        check('img_alt_present', 'media', 'warning', 'fail'),
        check('title_present', 'tags', 'critical', 'fail'),
      ],
      new Set(['img_alt_present', 'title_present']),
    )
    expect(order[0]).toBe('title_present')
  })
})
