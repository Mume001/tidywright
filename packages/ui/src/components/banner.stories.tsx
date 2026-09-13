import type { Meta, StoryObj } from '@storybook/react-vite'
import { Banner } from './banner'
import { Button } from './button'

const meta = {
  title: 'App/Banner',
  component: Banner,
  args: {
    title: 'Your domain is warming up',
    description: 'Day 9 of 35. Reports still send from our domain until it finishes.',
  },
} satisfies Meta<typeof Banner>

export default meta
type Story = StoryObj<typeof meta>

export const Info: Story = { args: { tone: 'info' } }

export const PaymentFailed: Story = {
  args: {
    tone: 'danger',
    title: 'Payment failed',
    description: 'Update your card to keep Starter. We will try again in three days.',
    action: (
      <Button size="sm" variant="secondary">
        Update card
      </Button>
    ),
  },
}

export const QuotaWarning: Story = {
  args: {
    tone: 'warning',
    title: 'You have used 80% of this month’s reports',
    description: '400 of 500 used. Resets on 1 October.',
    action: <Button size="sm">Upgrade</Button>,
  },
}

export const Success: Story = {
  args: {
    tone: 'success',
    title: 'Widget detected on northwinddigital.com',
    description: 'We saw the script load 40 seconds ago.',
  },
}

export const AllTones: Story = {
  render: () => (
    <div className="flex max-w-2xl flex-col gap-3">
      <Banner
        tone="success"
        title="Widget detected"
        description="The script loaded 40 seconds ago."
      />
      <Banner tone="info" title="Domain warming up" description="Day 9 of 35." />
      <Banner
        tone="warning"
        title="80% of reports used"
        description="400 of 500. Resets 1 October."
      />
      <Banner
        tone="danger"
        title="Payment failed"
        description="Update your card to keep Starter."
      />
    </div>
  ),
}
