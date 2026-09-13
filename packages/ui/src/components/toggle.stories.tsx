import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Checkbox, Switch } from './toggle'

const meta = { title: 'Primitives/Toggle', component: Switch } satisfies Meta<typeof Switch>
export default meta
type Story = StoryObj<typeof meta>

function Interactive() {
  const [on, setOn] = useState(true)
  const [agreed, setAgreed] = useState(false)
  return (
    <div className="w-[420px] space-y-5">
      <Switch checked={on} onChange={setOn} label={on ? 'On (Starter)' : 'Off'} />
      <Switch checked={false} disabled label="Custom domain (Pro only)" />
      <Checkbox
        checked={agreed}
        onChange={(e) => setAgreed(e.target.checked)}
        label={
          <>
            I agree to receive my report and follow-up from Northwind Digital by email.{' '}
            <span className="text-lime">Privacy policy</span>
          </>
        }
      />
      <Checkbox checked readOnly label="Already checked" />
      <Checkbox disabled label="Disabled option" />
    </div>
  )
}

export const All: Story = { args: { checked: true }, render: () => <Interactive /> }

export const ConsentInReportTheme: Story = {
  args: { checked: false },
  globals: { theme: 'report' },
  render: () => <Interactive />,
}
