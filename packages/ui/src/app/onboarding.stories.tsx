import type { Meta, StoryObj } from '@storybook/react-vite'
import { StepAgency, StepBranding, StepEmbed } from './onboarding'

/** docs/15-frontend-spec.md 3.2. Three steps, plus the states each one has. */
const meta: Meta = {
  title: 'App/Onboarding',
  parameters: { layout: 'fullscreen' },
}
export default meta

const SNIPPET = `<div id="tw-audit"></div>
<script src="https://siteauditserver.com/embed.js" data-key="pk_live_demo" defer></script>`

export const Step1Agency: StoryObj = {
  name: '1. Agency',
  render: () => <StepAgency defaultName="Northwind Digital" defaultSlug="northwind-digital" />,
}

export const Step1Checking: StoryObj = {
  name: '1. Agency, checking the address',
  render: () => (
    <StepAgency defaultName="Northwind Digital" defaultSlug="northwind" slugState="checking" />
  ),
}

export const Step1Taken: StoryObj = {
  name: '1. Agency, address taken',
  render: () => (
    <StepAgency defaultName="Northwind Digital" defaultSlug="northwind" slugState="taken" />
  ),
}

export const Step1Free: StoryObj = {
  name: '1. Agency, address free',
  render: () => (
    <StepAgency defaultName="Northwind Digital" defaultSlug="northwind-digital" slugState="free" />
  ),
}

export const Step2Branding: StoryObj = {
  name: '2. Branding',
  render: () => <StepBranding onBack={() => {}} onSkip={() => {}} />,
}

export const Step3Embed: StoryObj = {
  name: '3. Embed',
  render: () => <StepEmbed snippet={SNIPPET} hostedUrl="/a/northwind-digital" onBack={() => {}} />,
}
