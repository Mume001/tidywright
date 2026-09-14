import { CheckCircle2 } from 'lucide-react'
import type { Fix } from '@tw/shared'
import { SeverityBadge } from '../components/badge'
import { FixCard } from '../components/fix-card'

export interface FixesSectionProps {
  fixes: Fix[]
  /** On score_only the labels are shown and the written fixes are not. */
  scoreOnly: boolean
  agencyName: string
  /** Nothing failed at all, so the space becomes praise rather than a gap. */
  nothingToFix: boolean
  onCopy?: (kind: string) => void
}

/**
 * Row 2: the reason the product exists, above the fold and open.
 * docs/15-frontend-spec.md and docs/13-widget-spec.md.
 *
 * Three cases. Normally the written fixes. On the pilot's score_only variant the
 * labels only, so the two halves of the experiment differ in exactly one thing.
 * And when a page has nothing wrong, praise: docs/13-widget-spec.md is explicit
 * that this is said as a compliment, not left as an empty slot.
 */
export function FixesSection({
  fixes,
  scoreOnly,
  agencyName,
  nothingToFix,
  onCopy,
}: FixesSectionProps) {
  if (nothingToFix) {
    return (
      <section className="mt-9">
        <div className="flex gap-3.5 rounded-[var(--radius-card)] border border-score-good/30 bg-score-good/8 p-5">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-score-good-ink" aria-hidden />
          <div>
            <h2 className="font-display text-base font-bold">Nothing needed fixing</h2>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-tx2">
              Every check that could run on this page passed. That is rare. The full list is below
              if you want to see what was looked at.
            </p>
          </div>
        </div>
      </section>
    )
  }

  const count = fixes.length

  return (
    <section className="mt-9">
      <div className="mb-3.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-display text-xl font-bold tracking-tight">
          {count === 3
            ? 'Three fixes to do today'
            : `${count === 1 ? 'One fix' : `${count} fixes`} to do today`}
        </h2>
        <p className="text-[13px] text-tx2">
          {scoreOnly
            ? `Written for this page. ${agencyName} has them.`
            : 'Written for this page. Copy and paste into your CMS.'}
        </p>
      </div>

      {scoreOnly
        ? fixes.map((fix) => (
            <div
              key={fix.kind}
              className="mb-2 flex items-center gap-3 rounded-[var(--radius-card)] border border-line bg-panel px-4 py-3.5"
            >
              <SeverityBadge severity={fix.severity} />
              <span className="text-[14px] font-semibold">{fix.label}</span>
            </div>
          ))
        : fixes.map((fix) => <FixCard key={fix.kind} fix={fix} onCopy={onCopy} />)}
    </section>
  )
}
