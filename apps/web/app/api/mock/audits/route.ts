import { normalizeEmail, normalizeUrl, type FormErrorCode } from '@tw/shared'
import { createAudit, existingSubmission } from '@/lib/mock/audit-state'
import { mockGuard } from '@/lib/mock/guard'
import { formContextByKey } from '@/lib/mock/resolve'

/**
 * Stands in for POST /api/v1/audits until B4. Same request body, same response
 * shape, same refusals in the same order as docs/13-widget-spec.md
 * "Validacija zahtjeva", so the form is written once and never again.
 *
 * What it does not do is the half that needs a server: Turnstile verification,
 * DNS and the SSRF check, the agency's real quota, the per host daily limit.
 */

/**
 * Addresses that make the mock behave badly on purpose, so every branch of the
 * form is reachable from public/test-embed.html without editing code.
 */
const DEMO_HOSTS: Record<string, FormErrorCode> = {
  'quota.example.com': 'quota_exceeded',
  'blocked.example.com': 'blocked_target',
  'broken.example.com': 'server_error',
}

function fail(code: FormErrorCode, status: number, extra: Record<string, unknown> = {}) {
  return Response.json({ error: code, ...extra }, { status })
}

export async function POST(request: Request) {
  const blocked = mockGuard()
  if (blocked) return blocked

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return fail('server_error', 400)
  }

  const read = (field: string) => (typeof body[field] === 'string' ? (body[field] as string) : '')
  const origin = new URL(request.url).origin

  // 1. Turnstile. The real token is verified against Cloudflare in B4.
  if (read('turnstile_token').length === 0) return fail('turnstile_failed', 400)

  // 2. The embed key, and with it the agency and its limits.
  const context = formContextByKey(read('key'))
  if (!context) return fail('server_error', 404)

  // 3. Email.
  const email = normalizeEmail(read('email'))
  if (!email.ok) return fail(email.code, 400)

  // 4. Address, and the checks that need no resolver.
  const url = normalizeUrl(read('url'))
  if (!url.ok) return fail(url.code, 400)

  const demo = DEMO_HOSTS[url.value.host]
  if (demo) return fail(demo, demo === 'quota_exceeded' ? 429 : 400)

  // 5. Same address, same visitor, same day: hand back the report that exists.
  const existing = existingSubmission(context.embedKey.publicKey, url.value.url, email.value)
  if (existing) {
    return fail('rate_limited', 429, { token: existing, report_url: `${origin}/r/${existing}` })
  }

  const variant = read('variant') === 'score_only' ? ('score_only' as const) : ('full' as const)
  const audit = createAudit({
    context,
    url: url.value.url,
    host: url.value.host,
    email: email.value,
    variant,
  })

  return Response.json(
    {
      audit_id: audit.id,
      token: audit.token,
      report_url: `${origin}/r/${audit.token}`,
      status: audit.status,
    },
    { status: 201 },
  )
}
