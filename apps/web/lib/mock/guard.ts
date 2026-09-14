/**
 * The mock API answers in development and nowhere else.
 *
 * These routes create audits with no Turnstile, no quota and no cost. In F3 the
 * marketing site ships from this same deployment, and a forgotten public
 * endpoint that mints reports for anyone is not a mistake worth discovering in
 * production. TW_ALLOW_MOCKS is the deliberate way to turn them back on, for a
 * staging box or a demo.
 */
export function mocksDisabled(): boolean {
  return process.env.NODE_ENV === 'production' && !process.env.TW_ALLOW_MOCKS
}

/** Returns the 404 to send back, or null when the route may run. */
export function mockGuard(): Response | null {
  return mocksDisabled() ? new Response(null, { status: 404 }) : null
}
