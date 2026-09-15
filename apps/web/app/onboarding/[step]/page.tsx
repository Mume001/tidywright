import { notFound } from 'next/navigation'
import { OnboardingClient } from './client'

/**
 * Three steps, one route. docs/15-frontend-spec.md 3.2.
 *
 * A step per URL rather than state in one page, so Back works, a half finished
 * onboarding survives a closed tab, and the branding step can be linked to
 * directly from a nudge email later.
 */

export function generateStaticParams() {
  return [{ step: '1' }, { step: '2' }, { step: '3' }]
}

export default async function OnboardingPage({ params }: { params: Promise<{ step: string }> }) {
  const { step } = await params
  const index = Number(step)
  if (!Number.isInteger(index) || index < 1 || index > 3) notFound()

  return <OnboardingClient step={index as 1 | 2 | 3} />
}
