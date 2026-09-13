import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input, Textarea } from './input'

const meta = {
  title: 'Primitives/Input',
  component: Input,
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Website address', placeholder: 'https://yourwebsite.com' },
}

export const Filled: Story = {
  args: { label: 'Agency name', defaultValue: 'Northwind Digital' },
}

export const WithError: Story = {
  args: {
    label: 'Email for the report',
    defaultValue: 'amir@northwind',
    error: 'That email does not look complete. Check the domain.',
  },
}

export const WithHint: Story = {
  args: {
    label: 'Public link',
    defaultValue: 'northwind-digital',
    prefix: 'siteauditserver.com/a/',
    hint: 'Lowercase letters, numbers and dashes. This is what visitors see.',
  },
}

export const WithCounter: Story = {
  args: {
    label: 'Headline',
    defaultValue: 'Get a free SEO report for your website',
    aside: '38/80',
  },
}

export const Disabled: Story = {
  args: { label: 'Plan', defaultValue: 'Starter', disabled: true },
}

export const TextareaDefault: Story = {
  render: () => (
    <div className="w-[520px]">
      <Textarea
        label="Report intro (under the score)"
        defaultValue="We read your homepage the way Google does. Below are the three changes we would make first, ready to paste."
        aside="112/400"
      />
      <Textarea label="Notes" placeholder="Called on Monday, asked for a quote" />
      <Textarea label="Broken" defaultValue="too short" error="Needs at least 20 characters." />
    </div>
  ),
}
