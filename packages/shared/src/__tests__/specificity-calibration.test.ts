import { describe, expect, it } from 'vitest'
import { analyseSpecificity } from '../specificity'

const PAGE = `
Northwind Kitchens, Portland Oregon. We design and fit shaker kitchens and custom
cabinets. Everything is built in our own workshop on Naito Parkway. Most projects
take 4 to 6 weeks from survey to fitting. We also do worktop replacement in oak,
walnut and quartz. Showroom open Monday to Friday. Free survey and quote.
`
const base = { pageContent: PAGE, brandName: 'Northwind Kitchens', location: 'Portland' }

// verdict we WANT, then the text
const CASES: [boolean, 'title' | 'meta', string][] = [
  // should PASS: specific, drawn from the page
  [
    true,
    'meta',
    'Shaker kitchens and custom cabinets, built in our Naito Parkway workshop. Survey to fitting in about six weeks.',
  ],
  [
    true,
    'meta',
    'We fit shaker kitchens in Portland and make the cabinets ourselves. Oak, walnut or quartz worktops, free survey.',
  ],
  [true, 'title', 'Shaker Kitchens and Custom Cabinets | Northwind'],
  [true, 'title', 'Custom Cabinets and Worktops, Portland Workshop'],
  [
    true,
    'meta',
    'Oak, walnut and quartz worktop replacement from a Portland workshop. Showroom open weekdays, free survey and quote.',
  ],

  // should FAIL: true, clean, and says nothing
  [
    false,
    'meta',
    'Quality kitchen services for your home. Contact our experienced team today to learn more about what we offer.',
  ],
  [
    false,
    'meta',
    'We are a trusted local company committed to providing the best service for all of your needs.',
  ],
  [false, 'title', 'Northwind Kitchens | Portland'],
  [
    false,
    'meta',
    'Looking for a kitchen company in Portland? Our professional team offers a wide range of options to suit you.',
  ],
  [false, 'title', 'Quality Kitchen Services'],
  [
    false,
    'meta',
    'Northwind Kitchens is your local Portland company. We provide quality service and great customer care every time.',
  ],
]

/**
 * A regression guard on the thresholds in specificity.ts. They were picked from the
 * gap this table shows: good copy lands at 0.67 to 0.83 density, weak copy at 0.00 to
 * 0.33. If somebody tunes a number, this test says whether they broke the separation.
 */
describe('threshold calibration', () => {
  it('classifies real looking copy the way a person would', () => {
    const rows: string[] = []
    let wrong = 0
    for (const [want, kind, text] of CASES) {
      const r = analyseSpecificity(text, { ...base, kind })
      const got = r.violations.length === 0
      if (got !== want) wrong += 1
      rows.push(
        [
          got === want ? 'ok  ' : 'MISS',
          want ? 'good' : 'weak',
          got ? 'pass' : 'fail',
          `d=${r.density.toFixed(2)}`,
          `g=${r.grounded.length}`,
          `swap=${r.survivesSwap ? 'y' : 'n'}`,
          text.slice(0, 58),
          r.violations
            .map((v) => v.detail)
            .join(' | ')
            .slice(0, 70),
        ].join('  '),
      )
    }
    expect(wrong, `misclassified ${wrong} of ${CASES.length}:\n${rows.join('\n')}`).toBe(0)
  })
})
