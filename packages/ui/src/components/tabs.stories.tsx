import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Tabs } from './tabs'

const meta = { title: 'Primitives/Tabs', component: Tabs } satisfies Meta<typeof Tabs>
export default meta
type Story = StoryObj<typeof meta>

const PLATFORMS = [
  { value: 'wordpress', label: 'WordPress' },
  { value: 'webflow', label: 'Webflow' },
  { value: 'squarespace', label: 'Squarespace' },
  { value: 'wix', label: 'Wix' },
  { value: 'framer', label: 'Framer' },
  { value: 'html', label: 'Plain HTML' },
] as const

function Interactive() {
  const [value, setValue] = useState<(typeof PLATFORMS)[number]['value']>('wordpress')
  return (
    <div className="w-[640px]">
      <Tabs tabs={PLATFORMS} value={value} onChange={setValue} />
      <p className="mt-4 text-[13px] text-tx2">Showing the guide for {value}.</p>
    </div>
  )
}

export const Platforms: Story = {
  args: { tabs: PLATFORMS, value: 'wordpress', onChange: () => {} },
  render: () => <Interactive />,
}
