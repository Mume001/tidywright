'use client'

import { ArrowLeft, ArrowRight, Check, ExternalLink, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Button, ButtonLink } from '../components/button'
import { Card, CardBody } from '../components/card'
import { CodeBlock } from '../components/copy-field'
import { Input } from '../components/input'
import { Stepper } from '../components/stepper'
import { Switch } from '../components/toggle'
import { Wordmark } from './logo'

export const ONBOARDING_STEPS = ['Agency', 'Branding', 'Embed'] as const

export function OnboardingFrame({
  step,
  title,
  description,
  children,
}: {
  step: number
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-bg px-4 py-10">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-8 flex justify-center">
          <Wordmark />
        </div>

        <Stepper steps={ONBOARDING_STEPS} current={step} className="mb-6" />

        <Card>
          <CardBody className="p-6">
            <h1 className="font-display text-lg font-bold tracking-tight">{title}</h1>
            {description && <p className="mt-1.5 text-[13px] text-tx2">{description}</p>}
            <div className="mt-5">{children}</div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

/** Back on the left, forward on the right, skip as a quiet third. */
function StepNav({
  onBack,
  onNext,
  onSkip,
  nextLabel = 'Continue',
  loading,
  nextDisabled,
}: {
  onBack?: () => void
  onNext?: () => void
  onSkip?: () => void
  nextLabel?: string
  loading?: boolean
  nextDisabled?: boolean
}) {
  return (
    <div className="mt-6 flex items-center gap-2">
      {onBack && (
        <Button variant="ghost" onClick={onBack} icon={<ArrowLeft className="size-4" />}>
          Back
        </Button>
      )}
      {onSkip && (
        <Button variant="ghost" onClick={onSkip} className="ml-auto">
          Skip for now
        </Button>
      )}
      <Button
        onClick={onNext}
        loading={loading}
        disabled={nextDisabled}
        className={onSkip ? '' : 'ml-auto'}
      >
        {nextLabel}
        {!loading && <ArrowRight className="size-4" aria-hidden />}
      </Button>
    </div>
  )
}

export type SlugState = 'idle' | 'checking' | 'free' | 'taken'

export interface StepAgencyProps {
  defaultName?: string
  defaultSlug?: string
  slugState?: SlugState
  onSlugChange?: (slug: string) => void
  onNext?: (values: { name: string; slug: string; website: string }) => void
}

/**
 * The slug is checked while they type, because finding out it is taken after
 * pressing Continue means retyping it with the page scrolled somewhere else.
 */
export function StepAgency({
  defaultName = '',
  defaultSlug = '',
  slugState = 'idle',
  onSlugChange,
  onNext,
}: StepAgencyProps) {
  const [name, setName] = useState(defaultName)
  const [slug, setSlug] = useState(defaultSlug)
  const [website, setWebsite] = useState('')

  const slugHint = {
    idle: 'Letters, numbers and dashes.',
    checking: 'Checking…',
    free: 'Available.',
    taken: undefined,
  }[slugState]

  return (
    <OnboardingFrame
      step={1}
      title="Your agency"
      description="This is the name your visitors see on every report."
    >
      <Input
        label="Agency name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Northwind Digital"
      />
      <Input
        label="Your address on our domain"
        prefix="siteauditserver.com/a/"
        value={slug}
        onChange={(e) => {
          const next = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
          setSlug(next)
          onSlugChange?.(next)
        }}
        hint={slugHint}
        error={slugState === 'taken' ? 'Somebody has this one. Try another.' : undefined}
        aside={
          slugState === 'checking' ? (
            <Loader2 className="size-3 animate-spin" aria-hidden />
          ) : slugState === 'free' ? (
            <Check className="size-3 text-score-good-ink" aria-hidden />
          ) : undefined
        }
      />
      <Input
        label="Your website"
        type="url"
        placeholder="https://northwind.agency"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        hint="Optional. We use it to guess your colour in the next step."
      />

      <StepNav
        onNext={() => onNext?.({ name, slug, website })}
        nextDisabled={name.trim().length === 0 || slugState === 'taken'}
      />
    </OnboardingFrame>
  )
}

export interface StepBrandingProps {
  suggestions?: readonly string[]
  defaultColor?: string
  preview?: React.ReactNode
  onBack?: () => void
  onSkip?: () => void
  onNext?: (values: { color: string; ctaLabel: string; ctaUrl: string }) => void
}

export function StepBranding({
  suggestions = ['#2563EB', '#C2410C', '#7C3AED'],
  defaultColor = '#2563EB',
  preview,
  onBack,
  onSkip,
  onNext,
}: StepBrandingProps) {
  const [color, setColor] = useState(defaultColor)
  const [ctaLabel, setCtaLabel] = useState('Get the full fix pack')
  const [ctaUrl, setCtaUrl] = useState('')

  return (
    <OnboardingFrame
      step={2}
      title="Make it yours"
      description="Your logo and colour, on the form and on every report."
    >
      <div className="mb-3.5">
        <div className="mb-1.5 text-xs font-semibold text-tx2">Logo</div>
        <div className="flex items-center justify-center rounded-[var(--radius-field)] border border-dashed border-line2 bg-raise px-4 py-7 text-center">
          <div>
            <p className="text-[13px] text-tx2">Drop a PNG or SVG, or click to choose</p>
            <p className="mt-1 text-[11px] text-tx2">Up to 500 KB. Skip it and we use a letter.</p>
          </div>
        </div>
      </div>

      <div className="mb-3.5">
        <div className="mb-1.5 text-xs font-semibold text-tx2">Colour</div>
        <div className="flex items-center gap-2">
          <span
            className="size-9 shrink-0 rounded-[var(--radius-field)] border border-line2"
            style={{ background: color }}
            aria-hidden
          />
          <input
            value={color}
            onChange={(e) => setColor(e.target.value)}
            aria-label="Brand colour, hex"
            className="h-9 w-28 rounded-[var(--radius-field)] border border-line2 bg-raise px-3 font-mono text-[13px] text-tx"
          />
          <div className="flex gap-1.5">
            {suggestions.map((swatch) => (
              <button
                key={swatch}
                type="button"
                onClick={() => setColor(swatch)}
                aria-label={`Use ${swatch}`}
                className="size-7 rounded-md border border-line2"
                style={{ background: swatch }}
              />
            ))}
          </div>
        </div>
      </div>

      <Input
        label="Call to action"
        value={ctaLabel}
        onChange={(e) => setCtaLabel(e.target.value)}
        hint="The button under the report. Yours, not ours."
      />
      <Input
        label="Where it goes"
        type="url"
        placeholder="https://northwind.agency/contact"
        value={ctaUrl}
        onChange={(e) => setCtaUrl(e.target.value)}
      />

      {preview && (
        <div className="mt-4 rounded-[var(--radius-card)] border border-line bg-panel2 p-3">
          <div className="mb-2 text-[11px] text-tx2">Live preview</div>
          {preview}
        </div>
      )}

      <StepNav
        onBack={onBack}
        onSkip={onSkip}
        onNext={() => onNext?.({ color, ctaLabel, ctaUrl })}
      />
    </OnboardingFrame>
  )
}

export interface StepEmbedProps {
  snippet: string
  hostedUrl: string
  onBack?: () => void
  onFinish?: () => void
}

export function StepEmbed({ snippet, hostedUrl, onBack, onFinish }: StepEmbedProps) {
  const [redirect, setRedirect] = useState(false)

  return (
    <OnboardingFrame
      step={3}
      title="Put it on your site"
      description="One script tag and one div. Anywhere a visitor can reach."
    >
      <div className="mb-1.5 text-xs font-semibold text-tx2">Paste before {'</body>'}</div>
      <CodeBlock code={snippet} />

      <div className="mt-4 flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-line bg-panel2 px-3.5 py-3">
        <div>
          <div className="text-[13px] font-semibold text-tx">Open the report in a new tab</div>
          <p className="mt-0.5 text-[12px] text-tx2">
            Off means the report opens inside the form, on your page.
          </p>
        </div>
        <Switch checked={redirect} onChange={setRedirect} label="Redirect mode" />
      </div>

      <div className="mt-4 rounded-[var(--radius-card)] border border-line px-3.5 py-3">
        <div className="text-[13px] font-semibold text-tx">No site to paste into yet?</div>
        <p className="mt-0.5 text-[12px] text-tx2">
          Use the hosted form. Same thing, on our domain, ready to share.
        </p>
        <ButtonLink
          href={hostedUrl}
          target="_blank"
          rel="noreferrer"
          size="sm"
          variant="secondary"
          className="mt-2.5"
        >
          Test it <ExternalLink className="size-3.5" aria-hidden />
        </ButtonLink>
      </div>

      <p className="mt-4 text-[12px] text-tx2">
        We will show your first audit on the overview as soon as one comes in.
      </p>

      <StepNav onBack={onBack} onNext={onFinish} nextLabel="Finish" />
    </OnboardingFrame>
  )
}
