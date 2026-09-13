import type { Meta, StoryObj } from '@storybook/react-vite'
import { Bolt, Download, Plus } from 'lucide-react'
import { Button } from './button'

const meta = {
  title: 'Primitives/Button',
  component: Button,
  args: { children: 'Run a test report' },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = { args: { variant: 'primary' } }
export const Secondary: Story = { args: { variant: 'secondary', children: 'Export CSV' } }
export const Ghost: Story = { args: { variant: 'ghost', children: 'Skip' } }
export const Danger: Story = { args: { variant: 'danger', children: 'Delete lead' } }

export const Loading: Story = { args: { loading: true, children: 'Running' } }
export const Disabled: Story = { args: { disabled: true } }

export const WithIcon: Story = {
  args: { icon: <Bolt className="size-4" />, children: 'Run a test report' },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="primary" icon={<Bolt className="size-4" />}>
          Run a test report
        </Button>
        <Button variant="secondary" icon={<Download className="size-4" />}>
          Export CSV
        </Button>
        <Button variant="ghost">Skip</Button>
        <Button variant="danger">Delete lead</Button>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" icon={<Plus className="size-3.5" />}>
          New key
        </Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Get my report</Button>
      </div>
      <div className="flex items-center gap-2">
        <Button loading>Running</Button>
        <Button disabled>Disabled</Button>
        <Button variant="secondary" disabled>
          Disabled
        </Button>
      </div>
      <div className="w-72">
        <Button full size="lg">
          Get my report
        </Button>
      </div>
    </div>
  ),
}
