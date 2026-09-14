import { CheckCircle2 } from 'lucide-react'
import { StatusShell } from './report-status'

export interface UnsubscribeCardProps {
  agencyName: string
  logoUrl?: string | null
  state: 'working' | 'done' | 'failed'
}

/**
 * The unsubscribe page. docs/15-frontend-spec.md 2.3.
 *
 * One page, no login, and the agency's name on it rather than ours: the person
 * reading it agreed to hear from the agency, and has never heard of us.
 */
export function UnsubscribeCard({ agencyName, logoUrl, state }: UnsubscribeCardProps) {
  return (
    <StatusShell agencyName={agencyName} logoUrl={logoUrl}>
      {state === 'working' && (
        <>
          <div
            aria-hidden
            className="mx-auto size-10 animate-spin rounded-full border-[3px] border-panel2 border-t-lime"
            style={{ animationDuration: '900ms' }}
          />
          <p className="mt-4 text-sm text-tx2" aria-live="polite">
            Taking you off the list...
          </p>
        </>
      )}

      {state === 'done' && (
        <>
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-score-good/12">
            <CheckCircle2 className="size-7 text-score-good" aria-hidden />
          </div>
          <h1 className="mt-4 font-display text-xl font-bold" aria-live="polite">
            You have been unsubscribed from {agencyName}
          </h1>
          <p className="mx-auto mt-2 max-w-[38ch] text-sm leading-relaxed text-tx2">
            They will not email you again about this report. Any report you already have stays where
            it is.
          </p>
        </>
      )}

      {state === 'failed' && (
        <>
          <h1 className="font-display text-xl font-bold" aria-live="polite">
            We could not do that just now
          </h1>
          <p className="mx-auto mt-2 max-w-[38ch] text-sm leading-relaxed text-tx2">
            Reload the page to try again. If it keeps failing, reply to any email from {agencyName}{' '}
            and ask them to remove you.
          </p>
        </>
      )}
    </StatusShell>
  )
}
