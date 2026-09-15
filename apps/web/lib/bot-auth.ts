import { createPrivateKey, createPublicKey, sign, verify, createHash } from 'node:crypto'

/**
 * Web Bot Auth: RFC 9421 HTTP Message Signatures, Ed25519, the way Cloudflare
 * and Akamai both want it. docs/38-bot-verification.md.
 *
 * Two things live here. The key directory we publish at
 * /.well-known/http-message-signatures-directory, whose own response has to be
 * signed, and the request signature the fetch worker will put on every outgoing
 * GET in B2.
 *
 * The private key never touches the repository or the database. It is in
 * TW_BOT_SIGNING_KEY as a PKCS#8 PEM and nowhere else, in the same class as the
 * connector KEK. docs/22-security.md.
 *
 * This file moves to packages/crawler in B2, when the worker needs it too. It
 * sits in the app for now because the app is what publishes the directory.
 *
 * Server only. The node:crypto import is what enforces that: a client bundle
 * that reaches this module fails to build, loudly, which is the behaviour we
 * want until the `server-only` package arrives with B1.
 */

/** Base64url, no padding. Every field in a JWK and every thumbprint uses it. */
function b64url(input: Buffer): string {
  return input.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export interface PublicJwk {
  kty: 'OKP'
  crv: 'Ed25519'
  x: string
  kid: string
  /** Cloudflare reads the directory as a JWKS; these two are advisory. */
  alg?: 'EdDSA'
  use?: 'sig'
}

/**
 * RFC 7638 thumbprint. For OKP that is SHA-256 over the canonical JSON of crv,
 * kty and x, in that order, with no whitespace. This value is the `keyid` in
 * every signature, so it has to be computed exactly and never invented.
 */
export function jwkThumbprint(jwk: { crv: string; kty: string; x: string }): string {
  const canonical = JSON.stringify({ crv: jwk.crv, kty: jwk.kty, x: jwk.x })
  return b64url(createHash('sha256').update(canonical).digest())
}

export function publicJwkFromPem(privatePem: string): PublicJwk {
  const key = createPublicKey(createPrivateKey(privatePem))
  const jwk = key.export({ format: 'jwk' }) as { kty?: string; crv?: string; x?: string }

  if (jwk.kty !== 'OKP' || jwk.crv !== 'Ed25519' || !jwk.x) {
    throw new Error('bot signing key must be Ed25519; Cloudflare supports no other algorithm')
  }

  return {
    kty: 'OKP',
    crv: 'Ed25519',
    x: jwk.x,
    kid: jwkThumbprint({ crv: 'Ed25519', kty: 'OKP', x: jwk.x }),
    alg: 'EdDSA',
    use: 'sig',
  }
}

export interface SignatureParams {
  keyid: string
  created: number
  expires: number
  tag: string
  /**
   * Derived and header components, in order. Empty for the directory response:
   * there is nothing stable to cover there, and Cloudflare rejects @status,
   * which is the only response component that would otherwise apply. A request
   * signature must cover at least @authority.
   */
  components?: string[]
  nonce?: string
}

/**
 * The signature base of RFC 9421 section 2.5: one line per covered component,
 * then the @signature-params line. Signed as UTF-8 bytes, newline separated,
 * with no trailing newline.
 */
export function signatureBase(
  params: SignatureParams,
  values: Record<string, string> = {},
): string {
  const components = params.components ?? []
  const lines = components.map((name) => {
    const value = values[name]
    if (value === undefined) throw new Error(`no value for covered component ${name}`)
    return `"${name}": ${value}`
  })
  lines.push(`"@signature-params": ${signatureParams(params)}`)
  return lines.join('\n')
}

/** The inner list plus parameters, identical in the base and in the header. */
function signatureParams(params: SignatureParams): string {
  const components = (params.components ?? []).map((name) => `"${name}"`).join(' ')
  const parts = [
    `(${components})`,
    `created=${params.created}`,
    `expires=${params.expires}`,
    `keyid="${params.keyid}"`,
    `alg="ed25519"`,
    `tag="${params.tag}"`,
  ]
  if (params.nonce) parts.splice(3, 0, `nonce="${params.nonce}"`)
  return parts.join(';')
}

export interface SignedHeaders {
  'Signature-Input': string
  Signature: string
}

export function signMessage(
  privatePem: string,
  params: SignatureParams,
  values: Record<string, string> = {},
  label = 'sig1',
): SignedHeaders {
  const key = createPrivateKey(privatePem)
  const base = signatureBase(params, values)
  // Ed25519 takes no separate digest: the algorithm is the whole thing.
  const signature = sign(null, Buffer.from(base, 'utf8'), key)

  return {
    'Signature-Input': `${label}=${signatureParams(params)}`,
    Signature: `${label}=:${signature.toString('base64')}:`,
  }
}

/** Used by the test, and by anyone checking a directory before submitting it. */
export function verifyMessage(
  publicPemOrJwk: string | PublicJwk,
  headers: SignedHeaders,
  params: SignatureParams,
  values: Record<string, string> = {},
  label = 'sig1',
): boolean {
  const key =
    typeof publicPemOrJwk === 'string'
      ? createPublicKey(publicPemOrJwk)
      : createPublicKey({
          key: { kty: 'OKP', crv: 'Ed25519', x: publicPemOrJwk.x },
          format: 'jwk',
        })

  const raw = headers.Signature.slice(`${label}=:`.length, -1)
  return verify(
    null,
    Buffer.from(signatureBase(params, values), 'utf8'),
    key,
    Buffer.from(raw, 'base64'),
  )
}

/**
 * Sixty seconds. The draft recommends a short life because the only thing a
 * replayed signature buys an attacker is our reputation, and that is the most
 * expensive thing we own.
 */
export const SIGNATURE_LIFETIME_SECONDS = 60

/** The one header that tells a verifier where our keys live. */
export function signatureAgentHeader(directoryUrl: string): string {
  return `"${directoryUrl}"`
}
