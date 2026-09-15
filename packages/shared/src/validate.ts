/**
 * What the form checks before it sends anything, and the codes it can get back.
 * docs/15-frontend-spec.md section 1.2 and docs/13-widget-spec.md
 * "Validacija zahtjeva".
 *
 * This is the client half only: shape, normalisation, and the refusals that need
 * no network. The server repeats every one of them in B4 and adds the ones that
 * need DNS (the real SSRF check, re-run on every redirect) and the database
 * (quota, per host rate limit). Nothing here is a security control. It exists so
 * the visitor is told what is wrong without waiting for a round trip.
 */

/** docs/13-widget-spec.md: a submitted address longer than this is refused. */
export const MAX_URL_LENGTH = 2048

export type FormErrorCode =
  | 'invalid_url'
  | 'blocked_target'
  | 'invalid_email'
  | 'disposable_email'
  | 'rate_limited'
  | 'quota_exceeded'
  | 'turnstile_failed'
  | 'server_error'

/**
 * One sentence per code, from the table in docs/15-frontend-spec.md 1.2. The
 * visitor never sees the code itself.
 *
 * `server_error` is the one addition to that table: a submit can fail before any
 * of the listed rules is reached, and the error state needs something to say.
 */
export const FORM_ERROR_MESSAGES: Record<FormErrorCode, string> = {
  invalid_url: "That doesn't look like a website address. Try something like example.com.",
  blocked_target: "We can't check that address.",
  invalid_email: 'Please enter a valid email address.',
  disposable_email: 'Please use a permanent email address.',
  rate_limited: 'This site was already checked today. Your report is on its way.',
  quota_exceeded: 'This check is temporarily unavailable.',
  turnstile_failed: "Please confirm you're not a robot.",
  server_error: 'Something went wrong on our side. Try again in a moment.',
}

export function formErrorMessage(code: string): string {
  return FORM_ERROR_MESSAGES[code as FormErrorCode] ?? FORM_ERROR_MESSAGES.server_error
}

/**
 * Addresses we refuse without asking a resolver. The real check happens on the
 * server against the resolved IP, because a public name can point at a private
 * address. docs/22-security.md.
 */
const BLOCKED_HOST_SUFFIXES = ['.local', '.localhost', '.internal', '.test', '.invalid', '.home']

/** Our own surfaces. An audit of ourselves is never what the visitor wanted. */
const OUR_HOSTS = ['tidywright.com', 'tidywright.app', 'siteauditserver.com']

function isPrivateIpv4(host: string): boolean {
  const parts = host.split('.')
  if (parts.length !== 4) return false
  const octets = parts.map((p) => (/^\d{1,3}$/.test(p) ? Number(p) : -1))
  if (octets.some((n) => n < 0 || n > 255)) return false
  const [a, b] = octets as [number, number, number, number]
  if (a === 10 || a === 127 || a === 0) return true
  if (a === 169 && b === 254) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 168) return true
  return false
}

function isPrivateIpv6(host: string): boolean {
  // URL keeps literal v6 addresses in brackets.
  const inner = host.startsWith('[') && host.endsWith(']') ? host.slice(1, -1) : host
  if (!inner.includes(':')) return false
  const lower = inner.toLowerCase()
  if (lower === '::1' || lower === '::') return true
  // fc00::/7 unique local, fe80::/10 link local.
  return /^f[cd]/.test(lower) || /^fe[89ab]/.test(lower)
}

export function isBlockedHost(host: string): boolean {
  const lower = host.toLowerCase()
  if (lower === 'localhost') return true
  if (BLOCKED_HOST_SUFFIXES.some((suffix) => lower.endsWith(suffix))) return true
  if (isPrivateIpv4(lower) || isPrivateIpv6(lower)) return true
  return OUR_HOSTS.some((our) => lower === our || lower.endsWith(`.${our}`))
}

export interface NormalizedUrl {
  /** The address the audit runs against. */
  url: string
  /** Lower case host, used for dedupe and for the per host daily limit. */
  host: string
}

export type UrlCheck =
  { ok: true; value: NormalizedUrl } | { ok: false; code: 'invalid_url' | 'blocked_target' }

/**
 * Turns what somebody typed into the address we will fetch: adds https when the
 * scheme is missing, lower cases the host, drops the fragment and a default
 * port. The query string is kept, because for a lot of sites it selects the
 * page. docs/13-widget-spec.md.
 */
export function normalizeUrl(input: string): UrlCheck {
  const raw = input.trim()
  if (raw.length === 0) return { ok: false, code: 'invalid_url' }

  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(raw)?.[1]?.toLowerCase()
  if (scheme && scheme !== 'http' && scheme !== 'https') {
    return { ok: false, code: 'invalid_url' }
  }

  let parsed: URL
  try {
    parsed = new URL(scheme ? raw : `https://${raw}`)
  } catch {
    return { ok: false, code: 'invalid_url' }
  }

  const host = parsed.hostname.toLowerCase()
  if (host.length === 0) return { ok: false, code: 'invalid_url' }

  // A bare word is a typo, not a site. An IP literal has no dot requirement of
  // its own, so it is allowed through here and caught by the blocked check.
  const isIpLiteral = host.startsWith('[') || /^[\d.]+$/.test(host)
  if (!isIpLiteral && !host.includes('.')) {
    return { ok: false, code: host === 'localhost' ? 'blocked_target' : 'invalid_url' }
  }

  if (isBlockedHost(host)) return { ok: false, code: 'blocked_target' }

  parsed.hash = ''
  parsed.hostname = host
  if (parsed.pathname === '') parsed.pathname = '/'

  const url = parsed.toString()
  if (url.length > MAX_URL_LENGTH) return { ok: false, code: 'invalid_url' }

  return { ok: true, value: { url, host } }
}

/**
 * Deliberately loose. The only address we can prove is real is one that accepts
 * the email we send it, so this rejects typos and nothing else.
 */
const EMAIL_PATTERN = /^[^\s@,;:<>()[\]\\"]+@[^\s@.]+(\.[^\s@.]+)+$/

export function isValidEmail(input: string): boolean {
  const email = input.trim()
  if (email.length === 0 || email.length > 254) return false
  const at = email.lastIndexOf('@')
  if (at < 1 || email.length - at - 1 > 253) return false
  if (email.slice(0, at).length > 64) return false
  return EMAIL_PATTERN.test(email)
}

/**
 * A starting list. The maintained one arrives with the API in B4, where it can
 * be updated without a deploy. Kept short on purpose: a false positive here
 * costs the agency a lead.
 */
export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'maildrop.cc',
  'sharklasers.com',
  'temp-mail.org',
  'tempmail.com',
  'throwawaymail.com',
  'trashmail.com',
  'yopmail.com',
])

export function emailDomain(input: string): string {
  const at = input.lastIndexOf('@')
  return at === -1
    ? ''
    : input
        .slice(at + 1)
        .trim()
        .toLowerCase()
}

export function isDisposableEmail(input: string): boolean {
  return DISPOSABLE_EMAIL_DOMAINS.has(emailDomain(input.trim()))
}

export type EmailCheck =
  { ok: true; value: string } | { ok: false; code: 'invalid_email' | 'disposable_email' }

export function normalizeEmail(input: string): EmailCheck {
  const email = input.trim().toLowerCase()
  if (!isValidEmail(email)) return { ok: false, code: 'invalid_email' }
  if (isDisposableEmail(email)) return { ok: false, code: 'disposable_email' }
  return { ok: true, value: email }
}
