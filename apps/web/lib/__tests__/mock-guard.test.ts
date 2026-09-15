import { afterEach, describe, expect, it, vi } from 'vitest'
import { mockGuard, mocksDisabled } from '../mock/guard'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('the mock API guard', () => {
  it('answers in development', () => {
    vi.stubEnv('NODE_ENV', 'development')
    expect(mocksDisabled()).toBe(false)
    expect(mockGuard()).toBeNull()
  })

  it('answers while tests run', () => {
    vi.stubEnv('NODE_ENV', 'test')
    expect(mocksDisabled()).toBe(false)
  })

  it('returns 404 in production, so F3 cannot ship a free audit endpoint', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('TW_ALLOW_MOCKS', '')
    expect(mocksDisabled()).toBe(true)
    expect(mockGuard()?.status).toBe(404)
  })

  it('can be turned back on deliberately, for a staging box', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('TW_ALLOW_MOCKS', '1')
    expect(mocksDisabled()).toBe(false)
    expect(mockGuard()).toBeNull()
  })
})
