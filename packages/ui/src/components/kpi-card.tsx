import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import { Card } from './card'

export interface KpiCardProps {
  label: string
  value: ReactNode
  sub?: ReactNode
  /** Positive is good by default. Set inverted for metrics where up is bad. */
  delta?: { value: number; inverted?: boolean }
  tone?: 'default' | 'good' | 'mid' | 'bad'
  className?: string
}

const TONE_CLASS = {
  default: 'text-tx',
  good: 'text-score-good-ink',
  mid: 'text-score-mid-ink',
  bad: 'text-score-bad-ink',
} as const

export function KpiCard({ label, value, sub, delta, tone = 'default', className }: KpiCardProps) {
  const good = delta ? (delta.inverted ? delta.value < 0 : delta.value > 0) : null
  return (
    <Card className={cn('flex-1 p-4.5', className)}>
      <div className="text-[10px] font-semibold tracking-wider text-tx3 uppercase">{label}</div>
      <div
        className={cn(
          'tabular my-2.5 font-display text-3xl font-semibold tracking-tight',
          TONE_CLASS[tone],
        )}
      >
        {value}
      </div>
      <div className="flex items-center gap-2 text-xs text-tx2">
        {delta && (
          <span className={good ? 'text-score-good-ink' : 'text-score-bad-ink'}>
            {delta.value > 0 ? '▲' : '▼'} {Math.abs(delta.value)}%
          </span>
        )}
        {sub}
      </div>
    </Card>
  )
}
