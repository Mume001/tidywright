import type { Meta, StoryObj } from '@storybook/react-vite'
import { mock } from '@tw/shared/mocks'
import { UnsubscribeCard } from './unsubscribe-card'

/**
 * docs/15-frontend-spec.md 2.3. Reached from a link in an email, with no login,
 * and carrying the agency's name rather than ours: the person reading it agreed
 * to hear from the agency and has never heard of us.
 */
const meta = {
  title: 'Report/Unsubscribe',
  component: UnsubscribeCard,
  parameters: { layout: 'centered' },
  args: { agencyName: mock.agencies[0]!.name, logoUrl: null, state: 'done' },
} satisfies Meta<typeof UnsubscribeCard>

export default meta
type Story = StoryObj<typeof meta>

/** The write is in flight. It is a POST, so scanners cannot trigger it. */
export const Working: Story = { args: { state: 'working' } }

export const Done: Story = {}

export const Failed: Story = { args: { state: 'failed' } }
