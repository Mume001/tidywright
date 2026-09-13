import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card, CardHeader } from './card'
import { Skeleton, SkeletonTable, SkeletonText } from './skeleton'

const meta = { title: 'App/Skeleton', component: Skeleton } satisfies Meta<typeof Skeleton>
export default meta
type Story = StoryObj<typeof meta>

export const Blocks: Story = {
  render: () => (
    <div className="w-96 space-y-3">
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  ),
}

export const Text: Story = { render: () => <SkeletonText className="w-96" /> }

/** What the leads table looks like while it loads. */
export const Table: Story = {
  render: () => (
    <Card className="w-[760px] overflow-hidden">
      <CardHeader title="Leads" />
      <div className="p-4">
        <SkeletonTable rows={6} />
      </div>
    </Card>
  ),
}

export const KpiRow: Story = {
  render: () => (
    <div className="flex gap-4">
      {Array.from({ length: 4 }, (_, i) => (
        <Card key={i} className="flex-1 p-4.5">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="mt-3 h-8 w-20" />
          <Skeleton className="mt-3 h-2.5 w-32" />
        </Card>
      ))}
    </div>
  ),
}
