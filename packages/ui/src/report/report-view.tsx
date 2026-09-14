import { biggestProblemSentence, type Audit, type Branding, type ReportLayout } from '@tw/shared'
import { ChecksExplorer } from './checks-explorer'
import { FixesSection } from './fixes-section'
import { LockedFindings } from './locked-findings'
import { PriorityList } from './priority-list'
import { ReportFooter } from './report-footer'
import { ReportHeader } from './report-header'
import { ScorePanel } from './score-panel'

export interface ReportViewProps {
  agencyName: string
  logoUrl?: string | null
  branding: Branding
  audit: Audit
  layout: ReportLayout
  /** Host of the scanned address, and the date, both prepared on the server. */
  host: string
  dateLabel: string
  /** Where the call to action points: cta_url, else calendar, else mailto. */
  ctaUrl: string
  showPoweredBy: boolean
  unsubscribeUrl?: string | null
  onEvent?: (event: string, props?: Record<string, string | number>) => void
}

/**
 * The whole report, in the order docs/15-frontend-spec.md fixes:
 *
 *   1  score, ten group bars, one sentence naming the worst area
 *   2  the written fixes, open, above the fold
 *   3  "Fix this first", six findings
 *   4  the rest, blurred, under the agency's call to action
 *   5  every check, grouped and collapsed
 *
 * Nothing here decides which finding goes where; packages/shared does that, so
 * the PDF in phase 2 and the audit detail screen in F2 lay out the same audit
 * the same way.
 */
export function ReportView({
  agencyName,
  logoUrl,
  branding,
  audit,
  layout,
  host,
  dateLabel,
  ctaUrl,
  showPoweredBy,
  unsubscribeUrl,
  onEvent,
}: ReportViewProps) {
  const scoreOnly = audit.variant === 'score_only'
  const counts = audit.summary?.counts ?? { critical: 0, warning: 0, notice: 0, passed: 0 }
  const sentence = biggestProblemSentence(layout, counts.critical)

  return (
    <div className="mx-auto w-full max-w-[1040px] px-4 pb-10 sm:px-6">
      <ReportHeader
        agencyName={agencyName}
        logoUrl={logoUrl}
        host={host}
        dateLabel={dateLabel}
        calendarUrl={branding.calendarUrl}
        onCalendarClick={() => onEvent?.('calendar_clicked')}
      />

      <ScorePanel
        score={audit.score ?? 0}
        headline={audit.summary?.headline ?? 'Your report'}
        sentence={sentence}
        counts={counts}
        layout={layout}
      />

      <FixesSection
        fixes={layout.fixes}
        scoreOnly={scoreOnly}
        agencyName={agencyName}
        nothingToFix={layout.problemCount === 0}
        onCopy={(kind) => onEvent?.('fix_copied', { kind })}
      />

      <PriorityList findings={layout.priority} />

      <LockedFindings
        findings={layout.locked}
        agencyName={agencyName}
        ctaLabel={branding.ctaLabel}
        ctaUrl={ctaUrl}
        onCtaClick={() => onEvent?.('cta_clicked')}
      />

      <ChecksExplorer
        groups={layout.groups}
        onExpand={(group) => onEvent?.('checks_expanded', { group })}
      />

      <ReportFooter
        agencyName={agencyName}
        companyAddress={branding.companyAddress}
        privacyPolicyUrl={branding.privacyPolicyUrl}
        unsubscribeUrl={unsubscribeUrl}
        showPoweredBy={showPoweredBy}
        onPoweredByClick={() => onEvent?.('powered_by_clicked')}
      />
    </div>
  )
}
