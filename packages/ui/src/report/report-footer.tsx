export interface ReportFooterProps {
  agencyName: string
  companyAddress?: string | null
  privacyPolicyUrl?: string | null
  unsubscribeUrl?: string | null
  /** Free plan only. docs/13-widget-spec.md: no trace of us on a paid one. */
  showPoweredBy: boolean
  onPoweredByClick?: () => void
}

/**
 * The bottom of the report. docs/15-frontend-spec.md 2.1.
 *
 * On a paid plan this is entirely the agency's: their name, their address,
 * their policy. Our name appears in exactly one place in the whole product, the
 * badge below, and only while they are on free.
 */
export function ReportFooter({
  agencyName,
  companyAddress,
  privacyPolicyUrl,
  unsubscribeUrl,
  showPoweredBy,
  onPoweredByClick,
}: ReportFooterProps) {
  return (
    <footer className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line py-5 text-[12px] text-tx3">
      <p>
        {agencyName}
        {companyAddress && <span className="mx-1.5">&middot;</span>}
        {companyAddress}
      </p>

      <p className="flex flex-wrap gap-x-4">
        {privacyPolicyUrl && (
          <a
            href={privacyPolicyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            Privacy policy
          </a>
        )}
        {unsubscribeUrl && (
          <a href={unsubscribeUrl} className="underline underline-offset-2">
            Unsubscribe
          </a>
        )}
      </p>

      {showPoweredBy && (
        <p className="ml-auto">
          Powered by{' '}
          <a
            href="https://tidywright.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onPoweredByClick}
            className="underline underline-offset-2"
          >
            Tidywright
          </a>
        </p>
      )}
    </footer>
  )
}
