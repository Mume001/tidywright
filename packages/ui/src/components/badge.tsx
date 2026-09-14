import { cva, type VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'
import type { LeadStatus, Severity } from '@tw/shared'
import { cn } from '../lib/cn'

const badge = cva(
  'inline-flex h-[21px] items-center gap-1.5 rounded-full px-2 text-[10.5px] font-semibold tracking-[0.2px] whitespace-nowrap',
  {
    variants: {
      // Tint from the band colour, letters from its ink. The two differ on the
      // white report, where the bar colour is too light to read at 10.5px.
      tone: {
        neutral: 'bg-tx2/12 text-tx2',
        good: 'bg-score-good/14 text-score-good-ink',
        mid: 'bg-score-mid/14 text-score-mid-ink',
        bad: 'bg-score-bad/15 text-score-bad-ink',
        info: 'bg-violet/15 text-violet-ink',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

export interface BadgeProps extends VariantProps<typeof badge> {
  children: ReactNode
  className?: string
}

export function Badge({ tone, children, className }: BadgeProps) {
  return <span className={cn(badge({ tone }), className)}>{children}</span>
}

const LEAD_TONE: Record<LeadStatus, NonNullable<BadgeProps['tone']>> = {
  new: 'info',
  contacted: 'neutral',
  qualified: 'mid',
  won: 'good',
  lost: 'neutral',
  spam: 'bad',
}

const LEAD_LABEL: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  won: 'Won',
  lost: 'Lost',
  spam: 'Spam',
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <Badge tone={LEAD_TONE[status]}>{LEAD_LABEL[status]}</Badge>
}

const SEVERITY_TONE: Record<Severity, NonNullable<BadgeProps['tone']>> = {
  critical: 'bad',
  warning: 'mid',
  notice: 'info',
}

const SEVERITY_LABEL: Record<Severity, string> = {
  critical: 'Critical',
  warning: 'Warning',
  notice: 'Notice',
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return <Badge tone={SEVERITY_TONE[severity]}>{SEVERITY_LABEL[severity]}</Badge>
}
