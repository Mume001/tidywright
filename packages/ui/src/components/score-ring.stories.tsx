import type { Meta, StoryObj } from '@storybook/react-vite'
import { ScoreNumber, ScoreRing } from './score-ring'

const meta = {
  title: 'Report/ScoreRing',
  component: ScoreRing,
  args: { score: 58 },
} satisfies Meta<typeof ScoreRing>

export default meta
type Story = StoryObj<typeof meta>

export const Mid: Story = {}
export const Good: Story = { args: { score: 88 } }
export const Bad: Story = { args: { score: 34 } }
export const Perfect: Story = { args: { score: 100 } }
export const Zero: Story = { args: { score: 0 } }

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <ScoreRing score={88} size={160} />
      <ScoreRing score={58} size={96} />
      <ScoreRing score={34} size={48} showCaption={false} />
    </div>
  ),
}

export const Bands: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <ScoreRing score={91} size={120} />
      <ScoreRing score={65} size={120} />
      <ScoreRing score={28} size={120} />
    </div>
  ),
}

export const InlineNumbers: Story = {
  render: () => (
    <div className="flex gap-4 text-sm">
      <ScoreNumber score={92} />
      <ScoreNumber score={61} />
      <ScoreNumber score={12} />
    </div>
  ),
}
