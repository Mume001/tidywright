import { scoreBand, SCORE_COLOR } from '../lib/score'

export interface ScoreBarProps {
  label: string
  value: number
}

/** One of the four group sub-scores under the ring. */
export function ScoreBar({ label, value }: ScoreBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)))
  const colour = SCORE_COLOR[scoreBand(clamped)]
  return (
    <div className="mb-3.5">
      <div className="flex items-baseline text-[13px] font-semibold">
        <span>{label}</span>
        <span className="tabular ml-auto" style={{ color: colour }}>
          {clamped}
        </span>
      </div>
      <div
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-panel2"
        role="meter"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${clamped}%`,
            background: colour,
            transition: 'width 800ms var(--ease-out-fast)',
          }}
        />
      </div>
    </div>
  )
}
