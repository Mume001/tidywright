import type { Meta, StoryObj } from '@storybook/react-vite'
import { KpiCard } from './kpi-card'

const meta = {
  title: 'App/KpiCard',
  component: KpiCard,
  args: { label: 'Reports run', value: '146', sub: '6.0% of views became reports' },
} satisfies Meta<typeof KpiCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithDelta: Story = {
  args: {
    label: 'Form views · 30 days',
    value: '2,418',
    delta: { value: 22 },
    sub: 'vs previous 30',
  },
}
export const NegativeDelta: Story = {
  args: { label: 'Report views', value: '287', delta: { value: -8 }, sub: 'vs previous 30' },
}

export const Row: Story = {
  render: () => (
    <div className="flex gap-4">
      <KpiCard
        label="Form views · 30 days"
        value="2,418"
        delta={{ value: 22 }}
        sub="vs previous 30"
      />
      <KpiCard label="Reports run" value="146" tone="good" sub="6.0% of views became reports" />
      <KpiCard label="New leads" value="131" sub="15 without a report yet" />
      <KpiCard label="Failures" value="4" tone="bad" sub="of 61 this week" />
    </div>
  ),
}

export const Empty: Story = {
  args: { label: 'Reports run', value: '0', sub: 'No reports yet this month' },
}
