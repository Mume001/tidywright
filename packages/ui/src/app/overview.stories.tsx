import type { Meta, StoryObj } from '@storybook/react-vite'
import { mock } from '@tw/shared/mocks'
import { AppShell, PageBody, PageHeader } from './app-shell'
import { appCommands, navigation } from './sidebar'
import { Overview, OverviewEmpty, OverviewSkeleton, ScreenError } from './overview'

/**
 * The overview, in the shell it actually lives in.
 * docs/15-frontend-spec.md 3.3, and the four states from
 * docs/27-design-system.md: default, loading, empty, error.
 */

const agency = mock.agencies[0]!
const agencies = mock.agencies.slice(0, 2).map((a) => ({ id: a.id, name: a.name, plan: a.plan }))
const user = { email: mock.users[0]!.email, fullName: mock.users[0]!.fullName }

const stats = mock.stats
  .filter((s) => s.agencyId === agency.id)
  .sort((a, b) => a.day.localeCompare(b.day))
  .slice(-30)

const week = (pick: (s: (typeof stats)[number]) => number) =>
  stats.slice(-7).reduce((total, s) => total + pick(s), 0)

const kpis = [
  {
    label: 'Audits this week',
    value: week((s) => s.auditsDone),
    delta: 18,
    spark: stats.slice(-7).map((s) => s.auditsDone),
  },
  {
    label: 'Leads this week',
    value: week((s) => s.leadsNew),
    delta: 9,
    spark: stats.slice(-7).map((s) => s.leadsNew),
  },
  {
    label: 'Report views',
    value: week((s) => s.reportViews),
    delta: -4,
    spark: stats.slice(-7).map((s) => s.reportViews),
  },
  {
    label: 'Call to action clicks',
    value: week((s) => s.ctaClicks),
    delta: 31,
    spark: stats.slice(-7).map((s) => s.ctaClicks),
  },
]

const chart = stats.map((s) => ({ day: s.day, value: s.auditsDone }))

const leads = mock.leads
  .filter((l) => l.agencyId === agency.id)
  .slice(0, 8)
  .map((lead) => {
    const audit = mock.audits.find((a) => a.leadId === lead.id && a.status === 'done')
    return {
      id: lead.id,
      email: lead.email,
      host: lead.siteHost,
      score: audit?.score ?? null,
      ago: '2h ago',
      href: `/leads/${lead.id}`,
    }
  })

function Shell({ children }: { children: React.ReactNode }) {
  const nav = navigation({ leads: 3 })
  return (
    <AppShell
      pathname="/overview"
      agencies={agencies}
      currentAgencyId={agency.id}
      user={user}
      nav={nav}
      commands={appCommands({ agencies, groups: nav })}
      unreadNotifications={3}
    >
      {children}
    </AppShell>
  )
}

const meta: Meta = {
  title: 'App/Overview',
  parameters: { layout: 'fullscreen' },
}
export default meta

export const Default: StoryObj = {
  render: () => (
    <Shell>
      <PageBody>
        <PageHeader
          title={`Good morning, ${agency.name}`}
          description="What the widget brought in, and what it is doing right now."
        />
        <Overview
          kpis={kpis}
          chart={chart}
          leads={leads}
          installedHosts={['northwind.agency', 'northwind.agency/seo-check']}
          usage={{ used: 23, limit: 50, plan: 'Free' }}
          pilot={{ auditsThisMonth: 184, leadRate: 41, ctaRate: 12 }}
        />
      </PageBody>
    </Shell>
  ),
}

export const Empty: StoryObj = {
  name: 'Empty, first run',
  render: () => (
    <Shell>
      <PageBody>
        <PageHeader
          title={`Good morning, ${agency.name}`}
          description="Three things and the first audit comes in."
        />
        <OverviewEmpty
          formHref={`/a/${agency.slug}`}
          steps={{ code: true, tested: false, shared: false }}
        />
      </PageBody>
    </Shell>
  ),
}

export const Loading: StoryObj = {
  render: () => (
    <Shell>
      <PageBody>
        <PageHeader title="Overview" />
        <OverviewSkeleton />
      </PageBody>
    </Shell>
  ),
}

export const Error: StoryObj = {
  render: () => (
    <Shell>
      <PageBody>
        <PageHeader title="Overview" />
        <ScreenError requestId="req_8f3a2c19b4" onRetry={() => {}} />
      </PageBody>
    </Shell>
  ),
}

export const NoLeadsYet: StoryObj = {
  name: 'Running, but nobody has left an email',
  render: () => (
    <Shell>
      <PageBody>
        <PageHeader title={`Good morning, ${agency.name}`} />
        <Overview
          kpis={kpis.map((k) => ({ ...k, value: k.label.includes('Leads') ? 0 : k.value }))}
          chart={chart}
          leads={[]}
          installedHosts={['northwind.agency']}
        />
      </PageBody>
    </Shell>
  ),
}
