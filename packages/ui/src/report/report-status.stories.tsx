import type { Meta, StoryObj } from '@storybook/react-vite'
import { mock } from '@tw/shared/mocks'
import { ReportFailed, ReportGone, ReportPending } from './report-status'

/**
 * The report when there is no report: still loading, refused, or gone. Drawn in
 * design/phase1/ReportStates.dc.html, specified in docs/15-frontend-spec.md 2.1.
 */
const agency = mock.agencies[0]!

const meta = {
  title: 'Report/States',
  parameters: { layout: 'centered' },
} satisfies Meta

export default meta

/** Loading: the worker has the job and the page is polling every two seconds. */
export const Pending: StoryObj = {
  render: () => (
    <ReportPending
      agencyName={agency.name}
      host="northwind-client.com"
      status="checking"
      tookTooLong={false}
    />
  ),
}

export const PendingAtTheLastStep: StoryObj = {
  render: () => (
    <ReportPending
      agencyName={agency.name}
      host="northwind-client.com"
      status="generating"
      tookTooLong={false}
    />
  ),
}

/** Sixty seconds of polling with no answer. We stop spinning and promise email. */
export const PendingTooLong: StoryObj = {
  render: () => (
    <ReportPending
      agencyName={agency.name}
      host="northwind-client.com"
      status="queued"
      tookTooLong
    />
  ),
}

/** Error: the site did not answer, which is itself a finding worth having. */
export const FailedToFetch: StoryObj = {
  render: () => (
    <ReportFailed
      agencyName={agency.name}
      host="northwind-client.com"
      reason="fetch"
      detail="fetch_timeout, no response in 10 s"
      onRetry={() => {}}
    />
  ),
}

/** Error: a bot filter refused us. Not the visitor's fault and not a bug. */
export const BlockedByTheSite: StoryObj = {
  render: () => (
    <ReportFailed
      agencyName={agency.name}
      host="northwind-client.com"
      reason="blocked"
      detail="failed_blocked, 403 from origin"
      onRetry={() => {}}
    />
  ),
}

/** Deleted or expired. Served with HTTP 410, set in proxy.ts. */
export const Gone: StoryObj = {
  render: () => <ReportGone agencyName={agency.name} formUrl="/a/northwind-digital" />,
}

/** Gone, with no agency to name, which is what a stranger's old link looks like. */
export const GoneWithoutAnAgency: StoryObj = {
  render: () => <ReportGone />,
}
