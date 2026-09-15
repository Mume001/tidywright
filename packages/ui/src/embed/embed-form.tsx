'use client'

import { AlertTriangle, ArrowRight, XCircle } from 'lucide-react'
import { useId, useState } from 'react'
import { formErrorMessage, normalizeEmail, normalizeUrl, type AuditStatus } from '@tw/shared'
import type { Branding } from '@tw/shared'
import { Button, ButtonLink } from '../components/button'
import { Checkbox } from '../components/toggle'
import { Input } from '../components/input'
import { ScoreRing } from '../components/score-ring'
import { FormFrame } from './form-frame'
import { TurnstilePlaceholder } from './turnstile-placeholder'

/**
 * The form a visitor fills in, in all five states from
 * docs/15-frontend-spec.md 1.2. One component serves the iframe at /e/[key] and
 * the hosted page at /a/[slug]; only the page around it differs.
 *
 * It owns what the visitor typed and nothing else. Which state to show is the
 * caller's decision, because the caller is the one talking to the API, and
 * because a story has to be able to put the card straight into any of them.
 */

export interface EmbedSubmitValues {
  url: string
  email: string
  turnstileToken: string
}

export type EmbedFormState =
  | { kind: 'form' }
  | { kind: 'validating' }
  | { kind: 'queued'; host: string; status: AuditStatus }
  /**
   * The score and the address we sent the link to, and nothing else. The status
   * endpoint deliberately returns no finding counts and no email, so this card
   * cannot say more than it is entitled to know.
   */
  | { kind: 'done'; score: number; email: string; reportUrl: string }
  | { kind: 'error'; code: string; requestId?: string }

export interface EmbedFormProps {
  agencyName: string
  branding: Branding
  logoUrl?: string | null
  state: EmbedFormState
  showPoweredBy: boolean
  onSubmit: (values: EmbedSubmitValues) => void
  onRetry: () => void
  onOpenReport: () => void
  className?: string
}

/** Three steps, so the wait has a shape rather than just a spinner. */
const STEPS: Partial<Record<AuditStatus, { index: number; label: string }>> = {
  queued: { index: 1, label: 'Reading the page' },
  fetching: { index: 1, label: 'Reading the page' },
  checking: { index: 2, label: 'Running the checks' },
  generating: { index: 3, label: 'Writing your fixes' },
}

