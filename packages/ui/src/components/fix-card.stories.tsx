import type { Meta, StoryObj } from '@storybook/react-vite'
import { mock } from '@tw/shared/mocks'
import { FixCard } from './fix-card'

const audit = mock.audits.find((a) => a.status === 'done')!

const meta = {
  title: 'Report/FixCard',
  component: FixCard,
  args: { fix: audit.fixes[0]! },
} satisfies Meta<typeof FixCard>

export default meta
type Story = StoryObj<typeof meta>

export const TitleFix: Story = {}
export const MetaFix: Story = { args: { fix: audit.fixes[1]! } }
export const StructuredDataFix: Story = { args: { fix: audit.fixes[2]! } }

/** What the visitor actually sees: the three fixes stacked, in the light theme. */
export const AllThree: Story = {
  globals: { theme: 'report' },
  render: () => (
    <div className="mx-auto max-w-3xl">
      {audit.fixes.map((fix) => (
        <FixCard key={fix.kind} fix={fix} />
      ))}
    </div>
  ),
}

export const LongContent: Story = {
  args: {
    fix: {
      kind: 'meta',
      severity: 'warning',
      label: 'Meta description',
      before:
        'Welcome to our website. We are a family owned business that has been serving the local community for many years with a wide range of services and products for every need.',
      after:
        'Portland kitchen renovations and custom cabinetry, designed and built in-house. See recent projects, our process, and get a quote in 48 hours.',
      reasons: [
        'The old description is 168 characters, so results cut it off mid sentence.',
        'It says nothing a person could search for. The new one names the service and the city.',
      ],
    },
  },
}
