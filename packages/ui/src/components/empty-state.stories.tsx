import type { Meta, StoryObj } from '@storybook/react-vite'
import { Code, Inbox, Search } from 'lucide-react'
import { Button } from './button'
import { Card } from './card'
import { EmptyState } from './empty-state'

const meta = {
  title: 'App/EmptyState',
  component: EmptyState,
  args: {
    icon: <Inbox className="size-5" />,
    title: 'No leads yet',
    description: 'When someone fills in your form, they show up here within seconds.',
  },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** First run. This is the one that decides whether an agency ever gets a lead. */
export const FirstRun: Story = {
  args: {
    icon: <Code className="size-5" />,
    title: 'Your form is not on a page yet',
    description:
      'Paste two lines into any page on your site and the first report can arrive today. Guides for WordPress, Webflow, Squarespace, Wix and plain HTML.',
    action: <Button>Get my embed code</Button>,
  },
  render: (args) => (
    <Card className="mx-auto max-w-2xl">
      <EmptyState {...args} />
    </Card>
  ),
}

export const NoSearchResults: Story = {
  args: {
    icon: <Search className="size-5" />,
    title: 'Nothing matches that',
    description: 'Try a different email or site, or clear the filters.',
    action: <Button variant="secondary">Clear filters</Button>,
  },
}
