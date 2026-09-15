import { useId } from 'react'
import { cn } from '../lib/cn'

export interface SparklineProps {
  values: readonly number[]
  width?: number
  height?: number
  className?: string
  /** Line colour. Defaults to the accent, which is lime on the app theme. */
  stroke?: string
  /** A soft fill under the line. Off in a table row, on in a KPI card. */
  fill?: boolean
  /** Screen readers get this instead of the shape. */
  label?: string
}

/**
 * Seven or thirty numbers, drawn small. Hand rolled SVG rather than a chart
 * library: this is a polyline, and the smallest charting dependency is heavier
 * than every component in this package put together.
 *
 * A flat series still draws a line through the middle rather than along the
 * floor, because a flat week is not the same picture as a dead one.
 */
export function Sparkline({
  values,
  width = 72,
  height = 24,
  className,
  stroke = 'var(--color-lime)',
  fill = false,
  label,
}: SparklineProps) {
  const gradientId = useId()

  if (values.length === 0) return null

  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min
  const step = values.length > 1 ? width / (values.length - 1) : 0

  const points = values.map((value, index) => {
    const x = index * step
    // Two pixels of padding top and bottom so the stroke is never clipped.
    const y = span === 0 ? height / 2 : height - 2 - ((value - min) / span) * (height - 4)
    return [x, y] as const
  })

  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${line} ${width},${height} 0,${height}`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn('overflow-visible', className)}
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {fill && (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={area} fill={`url(#${gradientId})`} />
        </>
      )}
      <polyline
        points={line}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export interface BarChartProps {
  values: readonly { day: string; value: number }[]
  height?: number
  className?: string
  label?: string
}

/**
 * Thirty days, one bar each. Same reasoning as the sparkline: a bar chart with
 * no axes, no tooltip library and no legend is thirty rectangles.
 *
 * The date under the bars is only shown for the first, middle and last day, so
 * the row stays readable at 390 px without rotating anything.
 */
export function BarChart({ values, height = 120, className, label }: BarChartProps) {
  if (values.length === 0) return null

  const max = Math.max(...values.map((v) => v.value), 1)
  const marks = [0, Math.floor(values.length / 2), values.length - 1]

  return (
    <div className={cn('w-full', className)}>
      <div
        className="flex items-end gap-[3px]"
        style={{ height }}
        role={label ? 'img' : undefined}
        aria-label={label}
      >
        {values.map((point) => (
          <div
            key={point.day}
            className="flex-1 rounded-t-[2px] bg-lime/70 transition-colors hover:bg-lime"
            style={{ height: `${Math.max(2, (point.value / max) * 100)}%` }}
            title={`${point.day}: ${point.value}`}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-tx2">
        {marks.map((index) => (
          <span key={index}>{values[index]?.day.slice(5)}</span>
        ))}
      </div>
    </div>
  )
}
