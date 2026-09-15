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
    // Wraps on a phone, where the report has to be readable at 360 px, and sits
    // on one line from the small breakpoint up, which is every app screen.
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line px-4.5 py-2.5 text-[13px] first:border-t-0">
      <Badge tone={TONE[check.status]}>
        <Icon className="size-3" aria-hidden />
        {LABEL[check.status]}
      </Badge>
      <span className="font-semibold sm:w-56 sm:shrink-0">{check.title}</span>
      <span className="min-w-0 basis-full text-tx2 sm:flex-1 sm:basis-auto sm:truncate">
        {check.detail}
      </span>
      <code className="shrink-0 font-mono text-[11px] text-tx3 sm:ml-auto">{check.code}</code>
    </div>
  )
}
