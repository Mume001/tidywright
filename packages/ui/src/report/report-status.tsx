import { Clock, RotateCw, ShieldAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { AgencyMark } from '../components/agency-mark'
import { Button, ButtonLink } from '../components/button'

/**
 * Every version of the report that is not a report. docs/15-frontend-spec.md
 * 2.1 and the drawn states in design/phase1/ReportStates.dc.html.
 *
 * All four keep the agency's mark and colour: a visitor who followed a link
 * from an agency's site should never land on a page that looks like it belongs
 * to somebody they have never heard of.
 */

export interface StatusShellProps {
  agencyName: string
  logoUrl?: string | null
  children: ReactNode
}

function StatusShell({ agencyName, logoUrl, children }: StatusShellProps) {
  return (
    <div className="mx-auto w-full max-w-[520px] overflow-hidden rounded-[var(--radius-card)] border border-line bg-panel shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="h-1 bg-lime" />
      <div className="p-6">
        <div className="flex items-center gap-2">
          <AgencyMark name={agencyName} logoUrl={logoUrl} size={20} />
          <span className="font-display text-[13.5px] font-bold tracking-tight">{agencyName}</span>
        </div>
        <div className="py-8 text-center">{children}</div>
      </div>
    </div>
  )
}

export interface ReportPendingProps {
  agencyName: string
  logoUrl?: string | null
  host: string
  /** Which of the worker's steps are behind us. */
  status: 'queued' | 'fetching' | 'checking' | 'generating'
  /** Sixty seconds of polling have gone by. docs/15-frontend-spec.md 2.1. */
  tookTooLong: boolean
}

const DONE_BY: Record<ReportPendingProps['status'], number> = {
  queued: 0,
  fetching: 0,
  checking: 1,
  generating: 2,
}

export function ReportPending({
  agencyName,
  logoUrl,
  host,
  status,
  tookTooLong,
}: ReportPendingProps) {
  const steps = ['Fetched', 'Checks run', 'Writing fixes']
  const done = DONE_BY[status]

  return (
    <StatusShell agencyName={agencyName} logoUrl={logoUrl}>
      <div
        aria-hidden
        className="mx-auto size-16 animate-spin rounded-full border-[5px] border-panel2 border-t-lime"
        style={{ animationDuration: '900ms' }}
      />
      <h1 className="mt-5 font-display text-[19px] font-bold">
        {tookTooLong ? 'This is taking longer than usual' : 'Building your report'}
      </h1>
      <p
        aria-live="polite"
        className="mx-auto mt-2 max-w-[40ch] text-[13.5px] leading-relaxed text-tx2"
      >
        {tookTooLong ? (
          <>We will email you the moment it is ready. You can close this page.</>
        ) : (
          <>
            <span className="font-mono">{host}</span>
            <br />
            This usually takes about ten seconds.
          </>
        )}
      </p>

      {!tookTooLong && (
        <ul className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-1 text-[12px]">
          {steps.map((step, index) => (
            <li key={step} className={index < done ? 'text-score-good' : 'text-tx3'}>
              {index < done ? '✓' : '○'} {step}
            </li>
          ))}
        </ul>
      )}
    </StatusShell>
  )
}

export interface ReportFailedProps {
  agencyName: string
  logoUrl?: string | null
  host: string
  reason: 'fetch' | 'blocked'
  /** Shown small, for support. Never a stack trace. */
  detail?: string | null
  onRetry?: () => void
}

export function ReportFailed({
  agencyName,
  logoUrl,
  host,
  reason,
  detail,
  onRetry,
}: ReportFailedProps) {
  const blocked = reason === 'blocked'

  return (
    <StatusShell agencyName={agencyName} logoUrl={logoUrl}>
      <div
        className={`mx-auto grid size-16 place-items-center rounded-full ${blocked ? 'bg-score-mid/12' : 'bg-score-bad/12'}`}
      >
        {blocked ? (
          <ShieldAlert className="size-8 text-score-mid" aria-hidden />
        ) : (
          <RotateCw className="size-8 text-score-bad" aria-hidden />
        )}
      </div>

      <h1 className="mt-5 font-display text-[19px] font-bold">
        {blocked ? 'The site blocked our check' : `We could not reach ${host}`}
      </h1>
      <p className="mx-auto mt-2 max-w-[44ch] text-[13.5px] leading-relaxed text-tx2">
        {blocked ? (
          <>
            <span className="font-mono">{host}</span> sits behind a filter that refused the request.
            Some Cloudflare setups do this to anything automated. {agencyName} has been told, and
            can check it another way.
          </>
        ) : (
          <>
            The address did not answer in time. That is worth fixing on its own: a page Google
            cannot reach is a page Google cannot rank.
          </>
        )}
      </p>

      {onRetry && (
        <Button variant="secondary" size="lg" className="mt-5" onClick={onRetry}>
          Try another address
        </Button>
      )}

      {detail && <p className="mt-4 font-mono text-[10.5px] text-tx3">{detail}</p>}
    </StatusShell>
  )
}

export interface ReportGoneProps {
  agencyName?: string
  logoUrl?: string | null
  /** Where a visitor can start again, when there is such a place. */
  formUrl?: string | null
}

/**
 * Served with HTTP 410, set in proxy.ts. A deleted report has to tell crawlers
 * and the agency's monitoring that it is gone, not that it is fine.
 * docs/18-data-model.md.
 */
export function ReportGone({ agencyName = 'This report', logoUrl, formUrl }: ReportGoneProps) {
  return (
    <StatusShell agencyName={agencyName} logoUrl={logoUrl}>
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-panel2">
        <Clock className="size-8 text-tx3" aria-hidden />
      </div>
      <h1 className="mt-5 font-display text-[19px] font-bold">
        This report is no longer available
      </h1>
      <p className="mx-auto mt-2 max-w-[44ch] text-[13.5px] leading-relaxed text-tx2">
        Reports are kept for 90 days, or until the person who asked for it asks us to delete it. A
        new one takes a few seconds.
      </p>
      {formUrl && (
        <ButtonLink size="lg" href={formUrl} className="mt-5">
          Run a new report
        </ButtonLink>
      )}
    </StatusShell>
  )
}
