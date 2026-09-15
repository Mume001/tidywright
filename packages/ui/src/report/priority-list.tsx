import type { CheckResult } from '@tw/shared'
import { SeverityBadge } from '../components/badge'

export interface PriorityListProps {
  findings: CheckResult[]
}

/**
 * Row 3, "Fix this first". docs/15-frontend-spec.md.
 *
 * Six findings out of up to 176, chosen by severity and by what the group costs
 * in the score. It answers the only question the visitor actually has, and it
 * never repeats anything the three written fixes above already answered.
 */
export function PriorityList({ findings }: PriorityListProps) {
  if (findings.length === 0) return null

  return (
    <section className="mt-9">
      <h2 className="mb-3.5 font-display text-xl font-bold tracking-tight">Fix this first</h2>

      <ol className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-panel">
        {findings.map((finding) => (
          <li
            key={finding.code}
            className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-line px-4.5 py-3.5 first:border-t-0"
          >
            <span className="self-center">
              <SeverityBadge severity={finding.severity} />
            </span>
            <span className="text-[14px] font-semibold">{finding.title}</span>
            <span className="basis-full text-[13px] leading-relaxed text-tx2 sm:flex-1 sm:basis-auto">
              {finding.detail}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
