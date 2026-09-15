import type { ReportGroup } from '@tw/shared'
import { ScoreBar } from './score-bar'
import { cn } from '../lib/cn'

export interface GroupBarsProps {
  groups: ReportGroup[]
  className?: string
}

/**
 * The ten group scores. docs/15-frontend-spec.md, row 1 of the report.
 *
 * Two columns of five on a desktop, one column on a phone. Each bar carries the
 * sentence from GROUP_INTROS underneath, because "Accessibility 44" means
 * nothing to the person reading it without one.
 */
export function GroupBars({ groups, className }: GroupBarsProps) {
  return (
    <div className={cn('grid gap-x-8 gap-y-1 sm:grid-cols-2', className)}>
      {groups.map((group) => (
        <div key={group.group}>
          <ScoreBar label={group.label} value={group.score} />
          <p className="-mt-2 mb-4 text-[12px] leading-snug text-tx3">{group.intro}</p>
        </div>
      ))}
    </div>
  )
}
