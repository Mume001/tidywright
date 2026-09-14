import type { ReactNode } from 'react'
import { AgencyMark } from '../components/agency-mark'
import { cn } from '../lib/cn'

export interface FormFrameProps {
  agencyName: string
  logoUrl?: string | null
  headline: string
  subline: string
  showPoweredBy: boolean
  children: ReactNode
  className?: string
}

/**
 * The card the form lives in, on the agency's site and on the hosted page.
 *
 * The headline and the subline stay put through every state, so the card does
 * not change height the moment somebody presses the button. Only the block
 * underneath swaps.
 */
export function FormFrame({
  agencyName,
  logoUrl,
  headline,
  subline,
  showPoweredBy,
  children,
  className,
}: FormFrameProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[420px] rounded-[var(--radius-card)] border border-line bg-panel p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <AgencyMark name={agencyName} logoUrl={logoUrl} size={20} />
        <span className="font-display text-[15px] font-bold tracking-tight">{agencyName}</span>
      </div>

      {/* h1: inside the iframe this is a document of its own, and on the hosted
          page it is the heading of the page. Either way it is the first level. */}
      <h1 className="mt-4 font-display text-xl leading-tight font-bold">{headline}</h1>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-tx2">{subline}</p>

      {children}

      {showPoweredBy && (
        <p className="mt-3.5 text-center text-[11px] text-tx3">
          Powered by{' '}
          <a
            href="https://tidywright.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink underline underline-offset-2"
          >
            Tidywright
          </a>
        </p>
      )}
    </div>
  )
}
