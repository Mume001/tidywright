import { describe, expect, it } from 'vitest'
import { contrastRatio, onPrimary, readableOnWhite } from '../contrast'

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
