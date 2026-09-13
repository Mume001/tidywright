import type { Meta, StoryObj } from '@storybook/react-vite'
import { ScoreBar } from './score-bar'

const meta = {
  title: 'Report/ScoreBar',
  component: ScoreBar,
  args: { label: 'Technical', value: 82 },
} satisfies Meta<typeof ScoreBar>

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {}

export const FourGroups: Story = {
  render: () => (
    <div className="w-72">
      <ScoreBar label="Technical" value={82} />
      <ScoreBar label="Page tags" value={44} />
      <ScoreBar label="Structured data" value={20} />
      <ScoreBar label="Content and sharing" value={65} />
    </div>
  ),
}

export const Edges: Story = {
  render: () => (
    <div className="w-72">
      <ScoreBar label="Everything passes" value={100} />
      <ScoreBar label="Nothing passes" value={0} />
    </div>
  ),
}
