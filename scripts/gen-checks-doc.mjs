/**
 * Regenerates the per-group tables in docs/05-checks.md from the catalogue.
 *
 * The document says it is generated from code and that the code wins when the
 * two disagree. This is the thing that makes that true. It rewrites everything
 * from the first group heading to the end of the file and leaves the prose above
 * it alone, because the prose is written by hand and the tables are not.
 *
 *   pnpm docs:checks
 *
 * The summary table in the prose is checked by hand against the numbers this
 * prints. If they differ, the prose is wrong.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  CHECKS,
  GROUP_INTROS,
  GROUP_LABELS,
  GROUP_WEIGHTS,
} from '../packages/shared/src/checks-catalog.ts'

const SEVERITY = { critical: 'K', warning: 'V', notice: 'N' }
const IMPACT = { blocker: 'blokator', serp: 'prikaz', quality: 'kvalitet', hygiene: 'higijena' }

/** Heaviest group first, which is the order the report itself uses. */
const GROUP_ORDER = Object.keys(GROUP_WEIGHTS).sort((a, b) => GROUP_WEIGHTS[b] - GROUP_WEIGHTS[a])

/** `stranica` means the one fetch we make anyway. Anything else is named. */
function needsLabel(needs) {
  const extra = needs.filter((n) => n !== 'html')
  return extra.length === 0 ? 'stranica' : extra[0]
}

function tables() {
  let out = ''
  for (const group of GROUP_ORDER) {
    const rows = CHECKS.filter((c) => c.group === group)
    out += `## ${GROUP_LABELS[group]}\n\n${GROUP_INTROS[group]}\n\n`
    out += `Težina u ukupnoj ocjeni: ${GROUP_WEIGHTS[group]} od 100.\n\n`
    out += '| Kod | Provjera | Ozb. | Uticaj | Popravka | Treba | Faza |\n'
    out += '|---|---|---|---|---|---|---|\n'
    for (const c of rows) {
      const cells = [
        `\`${c.code}\``,
        c.title,
        SEVERITY[c.severity],
        IMPACT[c.impact],
        c.fixable ? 'A' : 'R',
        needsLabel(c.needs),
        String(c.phase),
      ]
      out += `| ${cells.join(' | ')} |\n`
    }
    out += '\n'
  }
  return out.trimEnd() + '\n'
}

function summary() {
  const lines = ['', 'Za ručnu provjeru sažetka gore:']
  for (const group of GROUP_ORDER) {
    const rows = CHECKS.filter((c) => c.group === group)
    const critical = rows.filter((c) => c.severity === 'critical').length
    const blockers = rows.filter((c) => c.impact === 'blocker').length
    const fixable = Math.round((rows.filter((c) => c.fixable).length / rows.length) * 100)
    lines.push(
      `  ${GROUP_LABELS[group].padEnd(20)} ${String(rows.length).padStart(3)} provjera` +
        `, ${critical} kritičnih, ${blockers} blokatora, ${fixable}% popravljivo`,
    )
  }
  const fixable = Math.round((CHECKS.filter((c) => c.fixable).length / CHECKS.length) * 100)
  lines.push(
    `  ${'Ukupno'.padEnd(20)} ${String(CHECKS.length).padStart(3)} provjera` +
      `, ${CHECKS.filter((c) => c.severity === 'critical').length} kritičnih` +
      `, ${CHECKS.filter((c) => c.impact === 'blocker').length} blokatora, ${fixable}% popravljivo`,
  )
  return lines.join('\n')
}

const doc = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', '05-checks.md')
const current = readFileSync(doc, 'utf8')
const firstGroup = `## ${GROUP_LABELS[GROUP_ORDER[0]]}\n`
const cut = current.indexOf(firstGroup)

if (cut === -1) {
  console.error(`gen-checks-doc: cannot find "${firstGroup.trim()}" in docs/05-checks.md`)
  process.exit(1)
}

writeFileSync(doc, current.slice(0, cut) + tables())
console.log(`docs/05-checks.md: ${CHECKS.length} checks written`)
console.log(summary())
