import { mock } from '@tw/shared/mocks'
import { DEMO_TOKENS } from './resolve'

/**
 * Which report tokens are gone. Read by proxy.ts, which is the only place that
 * can put a 410 on the response: a page cannot set its own status code in Next,
 * and a deleted report has to answer 410 rather than 200, both for the agency's
 * monitoring and because docs/18-data-model.md says so.
 *
 * Built on first use, not on import, so the report path is the only one that
 * ever pays for it.
 */
let cache: Set<string> | null = null

export function isExpiredToken(token: string): boolean {
  cache ??= new Set<string>([
    DEMO_TOKENS.expired,
    ...mock.audits.filter((a) => a.status === 'expired').map((a) => a.token),
  ])
  return cache.has(token)
}
