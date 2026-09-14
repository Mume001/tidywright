import { describe, expect, it } from 'vitest'
import { mock } from '@tw/shared/mocks'
import {
  brandNameFromHost,
  DEMO_KEY,
  DEMO_TOKENS,
  demoAudits,
  demoBaseAudit,
  formContextByKey,
  formContextBySlug,
  reportContext,
  retargetAudit,
  staticAuditByToken,
} from '../mock/resolve'

describe('demo aliases', () => {
  it('reaches an agency through the key printed on the test page', () => {
    const context = formContextByKey(DEMO_KEY)
    expect(context).not.toBeNull()
    expect(context!.agency.slug).toBe('northwind-digital')
    expect(context!.embedKey.status).toBe('active')
  })

  it('still resolves a real seeded key', () => {
    const key = mock.embedKeys.find((k) => k.status === 'active')!
    expect(formContextByKey(key.publicKey)?.agency.id).toBe(key.agencyId)
  })

  it('refuses a revoked key, so a rotated embed stops working', () => {
    const revoked = mock.embedKeys.find((k) => k.status === 'revoked')!
    expect(formContextByKey(revoked.publicKey)).toBeNull()
  })

  it('refuses a key nobody has', () => {
    expect(formContextByKey('pk_live_nothing')).toBeNull()
  })

  it('resolves the hosted form by slug', () => {
    expect(formContextBySlug('northwind-digital')?.agency.name).toBe('Northwind Digital')
    expect(formContextBySlug('NORTHWIND-DIGITAL')?.agency.name).toBe('Northwind Digital')
    expect(formContextBySlug('nobody')).toBeNull()
  })

  it('has one audit per report state', () => {
    const audits = demoAudits()
    for (const token of Object.values(DEMO_TOKENS)) {
      expect(audits.get(token), token).toBeDefined()
      expect(audits.get(token)!.token, token).toBe(token)
    }
  })

  it('gives every demo state the shape the report expects', () => {
    const audits = demoAudits()
    expect(audits.get(DEMO_TOKENS.done)!.fixes).toHaveLength(3)
    expect(audits.get(DEMO_TOKENS.done)!.summary).not.toBeNull()

    const clean = audits.get(DEMO_TOKENS.clean)!
    expect(clean.checks.every((c) => c.status === 'pass')).toBe(true)
    expect(clean.fixes).toHaveLength(0)

    expect(audits.get(DEMO_TOKENS.scoreOnly)!.variant).toBe('score_only')
    expect(audits.get(DEMO_TOKENS.failedBlocked)!.failureCode).toBe('blocked')
    expect(audits.get(DEMO_TOKENS.failedFetch)!.failureCode).toBe('fetch_timeout')
    expect(audits.get(DEMO_TOKENS.expired)!.status).toBe('expired')
    expect(audits.get(DEMO_TOKENS.pending)!.status).toBe('queued')
  })

  it('finds a seeded audit by its own token as well', () => {
    const seeded = mock.audits.find((a) => a.status === 'done')!
    expect(staticAuditByToken(seeded.token)?.id).toBe(seeded.id)
    expect(staticAuditByToken('nothing')).toBeNull()
  })

  it('resolves the agency and branding behind a report', () => {
    const context = reportContext(demoBaseAudit())
    expect(context).not.toBeNull()
    expect(context!.branding.agencyId).toBe(context!.agency.id)
    expect(context!.branding.primaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/)
  })
})

describe('retargetAudit', () => {
  it('moves a finished report onto another address and renames the business', () => {
    const moved = retargetAudit(
      demoBaseAudit(),
      { url: 'https://bright-oak-dental.com/', host: 'bright-oak-dental.com' },
      'tok',
    )

    expect(moved.url).toBe('https://bright-oak-dental.com/')
    expect(moved.token).toBe('tok')
    expect(JSON.stringify(moved.fixes)).toContain('Bright Oak Dental')
    expect(JSON.stringify(moved.fixes)).not.toContain('Northwind Client')
  })

  it('keeps the findings, because only the words naming the business change', () => {
    const base = demoBaseAudit()
    const moved = retargetAudit(base, { url: 'https://x.com/', host: 'x.com' }, 'tok')
    expect(moved.checks).toEqual(base.checks)
    expect(moved.score).toBe(base.score)
  })
})

describe('brandNameFromHost', () => {
  it('reads a business name out of a domain', () => {
    expect(brandNameFromHost('northwind-client.com')).toBe('Northwind Client')
    expect(brandNameFromHost('www.bright_oak.co.uk')).toBe('Bright Oak')
    expect(brandNameFromHost('example.com')).toBe('Example')
  })
})
