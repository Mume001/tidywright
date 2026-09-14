import { describe, expect, it } from 'vitest'
import { contrastRatio, isHexColor, onPrimary, readableInk, readableOnWhite } from '../contrast'

describe('contrast', () => {
  it('matches the known WCAG ratio for black on white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1)
  })

  it('puts white text on a dark brand and black text on a light one', () => {
    expect(onPrimary('#1F5AF6')).toBe('#ffffff')
    expect(onPrimary('#0F766E')).toBe('#ffffff')
    expect(onPrimary('#FFE600')).toBe('#111111')
    expect(onPrimary('#B6E24A')).toBe('#111111')
  })

  it('flags a brand colour that cannot be read as text on white', () => {
    expect(readableOnWhite('#1F5AF6')).toBe(true)
    expect(readableOnWhite('#FFE600')).toBe(false)
  })

  it('accepts three digit hex', () => {
    expect(onPrimary('#000')).toBe('#ffffff')
  })
})

describe('readableInk', () => {
  it('darkens a brand colour until it can be read on white', () => {
    for (const brand of ['#FFE600', '#C2410C', '#1F5AF6', '#0F766E', '#B6E24A', '#ff69b4']) {
      expect(readableOnWhite(readableInk(brand)), brand).toBe(true)
    }
  })

  it('leaves a colour that already passes alone', () => {
    expect(readableInk('#1F5AF6')).toBe('#1f5af6')
  })

  it('darkens even white far enough to be read, rather than giving up', () => {
    expect(readableOnWhite(readableInk('#ffffff'))).toBe(true)
  })

  it('falls back to our ink when handed something that is not a colour', () => {
    expect(readableInk('not a colour')).toBe('#16161a')
    expect(readableInk('')).toBe('#16161a')
  })

  it('recognises the colours the branding form will accept', () => {
    expect(isHexColor('#1F5AF6')).toBe(true)
    expect(isHexColor('#abc')).toBe(true)
    expect(isHexColor('red')).toBe(false)
    expect(isHexColor('#12345')).toBe(false)
  })
})
