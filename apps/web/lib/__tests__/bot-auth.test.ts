import { generateKeyPairSync } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import {
  jwkThumbprint,
  publicJwkFromPem,
  signMessage,
  signatureAgentHeader,
  signatureBase,
  verifyMessage,
} from '../bot-auth'

/**
 * Web Bot Auth. docs/38-bot-verification.md.
 *
 * These prove the pieces are self-consistent: the base is built the way RFC 9421
 * describes it, and what we sign verifies against the key we publish. They
 * cannot prove Cloudflare accepts it, which is why the runbook ends with a curl
 * against the live directory before the form is submitted.
 */

function keypair() {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519')
  return {
    privatePem: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
    publicPem: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
  }
}

const PARAMS = {
  keyid: 'test-key',
  created: 1_757_900_000,
  expires: 1_757_900_060,
  tag: 'web-bot-auth',
}

describe('the key we publish', () => {
  it('derives an Ed25519 JWK from the private key, so the two cannot disagree', () => {
    const { privatePem } = keypair()
    const jwk = publicJwkFromPem(privatePem)

    expect(jwk.kty).toBe('OKP')
    expect(jwk.crv).toBe('Ed25519')
    expect(jwk.x).toMatch(/^[A-Za-z0-9_-]+$/) // base64url, no padding
    expect(jwk.kid).toBe(jwkThumbprint(jwk))
  })

  it('refuses a key that is not Ed25519, because no other algorithm is accepted', () => {
    const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
    const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()

    expect(() => publicJwkFromPem(pem)).toThrow(/Ed25519/)
  })

  it('computes the thumbprint over crv, kty and x in that order, per RFC 7638', () => {
    // Fixed vector: the canonical JSON is {"crv":"Ed25519","kty":"OKP","x":"..."}
    // and nothing else. Field order is the whole point of the rule.
    const jwk = { crv: 'Ed25519', kty: 'OKP', x: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' }
    expect(jwkThumbprint(jwk)).toBe(jwkThumbprint({ x: jwk.x, kty: 'OKP', crv: 'Ed25519' }))
    expect(jwkThumbprint(jwk)).toMatch(/^[A-Za-z0-9_-]{43}$/)
  })
})

describe('the signature base', () => {
  it('ends with the signature-params line and nothing after it', () => {
    const base = signatureBase({ ...PARAMS, components: [] })
    expect(base).toBe(
      '"@signature-params": ();created=1757900000;expires=1757900060;keyid="test-key";alg="ed25519";tag="web-bot-auth"',
    )
  })

  it('puts one line per covered component, in the order given', () => {
    const base = signatureBase(
      { ...PARAMS, components: ['@authority', '@method'] },
      { '@authority': 'example.com', '@method': 'GET' },
    )
    const lines = base.split('\n')
    expect(lines[0]).toBe('"@authority": example.com')
    expect(lines[1]).toBe('"@method": GET')
    expect(lines[2]).toContain('("@authority" "@method")')
  })

  it('refuses to sign a component it has no value for', () => {
    expect(() => signatureBase({ ...PARAMS, components: ['@authority'] })).toThrow(/@authority/)
  })
})

describe('signing', () => {
  it('produces headers that verify against the published public key', () => {
    const { privatePem } = keypair()
    const jwk = publicJwkFromPem(privatePem)
    const params = { ...PARAMS, keyid: jwk.kid, components: ['@authority'] }
    const values = { '@authority': 'example.com' }

    const headers = signMessage(privatePem, params, values)

    expect(headers['Signature-Input']).toMatch(/^sig1=\("@authority"\);created=/)
    expect(headers.Signature).toMatch(/^sig1=:[A-Za-z0-9+/=]+:$/)
    expect(verifyMessage(jwk, headers, params, values)).toBe(true)
  })

  it('fails verification when the authority changes, which is the point of covering it', () => {
    const { privatePem } = keypair()
    const jwk = publicJwkFromPem(privatePem)
    const params = { ...PARAMS, keyid: jwk.kid, components: ['@authority'] }

    const headers = signMessage(privatePem, params, { '@authority': 'example.com' })

    expect(verifyMessage(jwk, headers, params, { '@authority': 'evil.example' })).toBe(false)
  })

  it('fails verification under a different key', () => {
    const a = keypair()
    const b = keypair()
    const params = { ...PARAMS, components: [] }

    const headers = signMessage(a.privatePem, params)

    expect(verifyMessage(b.publicPem, headers, params)).toBe(false)
  })

  it('signs the directory response with the tag Cloudflare looks for', () => {
    const { privatePem } = keypair()
    const params = { ...PARAMS, tag: 'http-message-signatures-directory', components: [] }

    const headers = signMessage(privatePem, params)

    expect(headers['Signature-Input']).toContain('tag="http-message-signatures-directory"')
    expect(verifyMessage(publicJwkFromPem(privatePem), headers, params)).toBe(true)
  })
})

describe('Signature-Agent', () => {
  it('is the directory URL in double quotes, as a structured string', () => {
    expect(signatureAgentHeader('https://tidywright.com/.well-known/x')).toBe(
      '"https://tidywright.com/.well-known/x"',
    )
  })
})
