import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

export type BannerTone = 'info' | 'warning' | 'danger' | 'success'

const CONFIG: Record<BannerTone, { icon: typeof Info; classes: string }> = {
  info: { icon: Info, classes: 'border-violet/40 bg-violet/10 text-violet' },
  warning: { icon: AlertTriangle, classes: 'border-score-mid/40 bg-score-mid/10 text-score-mid' },
  danger: { icon: XCircle, classes: 'border-score-bad/40 bg-score-bad/10 text-score-bad' },
  success: { icon: CheckCircle2, classes: 'border-score-good/40 bg-score-good/10 text-score-good' },
}

export interface BannerProps {
  tone?: BannerTone
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
}

/** Payment failed, trial ending, quota at 80 percent, domain warming up. */
export function Banner({ tone = 'info', title, description, action, className }: BannerProps) {
  const { icon: Icon, classes } = CONFIG[tone]
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-[var(--radius-card)] border px-4 py-3',
        classes,
        className,
      )}
      role="status"
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold">{title}</div>
        {description && <div className="mt-1 text-xs text-tx2">{description}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
