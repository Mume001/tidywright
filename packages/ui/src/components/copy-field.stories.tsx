import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodeBlock, CopyField } from './copy-field'

const meta = {
  title: 'App/CopyField',
  component: CopyField,
  args: { value: 'pk_live_7Kd93mQz2XbA8pLw4RtY0nVe', label: 'Public key' },
} satisfies Meta<typeof CopyField>

export default meta
type Story = StoryObj<typeof meta>

export const Key: Story = {}

export const Masked: Story = {
  args: { value: 'pk_live_7Kd93mQz2XbA8pLw4RtY0nVe', display: 'pk_live_7Kd9…0nVe' },
}

export const HostedFormLink: Story = {
  args: {
    label: 'Hosted form, no embed needed',
    value: 'https://siteauditserver.com/a/northwind-digital',
  },
}

export const EmbedSnippet: Story = {
  args: { value: '' },
  render: () => (
    <div className="w-[640px]">
      <CodeBlock
        code={
          `<script async
  src="https://siteauditserver.com/embed.js"
  data-key="pk_live_7Kd93mQz2XbA8pLw4RtY0nVe"></scr` +
          `ipt>
<div id="tw-audit"></div>`
        }
      />
    </div>
  ),
}
