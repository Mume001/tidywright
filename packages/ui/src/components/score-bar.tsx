import { scoreBand, SCORE_COLOR, SCORE_INK } from '../lib/score'

export interface ScoreBarProps {
  label: string
  value: number
}

/** One of the four group sub-scores under the ring. */
export function ScoreBar({ label, value }: ScoreBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)))
  const band = scoreBand(clamped)
  // The bar is a graphic and clears 3:1; the number beside it is a word and has
  // to clear 4.5:1, which on white the bar colour does not.
  const colour = SCORE_COLOR[band]
  return (
    <div className="mb-3.5">
      <div className="flex items-baseline text-[13px] font-semibold">
        <span>{label}</span>
        <span className="tabular ml-auto" style={{ color: SCORE_INK[band] }}>
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
