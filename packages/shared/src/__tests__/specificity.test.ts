import { describe, expect, it } from 'vitest'
import { analyseSpecificity, contentTerms, findGenericCopy, similarity } from '../specificity'

const PAGE = `
Northwind Kitchens, Portland Oregon. We design and fit shaker kitchens and custom
cabinets. Everything is built in our own workshop on Naito Parkway. Most projects
take 4 to 6 weeks from survey to fitting. We also do worktop replacement in oak,
walnut and quartz. Showroom open Monday to Friday.
`

const ctx = {
  pageContent: PAGE,
  brandName: 'Northwind Kitchens',
  location: 'Portland',
  kind: 'meta' as const,
}

const details = (v: { detail: string }[]) => v.map((x) => x.detail)

describe('content terms', () => {
  it('keeps meaning and drops grammar and business filler', () => {
    const terms = contentTerms('We provide quality kitchen services for your home in Portland')
    expect(terms).toContain('kitchen')
    expect(terms).toContain('portland')
    expect(terms).not.toContain('quality')
    expect(terms).not.toContain('services')
    expect(terms).not.toContain('we')
    expect(terms).not.toContain('your')
  })
})

describe('generic copy that breaks no other rule', () => {
  it('rejects filler that any competitor could paste', () => {
    const found = findGenericCopy(
      'Quality kitchen services for your home. Contact our experienced team to learn more today.',
      ctx,
    )
    expect(found.length).toBeGreaterThan(0)
  })

  it('rejects a name and a town with nothing behind them', () => {
    const found = findGenericCopy(
      'Northwind Kitchens, your trusted local company in Portland.',
      ctx,
    )
    expect(details(found)).toEqual(
      expect.arrayContaining([expect.stringContaining('nothing left once the business name')]),
    )
  })

  it('accepts copy built from what the page actually says', () => {
    const report = analyseSpecificity(
      'Shaker kitchens and custom cabinets built in our own Portland workshop, survey to fitting in 6 weeks.',
      ctx,
    )
    expect(report.violations).toEqual([])
    expect(report.grounded).toEqual(
      expect.arrayContaining(['shaker', 'cabinets', 'workshop', 'fitting']),
    )
    expect(report.survivesSwap).toBe(true)
  })

  it('measures density, not just word count', () => {
    const thin = analyseSpecificity(
      'We are a company that can help you with all of your needs and provide the best service.',
      ctx,
    )
    const dense = analyseSpecificity(
      'Shaker kitchens, oak and walnut worktops, fitted from our Naito Parkway workshop.',
      ctx,
    )
    expect(thin.density).toBeLessThan(dense.density)
    expect(dense.violations).toEqual([])
  })
})

describe('lift over what was already there', () => {
  it('rejects a rewrite that is no more specific than the old title', () => {
    const found = findGenericCopy('Kitchens and cabinets in Portland', {
      ...ctx,
      kind: 'title',
      previous: 'Shaker kitchens, custom cabinets and oak worktops in Portland',
    })
    expect(details(found)).toEqual(
      expect.arrayContaining([expect.stringContaining('no more specific than')]),
    )
  })

  it('accepts a rewrite that adds real detail', () => {
    const found = findGenericCopy('Shaker Kitchens and Custom Cabinets, Portland Workshop', {
      ...ctx,
      kind: 'title',
      previous: 'Home | Northwind Kitchens',
    })
    expect(found).toEqual([])
  })
})

describe('corpus check', () => {
  it('scores near identical sentences high and different ones low', () => {
    const a = 'Kitchen renovation and custom cabinets in Portland, built in house.'
    const b = 'Kitchen renovation and custom cabinets in Seattle, built in house.'
    const c = 'Emergency plumbing and drain clearing, same day across Bristol.'
    expect(similarity(a, b)).toBeGreaterThan(0.7)
    expect(similarity(a, c)).toBeLessThan(0.2)
  })

  it('rejects a sentence we already wrote for a different site', () => {
    const found = findGenericCopy(
      'Shaker kitchens and custom cabinets built in our own Portland workshop, survey to fitting in 6 weeks.',
      {
        ...ctx,
        corpus: [
          'Shaker kitchens and custom cabinets built in our own Seattle workshop, survey to fitting in 6 weeks.',
        ],
      },
    )
    expect(details(found)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('the same as copy we wrote for another site'),
      ]),
    )
  })

  it('leaves genuinely different copy alone', () => {
    const found = findGenericCopy(
      'Shaker kitchens and custom cabinets built in our own Portland workshop, survey to fitting in 6 weeks.',
      { ...ctx, corpus: ['Emergency plumbing and drain clearing, same day across Bristol.'] },
    )
    expect(found).toEqual([])
  })
})

describe('other languages', () => {
  it('skips the English word lists but still runs the swap test', () => {
    const bosnianPage = 'Northwind Kuhinje, Sarajevo. Radimo kuhinje po mjeri i ugradbene ormare.'
    const report = analyseSpecificity('Kuhinje po mjeri i ugradbeni ormari, Sarajevo', {
      pageContent: bosnianPage,
      brandName: 'Northwind Kuhinje',
      location: 'Sarajevo',
      language: 'bs',
      kind: 'title',
    })
    expect(report.survivesSwap).toBe(true)
    expect(report.violations).toEqual([])
  })
})
