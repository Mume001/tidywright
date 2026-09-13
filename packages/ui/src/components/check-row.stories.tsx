import type { Meta, StoryObj } from '@storybook/react-vite'
import { mock } from '@tw/shared/mocks'
import { CheckRow } from './check-row'
import { Card } from './card'

const audit = mock.audits.find((a) => a.status === 'done')!

const meta = {
  title: 'Report/CheckRow',
  component: CheckRow,
  args: { check: audit.checks[0]! },
} satisfies Meta<typeof CheckRow>

export default meta
type Story = StoryObj<typeof meta>

export const Pass: Story = { args: { check: audit.checks.find((c) => c.status === 'pass')! } }
export const Fail: Story = { args: { check: audit.checks.find((c) => c.status === 'fail')! } }
export const Warn: Story = { args: { check: audit.checks.find((c) => c.status === 'warn')! } }

/** The full list as it appears at the bottom of a report. */
export const FullList: Story = {
  render: () => (
    <Card className="mx-auto max-w-4xl overflow-hidden">
      {audit.checks.slice(0, 12).map((check) => (
        <CheckRow key={check.code} check={check} />
      ))}
    </Card>
  ),
}

export const LightTheme: Story = {
  globals: { theme: 'report' },
  render: () => (
    <Card className="mx-auto max-w-4xl overflow-hidden">
      {audit.checks.slice(0, 8).map((check) => (
        <CheckRow key={check.code} check={check} />
      ))}
    </Card>
  ),
}
