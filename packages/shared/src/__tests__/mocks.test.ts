import { describe, expect, it } from 'vitest'
import { buildMockData } from '../mocks/build'
import { PHASE_1_CHECKS } from '../checks-catalog'
import { PLANS, entitlementsFor, formatPrice } from '../plans'

describe('mock data', () => {
  const data = buildMockData(42)

  it('is deterministic for the same seed', () => {
    expect(JSON.stringify(buildMockData(42))).toBe(JSON.stringify(data))
  })

  it('differs for a different seed', () => {
    expect(JSON.stringify(buildMockData(7))).not.toBe(JSON.stringify(data))
  })

  it('has the volumes the build plan asks for', () => {
    expect(data.agencies).toHaveLength(3)
    expect(data.leads).toHaveLength(200)
    expect(data.audits).toHaveLength(500)
    expect(data.embedKeys).toHaveLength(5)
    expect(data.stats).toHaveLength(90)
  })

  it('gives every finished audit a score in range, a summary and three fixes', () => {
    const done = data.audits.filter((a) => a.status === 'done')
    expect(done.length).toBeGreaterThan(300)
    for (const audit of done) {
      expect(audit.score).toBeGreaterThanOrEqual(0)
      expect(audit.score).toBeLessThanOrEqual(100)
      expect(audit.summary).not.toBeNull()
      expect(audit.fixes).toHaveLength(3)
      expect(audit.checks).toHaveLength(PHASE_1_CHECKS.length)
    }
  })

  it('covers every lead status, so no table state is unreachable in stories', () => {
    const seen = new Set(data.leads.map((l) => l.status))
    expect([...seen].sort()).toEqual(['contacted', 'lost', 'new', 'qualified', 'spam', 'won'])
  })

  it('leaves no audit pointing at a lead that does not exist', () => {
    const ids = new Set(data.leads.map((l) => l.id))
    for (const audit of data.audits) {
      if (audit.leadId) expect(ids.has(audit.leadId)).toBe(true)
    }
  })

  it('keeps every audit inside an agency that exists', () => {
    const ids = new Set(data.agencies.map((a) => a.id))
    for (const audit of data.audits) expect(ids.has(audit.agencyId)).toBe(true)
  })

  it('records the two consents separately, and never bundles them', () => {
    for (const lead of data.leads) {
      // Nobody gets a report without asking for one.
      expect(lead.consent.service.checked, lead.id).toBe(true)
      expect(lead.consent.service.ts, lead.id).not.toBeNull()
      // The marketing record exists either way. A false record is still a record.
      expect(typeof lead.consent.marketing.checked, lead.id).toBe('boolean')
      if (!lead.consent.marketing.checked) expect(lead.consent.marketing.ts, lead.id).toBeNull()
      // Different purposes need different words next to the tick.
      expect(lead.consent.marketing.text, lead.id).not.toBe(lead.consent.service.text)
    }

    // If the two ever move together, one of them stopped being a real choice.
    const optedIn = data.leads.filter((l) => l.consent.marketing.checked).length
    expect(optedIn).toBeGreaterThan(0)
    expect(optedIn).toBeLessThan(data.leads.length)
  })
})

describe('plans', () => {
  it('grows limits monotonically across the ladder', () => {
    const order = ['free', 'starter', 'agency', 'pro'] as const
    for (let i = 1; i < order.length; i += 1) {
      const current = order[i]!
      const previous = order[i - 1]!
      expect(PLANS[current].limits.auditsPerMonth).toBeGreaterThan(
        PLANS[previous].limits.auditsPerMonth,
      )
    }
  })

  it('hides the badge on every paid plan and shows it on free', () => {
    expect(PLANS.free.limits.hidePoweredBy).toBe(false)
    expect(PLANS.starter.limits.hidePoweredBy).toBe(true)
    expect(PLANS.agency.limits.hidePoweredBy).toBe(true)
    expect(PLANS.pro.limits.hidePoweredBy).toBe(true)
  })

  it('prices yearly at ten months', () => {
    for (const plan of ['starter', 'agency', 'pro'] as const) {
      expect(PLANS[plan].yearlyCents).toBe(PLANS[plan].monthlyCents * 10)
    }
  })

  it('builds entitlements from a plan', () => {
    const e = entitlementsFor('abc', 'starter')
    expect(e.agencyId).toBe('abc')
    expect(e.source).toBe('plan')
    expect(e.auditsPerMonth).toBe(500)
  })

  it('formats prices', () => {
    expect(formatPrice(0)).toBe('$0')
    expect(formatPrice(3900)).toBe('$39')
  })
})
