import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'

/**
 * The loader is a promise we make to every agency that pastes our tag onto
 * their site: under 5 KB gzipped, no cookies, nothing read from their page,
 * nothing that blocks their render. docs/15-frontend-spec.md 1.1.
 *
 * It is plain JavaScript in public/, which means no compiler and no bundler
 * checks it. This test is the check.
 */
const root = join(import.meta.dirname, '../../public')
const bootstrap = readFileSync(join(root, 'embed.js'), 'utf8')
const loader = readFileSync(join(root, 'embed/v1/frame.js'), 'utf8')

function gzippedBytes(source: string): number {
  return gzipSync(Buffer.from(source, 'utf8'), { level: 9 }).byteLength
}

const BUDGET = 5 * 1024

describe('the embed budget', () => {
  it('keeps both halves together under 5 KB gzipped', () => {
    const total = gzippedBytes(bootstrap) + gzippedBytes(loader)
    expect(total).toBeLessThan(BUDGET)
  })

  it('keeps the mutable half tiny, because it is revalidated every five minutes', () => {
    expect(gzippedBytes(bootstrap)).toBeLessThan(1024)
  })
})

describe('what the loader may not do', () => {
  const both = `${bootstrap}\n${loader}`

  it('touches no storage on the agency site', () => {
    for (const forbidden of ['document.cookie', 'localStorage', 'sessionStorage', 'indexedDB']) {
      expect(both, forbidden).not.toContain(forbidden)
    }
  })

  it('makes no requests of its own and loads no fonts', () => {
    for (const forbidden of ['fetch(', 'XMLHttpRequest', 'fonts.googleapis', '@font-face']) {
      expect(both, forbidden).not.toContain(forbidden)
    }
  })

  it('reads nothing out of the host page beyond its own tag and its target', () => {
    // document.currentScript and one querySelector for the target are the only
    // two ways it is allowed to look at the page it was pasted into.
    expect(loader).toContain('document.currentScript')
    expect(loader.match(/document\.querySelector/g) ?? []).toHaveLength(1)
    for (const forbidden of ['document.forms', 'document.cookie', 'document.referrer']) {
      expect(both, forbidden).not.toContain(forbidden)
    }
  })

  it('has no dependencies', () => {
    for (const forbidden of ['require(', 'import ', 'from "', "from '"]) {
      expect(both, forbidden).not.toContain(forbidden)
    }
  })
})

describe('what the loader must do', () => {
  it('checks both the origin and the sender of every message', () => {
    expect(loader).toContain('event.origin !== origin')
    expect(loader).toContain('event.source !== frame.contentWindow')
  })

  it('refuses to open anything that is not one of our own reports', () => {
    expect(loader).toContain('url.origin !== origin')
  })

  it('reserves height before the iframe exists, so nothing on the page jumps', () => {
    expect(loader).toContain('MIN_HEIGHT = 220')
    expect(loader).toContain('minHeight')
  })

  it('loads async and derives our address from its own tag, never a constant', () => {
    expect(bootstrap).toContain('loader.async = true')
    expect(bootstrap).toContain('new URL(me.src')
    expect(loader).toContain('new URL(me.src')
    expect(loader).not.toMatch(/https:\/\/siteauditserver\.com['"]/)
  })

  it('tells the frame which key, which mode and which page it is on, and no more', () => {
    expect(loader).toContain('encodeURIComponent(key)')
    expect(loader).toContain('encodeURIComponent(window.location.hostname)')
    expect(loader).toContain("'?mode='")
  })
})
