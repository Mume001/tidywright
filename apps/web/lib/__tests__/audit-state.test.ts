import { beforeEach, describe, expect, it } from 'vitest'
import {
  createAudit,
  existingSubmission,
  findAudit,
  isUnsubscribed,
  markUnsubscribed,
  MOCK_RUN_MS,
  resetMockAudits,
} from '../mock/audit-state'
import { DEMO_KEY, DEMO_TOKENS, formContextByKey } from '../mock/resolve'

const T0 = Date.parse('2026-09-14T09:00:00.000Z')
const context = formContextByKey(DEMO_KEY)!

beforeEach(() => {
  resetMockAudits()
})

describe('a pending audit', () => {
  it('walks the worker states and lands on done', () => {
    const created = createAudit(
      { context, url: 'https://example.com/', host: 'example.com', email: 'a@example.com' },
      T0,
    )
    const at = (ms: number) => findAudit(created.token, T0 + ms)!.status

    expect(created.status).toBe('queued')
    expect(at(0)).toBe('queued')
    expect(at(2_000)).toBe('fetching')
    expect(at(3_500)).toBe('checking')
    expect(at(5_000)).toBe('generating')
    expect(at(MOCK_RUN_MS + 1)).toBe('done')
  })

  it('shows no score and no findings before it finishes', () => {
    const created = createAudit(
      { context, url: 'https://example.com/', host: 'example.com', email: 'a@example.com' },
      T0,
    )
    const half = findAudit(created.token, T0 + 3_000)!
    expect(half.score).toBeNull()
    expect(half.summary).toBeNull()
    expect(half.checks).toHaveLength(0)
    expect(half.fixes).toHaveLength(0)
    expect(half.finishedAt).toBeNull()
  })

  it('carries the submitted address and the full report once it is done', () => {
    const created = createAudit(
      {
        context,
        url: 'https://bright-oak-dental.com/',
        host: 'bright-oak-dental.com',
        email: 'a@example.com',
      },
      T0,
    )
    const done = findAudit(created.token, T0 + MOCK_RUN_MS + 1)!

    expect(done.status).toBe('done')
    expect(done.url).toBe('https://bright-oak-dental.com/')
    expect(done.score).not.toBeNull()
    expect(done.fixes).toHaveLength(3)
    expect(done.checks.length).toBeGreaterThan(100)
    expect(done.finishedAt).not.toBeNull()
    expect(JSON.stringify(done.fixes)).toContain('Bright Oak Dental')
  })

  it('belongs to the agency whose key was used', () => {
    const created = createAudit(
      { context, url: 'https://example.com/', host: 'example.com', email: 'a@example.com' },
      T0,
    )
    expect(findAudit(created.token, T0)!.agencyId).toBe(context.agency.id)
  })

  it('carries the pilot variant through to the finished report', () => {
    const created = createAudit(
      {
        context,
        url: 'https://example.com/',
        host: 'example.com',
        email: 'a@example.com',
        variant: 'score_only',
      },
      T0,
    )
    expect(findAudit(created.token, T0 + MOCK_RUN_MS + 1)!.variant).toBe('score_only')
  })
})

describe('demo tokens', () => {
  it('starts the clock the first time a pending report is opened', () => {
    expect(findAudit(DEMO_TOKENS.pending, T0)!.status).toBe('queued')
    expect(findAudit(DEMO_TOKENS.pending, T0 + MOCK_RUN_MS + 1)!.status).toBe('done')
  })

  it('never finishes the stuck one, so the timeout copy is reachable', () => {
    findAudit(DEMO_TOKENS.pendingStuck, T0)
    expect(findAudit(DEMO_TOKENS.pendingStuck, T0 + 600_000)!.status).toBe('queued')
  })

  it('leaves a finished, failed or expired report exactly as it is', () => {
    expect(findAudit(DEMO_TOKENS.done, T0)!.status).toBe('done')
    expect(findAudit(DEMO_TOKENS.failedBlocked, T0 + 900_000)!.status).toBe('failed')
    expect(findAudit(DEMO_TOKENS.expired, T0 + 900_000)!.status).toBe('expired')
  })

  it('returns nothing for a token that does not exist', () => {
    expect(findAudit('not-a-token')).toBeNull()
  })
})

describe('dedupe', () => {
  it('remembers the same address from the same visitor on the same day', () => {
    const created = createAudit(
      { context, url: 'https://example.com/', host: 'example.com', email: 'a@example.com' },
      T0,
    )
    expect(
      existingSubmission(context.embedKey.publicKey, 'https://example.com/', 'a@example.com', T0),
    ).toBe(created.token)
  })

  it('does not confuse a different address, visitor or day', () => {
    createAudit(
      { context, url: 'https://example.com/', host: 'example.com', email: 'a@example.com' },
      T0,
    )
    const key = context.embedKey.publicKey
    expect(existingSubmission(key, 'https://other.com/', 'a@example.com', T0)).toBeNull()
    expect(existingSubmission(key, 'https://example.com/', 'b@example.com', T0)).toBeNull()
    expect(
      existingSubmission(key, 'https://example.com/', 'a@example.com', T0 + 86_400_000),
    ).toBeNull()
  })
})

describe('unsubscribe', () => {
  it('records the lead and forgets nothing else', () => {
    markUnsubscribed('lead-1')
    expect(isUnsubscribed('lead-1')).toBe(true)
    expect(isUnsubscribed('lead-2')).toBe(false)
  })
})
