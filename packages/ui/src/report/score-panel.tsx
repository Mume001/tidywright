import type { AuditSummary, ReportLayout } from '@tw/shared'
import { Badge } from '../components/badge'
import { GroupBars } from '../components/group-bars'
import { ScoreRing } from '../components/score-ring'

export interface ScorePanelProps {
  score: number
  headline: string
  /** Written by a rule in packages/shared, never by the model. */
  sentence: string
  counts: AuditSummary['counts']
  layout: ReportLayout
}

/**
 * Row 1 of the report: the number, what it means in one line, and the ten group
 * scores. docs/15-frontend-spec.md.
 *
 * The ring takes its colour from the score band and not from the agency brand,
 * so a 34 reads as bad on a blue agency and on a green one. The brand colour is
 * on the strip above, the call to action and the links.
 */
export function ScorePanel({ score, headline, sentence, counts, layout }: ScorePanelProps) {
  return (
    <section className="rounded-[var(--radius-card)] border border-line bg-panel p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] sm:p-7">
      <div className="flex flex-wrap items-center gap-x-9 gap-y-6">
        <ScoreRing score={score} size={160} className="mx-auto sm:mx-0" />

        <div className="min-w-[260px] flex-1">
          <h1 className="font-display text-[22px] leading-tight font-bold tracking-tight sm:text-2xl">
            {headline}
          </h1>
          <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-tx2">{sentence}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {counts.critical > 0 && <Badge tone="bad">{counts.critical} critical</Badge>}
            {counts.warning > 0 && <Badge tone="mid">{counts.warning} warnings</Badge>}
            {counts.passed > 0 && <Badge tone="good">{counts.passed} passed</Badge>}
          </div>
        </div>
      </div>

      <GroupBars groups={layout.groups} className="mt-7 border-t border-line pt-6" />
    </section>
  )
}
