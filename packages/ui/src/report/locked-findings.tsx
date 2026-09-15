import type { CheckResult } from '@tw/shared'
import { SeverityBadge } from '../components/badge'
import { ButtonLink } from '../components/button'

export interface LockedFindingsProps {
  findings: CheckResult[]
  agencyName: string
  ctaLabel: string
  /** cta_url, then calendar_url, then a mailto. Resolved by the caller. */
  ctaUrl: string
  onCtaClick?: () => void
}

/**
 * Row 4: the rest of the findings, blurred, under the agency's call to action.
 * docs/15-frontend-spec.md 2.1.
 *
 * The blur is a message, not a lock. The HTML is public and anybody who wants
 * the text can read it, which is why nothing secret is ever put here. What it
 * does is make the size of what is left visible, so the button underneath has
 * something to be about.
 *
 * The blurred block is hidden from assistive technology: it is decoration
 * standing in for a quantity, and a screen reader should be told the quantity
 * instead, which the card does in words.
 */
export function LockedFindings({
  findings,
  agencyName,
  ctaLabel,
  ctaUrl,
  onCtaClick,
}: LockedFindingsProps) {
  const count = findings.length
  const sample = findings.slice(0, 6)

  return (
    <section className="relative mt-9">
      {count > 0 && (
        <div aria-hidden className="pointer-events-none blur-[4px] select-none">
          {sample.map((finding) => (
            <div
              key={finding.code}
              className="mb-2 flex items-center gap-3 rounded-[var(--radius-card)] border border-line bg-panel px-4.5 py-3.5"
            >
              <SeverityBadge severity={finding.severity} />
              <span className="text-[14px] font-semibold">{finding.title}</span>
              <span className="ml-auto text-[13px] text-tx3">details</span>
            </div>
          ))}
        </div>
      )}

      <div
        className={
          count > 0
            ? 'absolute inset-0 flex items-center justify-center px-3'
            : 'flex items-center justify-center'
        }
      >
        <div className="w-full max-w-[520px] rounded-[var(--radius-card)] border border-line bg-panel p-6 text-center shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
          <h2 className="font-display text-lg font-bold tracking-tight">
            {count > 0
              ? `${count} more ${count === 1 ? 'finding' : 'findings'} and the full technical checklist`
              : 'Want somebody to look at the rest of the site?'}
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-tx2">
            {agencyName} can walk you through the rest and handle the fixes.
          </p>
          <ButtonLink
            size="lg"
            href={ctaUrl}
            target="_blank"
            rel="noopener"
            onClick={onCtaClick}
            className="mt-4 h-[46px] w-full max-w-[300px] text-[15px]"
          >
            {ctaLabel}
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
