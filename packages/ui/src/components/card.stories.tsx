import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './badge'
import { Button } from './button'
import { Card, CardBody, CardHeader } from './card'

const meta = {
  title: 'Primitives/Card',
  component: Card,
  args: { children: null },
} satisfies Meta<typeof Card>
export default meta
type Story = StoryObj<typeof meta>

export const Plain: Story = {
  render: () => (
    <Card className="w-[520px]">
      <CardBody>A card with nothing but body text.</CardBody>
    </Card>
  ),
}

export const WithHeader: Story = {
  render: () => (
    <Card className="w-[520px]">
      <CardHeader title="Embed keys" aside={<Button size="sm">New key</Button>}>
        <Badge tone="good">3 active</Badge>
      </CardHeader>
      <CardBody>
        <p className="text-[13px] text-tx2">
          A key ties a form to your agency. Revoking one stops it within a minute.
        </p>
      </CardBody>
    </Card>
  ),
}

export const LightTheme: Story = {
  globals: { theme: 'report' },
  render: () => (
    <Card className="w-[520px]">
      <CardHeader title="Your report" aside={<Badge tone="mid">58</Badge>} />
      <CardBody>
        <p className="text-[13px] text-tx2">The same card on the visitor facing theme.</p>
      </CardBody>
    </Card>
  ),
}
