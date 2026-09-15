import { CalendarDays } from 'lucide-react'
import { AgencyMark } from '../components/agency-mark'
import { ButtonLink } from '../components/button'

export interface ReportHeaderProps {
  agencyName: string
  logoUrl?: string | null
  /** The address that was scanned, host only. */
  host: string
  /** Formatted on the server, so the date does not change during hydration. */
  dateLabel: string
  calendarUrl?: string | null
  onCalendarClick?: () => void
}

/**
 * The top of the report. docs/15-frontend-spec.md 2.1.
 *
 * The agency's name and mark on the left, what was scanned and when on the
 * right. Our name appears nowhere, on any plan: the only place it can appear is
 * the badge in the footer, and only on free.
 */
export function ReportHeader({
  agencyName,
  logoUrl,
  host,
  dateLabel,
  calendarUrl,
  onCalendarClick,
}: ReportHeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-3 py-4">
      <div className="flex items-center gap-2">
        <AgencyMark name={agencyName} logoUrl={logoUrl} size={24} />
        <span className="font-display text-lg font-bold tracking-tight">{agencyName}</span>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-[12.5px] text-tx3">
          Report for <span className="font-mono text-tx">{host}</span>
          <span className="mx-1.5">&middot;</span>
          {dateLabel}
        </p>

        {calendarUrl && (
          <ButtonLink
            variant="secondary"
            size="sm"
            href={calendarUrl}
            target="_blank"
            rel="noopener"
            onClick={onCalendarClick}
            icon={<CalendarDays className="size-3.5" />}
          >
            Book a call
          </ButtonLink>
        )}
      </div>
    </header>
  )
}
