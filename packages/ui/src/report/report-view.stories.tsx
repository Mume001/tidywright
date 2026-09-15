import type { Meta, StoryObj } from '@storybook/react-vite'
import { buildReportLayout, type Audit, type CheckResult } from '@tw/shared'
import { mock } from '@tw/shared/mocks'
import { ReportView } from './report-view'

/**
 * The report, every way it can come out. Switch the toolbar theme to
 * "Report (light)": a visitor never sees the dark one.
 */
const branding = mock.branding[0]!
const agency = mock.agencies[0]!
const audit = mock.audits.find(
  (a) => a.status === 'done' && a.summary !== null && a.fixes.length === 3,
)!

/**
 * The fixes always go in, even on score_only, where they are shown as labels.
 * They are what tells the layout which findings not to repeat further down.
 */
function layoutFor(source: Audit) {
  return buildReportLayout({
    checks: source.checks,
    fixes: source.fixes,
    summary: source.summary,
  })
}

const meta = {
  title: 'Report/ReportView',
  component: ReportView,
  parameters: { layout: 'fullscreen' },
  args: {
    agencyName: agency.name,
    logoUrl: null,
    branding,
    audit,
    layout: layoutFor(audit),
    host: 'northwind-client.com',
    dateLabel: '14 Sep 2026',
    ctaUrl: branding.ctaUrl,
    showPoweredBy: false,
    unsubscribeUrl: '/u/demo-lead',
  },
} satisfies Meta<typeof ReportView>

export default meta
type Story = StoryObj<typeof meta>

/** A real audit out of the seeded data: 176 checks, three written fixes. */
export const Default: Story = {}

/** Free plan: the badge in the footer is the only place our name ever appears. */
export const FreePlan: Story = {
  args: { showPoweredBy: true },
}

/** No booking link, so the header loses its button. */
export const WithoutCalendar: Story = {
  args: { branding: { ...branding, calendarUrl: null } },
}

/**
 * The pilot's other half: everything except the written fixes, which become
 * labels. docs/13-widget-spec.md, the third number we are asking five agencies
 * for.
 */
export const ScoreOnlyVariant: Story = {
  args: { audit: { ...audit, variant: 'score_only' } },
}

/**
 * Empty, in the only sense this page has one: nothing failed. The fixes block
 * becomes praise rather than a gap. docs/13-widget-spec.md.
 */
export const NothingFailed: Story = {
  args: (() => {
    const checks: CheckResult[] = audit.checks.map((c) => ({
      ...c,
      status: 'pass' as const,
      detail: 'Looks right.',
      evidence: null,
    }))
    const clean: Audit = {
      ...audit,
      score: 100,
      checks,
      fixes: [],
      summary: audit.summary && {
        ...audit.summary,
        counts: { critical: 0, warning: 0, notice: 0, passed: checks.length },
        priority: [],
        headline: 'Nothing to fix today',
      },
    }
    return { audit: clean, layout: layoutFor(clean) }
  })(),
}

/**
 * An agency colour that cannot be read on white. The server darkens it for text
 * and leaves it alone for filled buttons, so both stay legible.
 */
export const OnAnAwkwardBrandColour: Story = {
  decorators: [
    (Story) => (
      <div
        style={{ '--agency-primary': '#FFE600', '--agency-ink': '#6b6100' } as React.CSSProperties}
      >
        <Story />
      </div>
    ),
  ],
}

/** 360 px, which the report has to survive. */
export const OnAPhone: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 360, overflow: 'hidden' }}>
        <Story />
      </div>
    ),
  ],
}