function Centred({
  tone,
  icon,
  title,
  children,
}: {
  tone: 'good' | 'bad' | 'brand'
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  const ring =
    tone === 'good' ? 'bg-score-good/12' : tone === 'bad' ? 'bg-score-bad/12' : 'bg-panel2'
  return (
    <div className="mt-8 text-center">
      <div className={`mx-auto grid size-14 place-items-center rounded-full ${ring}`}>{icon}</div>
      <h3 className="mt-4 font-display text-[17px] font-bold">{title}</h3>
      {children}
    </div>
  )
}

export function EmbedForm({
  agencyName,
  branding,
  logoUrl,
  state,
  showPoweredBy,
  onSubmit,
  onRetry,
  onOpenReport,
  className,
}: EmbedFormProps) {
  const statusId = useId()
  const [url, setUrl] = useState('')
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [turnstile, setTurnstile] = useState<string | null>(null)
  const [errors, setErrors] = useState<{
    url?: string
    email?: string
    consent?: string
    turnstile?: string
  }>({})

  const busy = state.kind === 'validating'

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (busy) return

    const checkedUrl = normalizeUrl(url)
    const checkedEmail = normalizeEmail(email)
    const next: typeof errors = {}

    if (!checkedUrl.ok) next.url = formErrorMessage(checkedUrl.code)
    if (!checkedEmail.ok) next.email = formErrorMessage(checkedEmail.code)
    if (!consent) next.consent = 'Please agree before we send your report.'
    if (turnstile === null) next.turnstile = formErrorMessage('turnstile_failed')

    setErrors(next)
    if (Object.keys(next).length > 0) return

    onSubmit({
      url: checkedUrl.ok ? checkedUrl.value.url : url,
      email: checkedEmail.ok ? checkedEmail.value : email,
      turnstileToken: turnstile ?? '',
    })
  }

  function backToForm() {
    setErrors({})
    onRetry()
  }

  return (
    <FormFrame
      agencyName={agencyName}
      logoUrl={logoUrl}
      headline={branding.headline}
      subline={branding.subline}
      showPoweredBy={showPoweredBy}
      className={className}
    >
      {/* Every change of state is announced once, for a screen reader that is
          not watching the spinner. docs/27-design-system.md. */}
      <p id={statusId} aria-live="polite" className="sr-only">
        {state.kind === 'validating' && 'Sending your request.'}
        {state.kind === 'queued' && 'Checking your site. This usually takes a few seconds.'}
        {state.kind === 'done' && `Your report is ready. Score ${state.score} out of 100.`}
        {state.kind === 'error' && formErrorMessage(state.code)}
      </p>

      {(state.kind === 'form' || state.kind === 'validating') && (
        <form className="mt-5" onSubmit={handleSubmit} noValidate>
          {branding.privacyPolicyUrl === null && (
            <p className="mb-3.5 flex gap-2 rounded-[var(--radius-field)] border border-score-mid/40 bg-score-mid/10 p-2.5 text-xs text-tx2">
              <AlertTriangle className="mt-px size-4 shrink-0 text-score-mid-ink" aria-hidden />
              <span>
                {agencyName} has not linked a privacy policy yet. Ask them for one before you leave
                your address.
              </span>
            </p>
          )}

          <Input
            label="Website address"
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder="https://yourwebsite.com"
            value={url}
            disabled={busy}
            error={errors.url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-11 text-base"
          />

          <Input
            label="Email for the report"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            disabled={busy}
            error={errors.email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 text-base"
          />

          <div className="mb-3.5">
            <Checkbox
              checked={consent}
              disabled={busy}
              onChange={(e) => setConsent(e.target.checked)}
              label={
                <span>
                  I agree to receive my report and follow-up from {agencyName} by email.{' '}
                  {branding.privacyPolicyUrl && (
                    <a
                      href={branding.privacyPolicyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink underline underline-offset-2"
                    >
                      Privacy policy
                    </a>
                  )}
                </span>
              }
            />
            {errors.consent && (
              <p className="mt-1.5 text-xs text-score-bad-ink" role="alert">
                {errors.consent}
              </p>
            )}
          </div>

          <TurnstilePlaceholder
            token={turnstile}
            onChange={setTurnstile}
            error={errors.turnstile}
            disabled={busy}
          />

          <Button type="submit" size="lg" full loading={busy} className="h-[46px] text-[15px]">
            {branding.buttonLabel}
          </Button>
        </form>
      )}

      {state.kind === 'queued' && (
        <Centred
          tone="brand"
          icon={
            <span
              aria-hidden
              className="size-14 animate-spin rounded-full border-4 border-panel2 border-t-lime"
              style={{ animationDuration: '900ms' }}
            />
          }
          title={`Checking ${state.host}`}
        >
          <p className="mt-1.5 text-[13px] leading-relaxed text-tx2">
            Reading the page, running our checks, writing your fixes. Usually takes 5 to 10 seconds.
          </p>
          <Progress status={state.status} />
        </Centred>
      )}

      {state.kind === 'done' && (
        <div className="mt-6 text-center">
          <ScoreRing score={state.score} size={96} showCaption={false} className="mx-auto" />
          <h3 className="mt-3 font-display text-[17px] font-bold">Your report is ready</h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-tx2">
            {state.score >= 90
              ? 'Your page is in good shape. The full checklist is in your report.'
              : 'We found what is holding it back, and wrote the most important fixes for you.'}{' '}
            We also sent the link to {state.email}.
          </p>
          {/*
            A link, not a button. The form is usually inside an iframe on
            somebody else's domain, and opening a tab from script after an await
            has lost its user activation. A click on a real link has not.
          */}
          <ButtonLink
            size="lg"
            full
            className="mt-5 h-[46px] text-[15px]"
            href={state.reportUrl}
            target="_blank"
            rel="noopener"
            onClick={onOpenReport}
            icon={<ArrowRight className="size-4" />}
          >
            See your full report
          </ButtonLink>
        </div>
      )}

      {state.kind === 'error' && (
        <Centred
          tone="bad"
          icon={<XCircle className="size-7 text-score-bad-ink" aria-hidden />}
          title="That did not work"
        >
          <p className="mt-1.5 text-[13px] leading-relaxed text-tx2">
            {formErrorMessage(state.code)}
          </p>
          <Button
            variant="secondary"
            size="lg"
            full
            className="mt-5 h-[46px] text-[15px]"
            onClick={backToForm}
          >
            Try again
          </Button>
          {state.requestId && (
            <p className="mt-3 font-mono text-[10.5px] text-tx3">ref {state.requestId}</p>
          )}
        </Centred>
      )}
    </FormFrame>
  )
}

function Progress({ status }: { status: AuditStatus }) {
  const step = STEPS[status] ?? STEPS.queued!
  const percent = [0, 30, 65, 92][step.index] ?? 30

  return (
    <>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-panel2">
        <div
          className="h-full rounded-full bg-lime transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-[11.5px] text-tx3">
        Step {step.index} of 3: {step.label.toLowerCase()}
      </p>
    </>
  )
}
