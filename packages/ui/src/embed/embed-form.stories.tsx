import type { Meta, StoryObj } from '@storybook/react-vite'
import { mock } from '@tw/shared/mocks'
import { EmbedForm } from './embed-form'

const branding = mock.branding[0]!
const agency = mock.agencies[0]!

/**
 * Every state from the table in docs/15-frontend-spec.md 1.2. The card is the
 * same on the agency's own site and on the hosted page, so what is verified
 * here is verified for both.
 *
 * Switch the toolbar theme to "Report (light)": this surface is only ever shown
 * in that one, on the agency's colour.
 */
const meta = {
  title: 'Embed/EmbedForm',
  component: EmbedForm,
  parameters: { layout: 'centered' },
  args: {
    agencyName: agency.name,
    branding,
    logoUrl: null,
    showPoweredBy: false,
    state: { kind: 'form' },
    onSubmit: () => {},
    onRetry: () => {},
    onOpenReport: () => {},
  },
} satisfies Meta<typeof EmbedForm>

export default meta
type Story = StoryObj<typeof meta>

/** What a visitor meets. */
export const Default: Story = {}

/** Free plan: our badge is the price of the free tier. */
export const WithPoweredBy: Story = {
  args: { showPoweredBy: true },
}

/**
 * The agency has not set a privacy policy link. docs/15-frontend-spec.md 3.7
 * requires the form to say so rather than quietly collect the address anyway.
 */
export const WithoutPrivacyPolicy: Story = {
  args: { branding: { ...branding, privacyPolicyUrl: null } },
}

/** Loading: the request is in flight and the fields are locked. */
export const Validating: Story = {
  args: { state: { kind: 'validating' } },
}

/** The wait, at each of the three steps the worker walks. */
export const Queued: Story = {
  args: { state: { kind: 'queued', host: 'northwind-client.com', status: 'fetching' } },
}

export const QueuedRunningChecks: Story = {
  args: { state: { kind: 'queued', host: 'northwind-client.com', status: 'checking' } },
}

export const QueuedWritingFixes: Story = {
  args: { state: { kind: 'queued', host: 'northwind-client.com', status: 'generating' } },
}

/** Done. The score is the hook, the link is the point. */
export const Done: Story = {
  args: {
    state: {
      kind: 'done',
      score: 58,
      email: 'amir@northwind-client.com',
      reportUrl: '/r/demo-done',
    },
  },
}

/** A good score, so the sentence praises rather than promising repairs. */
export const DoneWithNothingToFix: Story = {
  args: {
    state: {
      kind: 'done',
      score: 96,
      email: 'amir@northwind-client.com',
      reportUrl: '/r/demo-clean',
    },
  },
}

/** Error, one story per code a visitor can actually reach. */
export const ErrorInvalidUrl: Story = {
  args: { state: { kind: 'error', code: 'invalid_url', requestId: '7f3a2c' } },
}

export const ErrorBlockedTarget: Story = {
  args: { state: { kind: 'error', code: 'blocked_target' } },
}

export const ErrorRateLimited: Story = {
  args: { state: { kind: 'error', code: 'rate_limited' } },
}

export const ErrorQuotaExceeded: Story = {
  args: { state: { kind: 'error', code: 'quota_exceeded' } },
}

/** 360 px, which is the width the form has to survive. */
export const OnAPhone: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
}
