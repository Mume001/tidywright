import { scoreBand, SCORE_COLOR } from '../lib/score'
import { cn } from '../lib/cn'

export interface ScoreRingProps {
  score: number
  size?: number
  /** Hidden in compact placements such as table rows. */
  showCaption?: boolean
  className?: string
}

/**
 * The number the visitor sees first. Colour comes from the band, never from the
 * agency brand, because a red 34 has to read as bad even on a red brand.
 */
export function ScoreRing({ score, size = 160, showCaption = true, className }: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)))
  const stroke = size < 80 ? 6 : size < 120 ? 10 : 14
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - clamped / 100)
  const colour = SCORE_COLOR[scoreBand(clamped)]

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn('shrink-0', className)}
      role="img"
      aria-label={`SEO score ${clamped} out of 100`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-panel2)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={colour}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 800ms var(--ease-out-fast)' }}
      />
      <text
        x="50%"
        y={showCaption ? '48%' : '54%'}
        textAnchor="middle"
        className="tabular fill-tx font-display font-bold"
        style={{ fontSize: size * 0.29 }}
      >
        {clamped}
      </text>
      {showCaption && (
        <text
          x="50%"
          y="66%"
          textAnchor="middle"
          className="fill-tx3"
          style={{ fontSize: size * 0.075 }}
        >
          out of 100
        </text>
      )}
    </svg>
  )
}

export function ScoreNumber({ score }: { score: number }) {
  const band = scoreBand(score)
  return (
    <span className="tabular font-mono font-semibold" style={{ color: SCORE_COLOR[band] }}>
      {score}
    </span>
  )
}
