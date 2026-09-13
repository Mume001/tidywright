import type { Meta, StoryObj } from '@storybook/react-vite'
import type { LeadStatus, Severity } from '@tw/shared'
import { Badge, LeadStatusBadge, SeverityBadge } from './badge'

const meta = { title: 'Primitives/Badge', component: Badge } satisfies Meta<typeof Badge>
export default meta
type Story = StoryObj<typeof meta>

const LEAD_STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'won', 'lost', 'spam']
const SEVERITIES: Severity[] = ['critical', 'warning', 'notice']

export const Tones: Story = {
  args: { children: 'Badge' },
  render: () => (
    <div className="flex gap-2">
      <Badge tone="neutral">Neutral</Badge>
      <Badge tone="good">Active</Badge>
      <Badge tone="mid">Warming up</Badge>
      <Badge tone="bad">Paused</Badge>
      <Badge tone="info">New</Badge>
    </div>
  ),
}

export const LeadStatuses: Story = {
  args: { children: '' },
  render: () => (
    <div className="flex gap-2">
      {LEAD_STATUSES.map((s) => (
        <LeadStatusBadge key={s} status={s} />
      ))}
    </div>
  ),
}

export const Severities: Story = {
  args: { children: '' },
  render: () => (
    <div className="flex gap-2">
      {SEVERITIES.map((s) => (
        <SeverityBadge key={s} severity={s} />
      ))}
    </div>
  ),
}
