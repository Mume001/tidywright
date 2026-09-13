import { AlertTriangle, Check, Info, X } from 'lucide-react'
import type { CheckResult, CheckStatus } from '@tw/shared'
import { Badge } from './badge'

const ICON: Record<CheckStatus, typeof Check> = {
  pass: Check,
  fail: X,
  warn: AlertTriangle,
  skipped: Info,
}

const TONE: Record<CheckStatus, 'good' | 'bad' | 'mid' | 'neutral'> = {
  pass: 'good',
  fail: 'bad',
  warn: 'mid',
  skipped: 'neutral',
}

const LABEL: Record<CheckStatus, string> = {
  pass: 'Pass',
  fail: 'Fail',
  warn: 'Warn',
  skipped: 'Skipped',
}

/** One row in the full list of checks, in the report and in the audit detail. */
export function CheckRow({ check }: { check: CheckResult }) {
  const Icon = ICON[check.status]
  return (
    <div className="flex items-center gap-3 border-t border-line px-4.5 py-2.5 text-[13px] first:border-t-0">
      <Badge tone={TONE[check.status]}>
        <Icon className="size-3" aria-hidden />
        {LABEL[check.status]}
      </Badge>
      <span className="w-56 shrink-0 font-semibold">{check.title}</span>
      <span className="min-w-0 flex-1 truncate text-tx2">{check.detail}</span>
      <code className="ml-auto shrink-0 font-mono text-[11px] text-tx3">{check.code}</code>
    </div>
  )
}
