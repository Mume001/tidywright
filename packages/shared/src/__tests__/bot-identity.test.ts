import { describe, expect, it } from 'vitest'
import { BOT, BOT_IPS, BOT_ROBOTS_EXAMPLE } from '../bot-identity'

/**
 * The identity is only worth anything if every copy of it says the same thing.
 * docs/38-bot-verification.md, docs/22-security.md.
 *
 * These are cheap and they guard the one failure mode that gets a bot removed
 * from a verification programme: what we publish drifting away from what we
 * declared, or from what we do.
 */

describe('the published identity', () => {
  it('names the bot in the user agent and points at the page that explains it', () => {
    expect(BOT.userAgent).toContain(BOT.name)
    expect(BOT.userAgent).toContain(BOT.infoUrl)
    // A library default is the fastest way to be blocked by name.
    expect(BOT.userAgent).not.toMatch(/node-fetch|axios|python-requests|curl\//i)
  })

  it('declares SEO, because Cloudflare blocks Agent and Training by default', () => {
    expect(BOT.category).toBe('SEO')
  })

  it('serves every URL it advertises over https on our own domain', () => {
    for (const url of [BOT.infoUrl, BOT.ipListUrl, BOT.keyDirectoryUrl]) {
      expect(url.startsWith('https://tidywright.com/'), url).toBe(true)
    }
    // Cloudflare requires this exact path, not one that merely looks like it.
    expect(BOT.keyDirectoryUrl).toMatch(/\/\.well-known\/http-message-signatures-directory$/)
  })

  it('gives a robots.txt stanza that names us, which we obey without exception', () => {
    expect(BOT_ROBOTS_EXAMPLE).toContain(`User-agent: ${BOT.robotsToken}`)
    expect(BOT_ROBOTS_EXAMPLE).toContain('Disallow: /')
  })
})

describe('the addresses', () => {
  it('lists every address we own, whether or not it is in use today', () => {
    // An address used without having been announced is a removal ground, so
    // idle is not a reason to leave one out.
    expect(BOT.addresses.length).toBeGreaterThanOrEqual(2)
    expect(BOT.addresses.some((a) => !a.active)).toBe(true)
    expect(BOT_IPS.length).toBe(BOT.addresses.length)
  })

  it('has no duplicates', () => {
    expect(new Set(BOT_IPS).size).toBe(BOT_IPS.length)
  })

  it('is a list of plain IPv4 literals, because that is what a firewall rule takes', () => {
    for (const ip of BOT_IPS) {
      expect(ip, ip).toMatch(/^\d{1,3}(\.\d{1,3}){3}$/)
      for (const octet of ip.split('.')) expect(Number(octet), ip).toBeLessThanOrEqual(255)
    }
  })

  it('puts reverse DNS inside our own domain, or the forward check cannot confirm it', () => {
    for (const address of BOT.addresses) {
      expect(address.reverseDns, address.ip).toMatch(/\.tidywright\.com$/)
    }
  })

  it('gives each address a distinct name, so a log line says which one it was', () => {
    const names = BOT.addresses.map((a) => a.reverseDns)
    expect(new Set(names).size).toBe(names.length)
  })

  it('keeps the fetch role separate from the application', () => {
    // Cloudflare removes services for using IPs that are not solely theirs. The
    // crawler address exists so the audit worker never shares one with the app.
    const roles = BOT.addresses.map((a) => a.role)
    expect(roles).toContain('fetch')
    expect(roles).toContain('app')
  })
})

describe('what the /bot page promises', () => {
  it('keeps the limits small enough to be true', () => {
    expect(BOT.limits.requestsPerSecondPerHost).toBeLessThanOrEqual(1)
    expect(BOT.limits.requestsPerSitePerAudit).toBeLessThanOrEqual(20)
    // RFC 9309 says cache robots.txt no longer than 24 hours.
    expect(BOT.limits.robotsCacheHours).toBeLessThanOrEqual(24)
  })

  it('has a contact address on our domain for both questions and abuse', () => {
    expect(BOT.contactEmail).toMatch(/@tidywright\.com$/)
    expect(BOT.abuseEmail).toMatch(/@tidywright\.com$/)
  })
})
