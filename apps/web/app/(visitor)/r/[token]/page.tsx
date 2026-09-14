import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildReportLayout } from '@tw/shared'
import { ReportFailed, ReportGone } from '@tw/ui'
import { BrandTheme } from '@/components/brand-theme'
import { findAudit } from '@/lib/mock/audit-state'
import { ctaUrlFor, hostOf, reportContext } from '@/lib/mock/resolve'
import { PendingReport } from './pending-client'
import { Report } from './report-client'

/**
 * The report. docs/15-frontend-spec.md 2.1.
 *
 * Public, reached with a token and not a login, and never indexed: proxy.ts
 * sends X-Robots-Tag on every visitor path and the metadata below repeats it in
 * the page, because the two are read by different crawlers.
 *
 * An expired token is turned into a 410 by proxy.ts before it reaches here. If
 * one arrives anyway, because it expired in the seconds since, the page still
 * renders the gone card rather than an empty report.
 */

interface PageProps {
  params: Promise<{ token: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

/** Fixed locale and timezone, so the server and the browser agree on the date. */
const DATE = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params
  const audit = findAudit(token)
  const context = audit ? reportContext(audit) : null

  return {
    // Our name is in no title on any plan, including this one.
    // docs/13-widget-spec.md.
    title: context
      ? `SEO report for ${hostOf(context.audit.url)} | ${context.agency.name}`
      : 'Report',
    robots: { index: false, follow: false },
  }
}

export default async function ReportPage({ params, searchParams }: PageProps) {
  const { token } = await params
  const query = await searchParams

  const audit = findAudit(token)
  if (!audit) notFound()

  const context = reportContext(audit)
  if (!context) notFound()

  const { agency, branding, lead } = context
  const host = hostOf(audit.url)
  const dateLabel = DATE.format(new Date(audit.createdAt))

  return (
    <BrandTheme primary={branding.primaryColor}>
      <div className="min-h-screen">
        <div className="h-1 bg-lime" />

        {audit.status === 'expired' ? (
          <Centred>
            <ReportGone agencyName={agency.name} formUrl={`/a/${agency.slug}`} />
          </Centred>
        ) : audit.status === 'failed' ? (
          <Centred>
            <ReportFailed
              agencyName={agency.name}
              host={host}
              reason={audit.failureCode === 'blocked' ? 'blocked' : 'fetch'}
              detail={audit.failureCode}
            />
          </Centred>
        ) : audit.status !== 'done' ? (
          <Centred>
            <PendingReport
              agencyName={agency.name}
              token={audit.token}
              host={host}
              initialStatus={audit.status}
            />
          </Centred>
        ) : (
          <Report
            token={audit.token}
            agencyName={agency.name}
            logoUrl={null}
            branding={branding}
            audit={
              // The pilot variant is stored on the audit. The query parameter is
              // here so both halves of the experiment can be looked at side by
              // side without creating two audits. docs/13-widget-spec.md.
              one(query.variant) === 'score_only' ? { ...audit, variant: 'score_only' } : audit
            }
            layout={buildReportLayout({
              checks: audit.checks,
              fixes: audit.fixes,
              summary: audit.summary,
            })}
            host={host}
            dateLabel={dateLabel}
            ctaUrl={ctaUrlFor(agency, branding)}
            showPoweredBy={!branding.hidePoweredBy}
            unsubscribeUrl={lead ? `/u/${lead.id}` : null}
          />
        )}
      </div>
    </BrandTheme>
  )
}

/** The status cards bring their own <main>, so this is only the centring. */
function Centred({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">{children}</div>
}
