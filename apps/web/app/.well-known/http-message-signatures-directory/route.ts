import { BOT } from '@tw/shared'
import {
  SIGNATURE_LIFETIME_SECONDS,
  publicJwkFromPem,
  signMessage,
  type PublicJwk,
} from '@/lib/bot-auth'

/**
 * The key directory Web Bot Auth verifies us against.
 *
 * Cloudflare requires this exact path, over HTTPS, with content type
 * application/http-message-signatures-directory+json, and requires the response
 * itself to be signed with tag="http-message-signatures-directory". Akamai's Bot
 * Directory reads the same document, so one endpoint serves both.
 *
 * docs/38-bot-verification.md has the submission runbook.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic' // the signature carries a timestamp

const CONTENT_TYPE = 'application/http-message-signatures-directory+json'

export function GET() {
  const pem = process.env.TW_BOT_SIGNING_KEY

  /*
   * Without the key there is nothing honest to serve. An unsigned directory
   * would be worse than a missing one: a verifier that fetched it once and
   * cached a key we cannot prove we hold is a verifier we have lied to.
   */
  if (!pem) {
    return new Response('key directory not configured', {
      status: 503,
      headers: { 'cache-control': 'no-store' },
    })
  }

  let jwk: PublicJwk
  try {
    jwk = publicJwkFromPem(pem)
  } catch {
    return new Response('key directory misconfigured', {
      status: 503,
      headers: { 'cache-control': 'no-store' },
    })
  }

  const body = JSON.stringify({ keys: [jwk] })
  const created = Math.floor(Date.now() / 1000)

  /*
   * No covered components. A response signature would normally cover @status,
   * and Cloudflare lists @status as unsupported, so the signature covers the
   * parameters alone: who signed, when, until when, and what for. That is what
   * the directory has to prove, and RFC 9421 allows an empty component list.
   */
  const signed = signMessage(pem, {
    keyid: jwk.kid,
    created,
    expires: created + SIGNATURE_LIFETIME_SECONDS,
    tag: 'http-message-signatures-directory',
  })

  return new Response(body, {
    headers: {
      'content-type': CONTENT_TYPE,
      'signature-input': signed['Signature-Input'],
      signature: signed.Signature,
      // Short, because the signature inside expires in a minute.
      'cache-control': 'public, max-age=30',
      'x-tw-bot': BOT.name,
    },
  })
}
