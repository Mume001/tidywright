'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { StepAgency, StepBranding, StepEmbed, type SlugState } from '@tw/ui'

const TAKEN = ['northwind', 'atlas', 'admin', 'api', 'app']

/**
 * The mock half of onboarding. In B1 the slug check is a request and Finish is
 * a write; here they are a timer and a redirect, so the screens can be reviewed
 * and the transitions felt before any of that exists.
 */
export function OnboardingClient({ step }: { step: 1 | 2 | 3 }) {
  const router = useRouter()
  const [slug, setSlug] = useState('')
  const [slugState, setSlugState] = useState<SlugState>('idle')

  // Debounced, because checking on every keystroke would be a request per
  // letter in B1 and a flickering hint here.
  useEffect(() => {
    if (slug.length === 0) {
      setSlugState('idle')
      return
    }
    setSlugState('checking')
    const timer = setTimeout(() => {
      setSlugState(TAKEN.includes(slug) ? 'taken' : 'free')
    }, 400)
    return () => clearTimeout(timer)
  }, [slug])

  if (step === 1) {
    return (
      <StepAgency
        defaultName="Northwind Digital"
        slugState={slugState}
        onSlugChange={setSlug}
        onNext={() => router.push('/onboarding/2')}
      />
    )
  }

  if (step === 2) {
    return (
      <StepBranding
        onBack={() => router.push('/onboarding/1')}
        onSkip={() => router.push('/onboarding/3')}
        onNext={() => router.push('/onboarding/3')}
      />
    )
  }

  return (
    <StepEmbed
      snippet={`<div id="tw-audit"></div>\n<script src="https://siteauditserver.com/embed.js" data-key="pk_live_demo" defer></script>`}
      hostedUrl="/a/northwind-digital"
      onBack={() => router.push('/onboarding/2')}
      onFinish={() => router.push('/overview?empty=1')}
    />
  )
}
