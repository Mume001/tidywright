import type { Metadata } from 'next'
import { Overview, OverviewEmpty, PageBody, PageHeader } from '@tw/ui'
import {
  agencyOr,
  hasAnyAudit,
  installedHosts,
  overviewChart,
  overviewKpis,
  pilotNumbers,
  recentLeads,
  usageFor,
} from '@/lib/mock/app'

export const metadata: Metadata = { title: 'Overview' }

/**
 * docs/15-frontend-spec.md 3.3.
 *
 * ?empty=1 renders the first run state against the same agency. It is how the
 * empty screen gets reviewed without deleting the mock data, and it costs one
 * line. The real switch in B1 is whether any audit exists.
 */
export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const query = await searchParams
  const agency = agencyOr(undefined)
  const forceEmpty = query.empty === '1'
  const empty = forceEmpty || !hasAnyAudit(agency.id)

  return (
    <PageBody>
      <PageHeader
        title={`Good morning, ${agency.name}`}
        description={
          empty
            ? 'Three things and the first audit comes in.'
            : 'What the widget brought in, and what it is doing right now.'
        }
      />

      {empty ? (
        <OverviewEmpty
          formHref={`/a/${agency.slug}`}
          steps={{ code: false, tested: false, shared: false }}
        />
      ) : (
        <Overview
          kpis={overviewKpis(agency.id)}
          chart={overviewChart(agency.id)}
          leads={recentLeads(agency.id)}
          installedHosts={installedHosts(agency.id)}
          usage={usageFor(agency.id)}
          pilot={pilotNumbers(agency.id)}
        />
      )}
    </PageBody>
  )
}
