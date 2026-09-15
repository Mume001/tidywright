import { describe, expect, it } from 'vitest'
import {
  FORM_ERROR_MESSAGES,
  formErrorMessage,
  isBlockedHost,
  isDisposableEmail,
  isValidEmail,
  MAX_URL_LENGTH,
  normalizeEmail,
  normalizeUrl,
} from '../validate'

function expectOk(input: string) {
  const result = normalizeUrl(input)
  if (!result.ok) throw new Error(`expected ${input} to normalise, got ${result.code}`)
  return result.value
}

function expectCode(input: string, code: string) {
  const result = normalizeUrl(input)
  expect(result.ok, `expected ${input} to be refused`).toBe(false)
  if (!result.ok) expect(result.code).toBe(code)
}

describe('normalizeUrl', () => {
  it('adds https when the visitor types a bare host', () => {
    expect(expectOk('example.com').url).toBe('https://example.com/')
  })

  it('keeps an explicit http scheme, because that is itself a finding', () => {
    expect(expectOk('http://example.com').url).toBe('http://example.com/')
  })

  it('lower cases the host and leaves the path alone', () => {
    const value = expectOk('https://EXAMPLE.com/Services/Roofing')
    expect(value.host).toBe('example.com')
    expect(value.url).toBe('https://example.com/Services/Roofing')
  })

  it('drops the fragment and keeps the query, which often selects the page', () => {
    expect(expectOk('example.com/p?id=7#pricing').url).toBe('https://example.com/p?id=7')
  })

  it('trims what was pasted', () => {
    expect(expectOk('  example.com  ').host).toBe('example.com')
  })

  it('refuses a scheme we will not fetch', () => {
    expectCode('javascript:alert(1)', 'invalid_url')
    expectCode('ftp://example.com', 'invalid_url')
    expectCode('data:text/html,hi', 'invalid_url')
  })

  it('refuses a bare word and an empty field', () => {
    expectCode('example', 'invalid_url')
    expectCode('   ', 'invalid_url')
  })

  it('refuses anything longer than the spec allows', () => {
    expectCode(`https://example.com/${'a'.repeat(MAX_URL_LENGTH)}`, 'invalid_url')
  })

  it('refuses private and loopback addresses', () => {
    for (const host of [
      'localhost',
      '127.0.0.1',
      '10.0.0.5',
      '172.16.0.1',
      '172.31.255.254',
      '192.168.1.1',
      '169.254.169.254',
      'printer.local',
      'box.internal',
    ]) {
      expectCode(host, 'blocked_target')
    }
  })

  it('lets public addresses that only look private through', () => {
    expect(expectOk('172.32.0.1').host).toBe('172.32.0.1')
    expect(expectOk('192.169.1.1').host).toBe('192.169.1.1')
    expect(expectOk('11.0.0.1').host).toBe('11.0.0.1')
  })

  it('refuses our own surfaces', () => {
    expectCode('https://siteauditserver.com/r/abc', 'blocked_target')
    expectCode('https://app.tidywright.com', 'blocked_target')
  })

  it('does not refuse a host that merely ends with our brand', () => {
    expect(expectOk('nottidywright.com').host).toBe('nottidywright.com')
  })
})

describe('isBlockedHost', () => {
  it('catches IPv6 loopback and unique local addresses', () => {
    expect(isBlockedHost('[::1]')).toBe(true)
    expect(isBlockedHost('[fd00::1]')).toBe(true)
    expect(isBlockedHost('[fe80::1]')).toBe(true)
    expect(isBlockedHost('[2606:4700::1111]')).toBe(false)
  })
})

describe('email', () => {
  it('accepts ordinary addresses', () => {
    for (const email of ['amir@example.com', 'first.last+tag@sub.example.co.uk']) {
      expect(isValidEmail(email), email).toBe(true)
    }
  })

  it('rejects typos', () => {
    for (const email of ['amir@northwind', 'amir@', '@example.com', 'amir example.com', '']) {
      expect(isValidEmail(email), email).toBe(false)
    }
  })

  it('rejects an address longer than an SMTP envelope allows', () => {
    expect(isValidEmail(`${'a'.repeat(250)}@example.com`)).toBe(false)
  })

  it('knows the throwaway inboxes', () => {
    expect(isDisposableEmail('someone@mailinator.com')).toBe(true)
    expect(isDisposableEmail('someone@Mailinator.com')).toBe(true)
    expect(isDisposableEmail('someone@example.com')).toBe(false)
  })

  it('normalises to lower case and reports the right code', () => {
    expect(normalizeEmail('  Amir@Example.COM ')).toEqual({ ok: true, value: 'amir@example.com' })
    expect(normalizeEmail('nope')).toEqual({ ok: false, code: 'invalid_email' })
    expect(normalizeEmail('a@yopmail.com')).toEqual({ ok: false, code: 'disposable_email' })
  })
})

describe('error messages', () => {
  it('has a sentence for every code and never leaks the code itself', () => {
    for (const [code, message] of Object.entries(FORM_ERROR_MESSAGES)) {
      expect(message.length, code).toBeGreaterThan(10)
      expect(message).not.toContain('_')
    }
  })

  it('falls back to the generic sentence for anything unknown', () => {
    expect(formErrorMessage('something_new')).toBe(FORM_ERROR_MESSAGES.server_error)
    expect(formErrorMessage('invalid_url')).toBe(FORM_ERROR_MESSAGES.invalid_url)
  })
})
