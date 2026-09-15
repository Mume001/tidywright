/**
 * Generates the Ed25519 key pair for Web Bot Auth and prints what to do with it.
 *
 *   pnpm bot:keys
 *
 * It writes nothing. The private key is printed once, to your terminal, and it
 * is your job to put it in the secret store and nowhere else. If this script
 * wrote a file, that file would end up in a backup, a screenshot or a commit,
 * and a leaked signing key means somebody else can spend our reputation.
 *
 * docs/38-bot-verification.md step 3.
 */

import { generateKeyPairSync, createHash } from 'node:crypto'

const b64url = (buf) =>
  buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

const { publicKey, privateKey } = generateKeyPairSync('ed25519')

const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
const jwk = publicKey.export({ format: 'jwk' })
const thumbprint = b64url(
  createHash('sha256')
    .update(JSON.stringify({ crv: jwk.crv, kty: jwk.kty, x: jwk.x }))
    .digest(),
)

const line = '-'.repeat(72)

console.log(`\n${line}\n1. PRIVATE KEY. Copy it, then clear your scrollback.\n${line}`)
console.log('Put it in the worker and the app as TW_BOT_SIGNING_KEY, as one line:\n')
console.log(`TW_BOT_SIGNING_KEY="${privatePem.trimEnd().replace(/\n/g, '\\n')}"\n`)
console.log('The multi-line original, if your secret store prefers it:\n')
console.log(privatePem)

console.log(`${line}\n2. PUBLIC KEY. This is what the world sees.\n${line}\n`)
console.log(
  JSON.stringify({ keys: [{ ...jwk, kid: thumbprint, alg: 'EdDSA', use: 'sig' }] }, null, 2),
)

console.log(`\n${line}\n3. KEY ID (JWK thumbprint, RFC 7638)\n${line}\n`)
console.log(thumbprint)
console.log('\nThis is the keyid in every signature we send. Cloudflare and Akamai')
console.log('both key off it. It is derived from the public key, so it changes only')
console.log('when the key does.\n')

console.log(`${line}\nNEXT\n${line}`)
console.log('  - set TW_BOT_SIGNING_KEY, redeploy, then check the directory answers:')
console.log('      curl -si https://tidywright.com/.well-known/http-message-signatures-directory')
console.log('    it must return 200, content-type')
console.log('    application/http-message-signatures-directory+json, and both a')
console.log('    signature and a signature-input header.')
console.log('  - only then fill in the Cloudflare form. docs/38-bot-verification.md.\n')
