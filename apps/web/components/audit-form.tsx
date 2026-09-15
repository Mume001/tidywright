'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { EmbedForm, type EmbedFormState, type EmbedSubmitValues } from '@tw/ui'
import type { Branding } from '@tw/shared'
import { track } from '@/lib/track'
import { isEmbedded, openReport, useIframeResize } from '@/lib/use-iframe-resize'

export interface AuditFormProps {
  agencyName: string
  branding: Branding
  publicKey: string
  showPoweredBy: boolean
  /** `redirect` opens the report the moment the audit is queued. */
  mode: 'inline' | 'redirect'
  /** The pilot variant, when the hosting page asks for one. */
  variant?: 'full' | 'score_only'
}

/** docs/17-backend-spec.md: two seconds, up to sixty. */
const POLL_MS = 2_000

/**
 * The form with a server behind it. Everything above this line is presentation
 * and everything below it is the API, which in F1 is /api/mock and in B4 is
 * /api/v1 with nothing else changing.
 */
export function AuditForm({
  agencyName,
  branding,
  publicKey,
  showPoweredBy,
  mode,
  variant,
}: AuditFormProps) {
  const [state, setState] = useState<EmbedFormState>({ kind: 'form' })
  const shell = useRef<HTMLDivElement>(null)
  const token = useRef<string | null>(null)
  const reportUrl = useRef<string | null>(null)
  // Kept from the submit, because the status endpoint will never hand an email
  // back to a page anyone can open with a token.
  const email = useRef('')

  useIframeResize(shell)

  useEffect(() => {
    track('form_viewed', { key: publicKey, embedded: isEmbedded() })
  }, [publicKey])

  const open = useCallback(() => {
    if (!reportUrl.current) return
    track('report_opened', { token: token.current })
    openReport(reportUrl.current)
  }, [])

  const submit = useCallback(
    async (values: EmbedSubmitValues) => {
      setState({ kind: 'validating' })
      track('form_submitted', { key: publicKey })
      email.current = values.email

      let host = values.url
      try {
        host = new URL(values.url).hostname
      } catch {
        /* the form already normalised this; the display name is cosmetic */
      }

      try {
        const response = await fetch('/api/mock/audits', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            key: publicKey,
            url: values.url,
            email: values.email,
            // What the visitor ticked, never a constant. decisions/0011 point 3.
            consent_marketing: values.consentMarketing,
            turnstile_token: values.turnstileToken,
            host: typeof window === 'undefined' ? '' : window.location.hostname,
            variant,
          }),
        })

        const body = (await response.json().catch(() => ({}))) as Record<string, unknown>

        if (!response.ok) {
          const code = typeof body.error === 'string' ? body.error : 'server_error'
          // Already checked today: the visitor still gets the report that exists.
          if (typeof body.report_url === 'string') reportUrl.current = body.report_url
          track('form_error', { code })
          setState({ kind: 'error', code })
          return
        }

        token.current = String(body.token)
        reportUrl.current = String(body.report_url)
        setState({ kind: 'queued', host, status: 'queued' })

        // In redirect mode the report opens straight away and shows its own
        // pending state. docs/15-frontend-spec.md 1.2.
        if (mode === 'redirect') open()
      } catch {
        track('form_error', { code: 'server_error' })
        setState({ kind: 'error', code: 'server_error' })
      }
    },
    [mode, open, publicKey, variant],
  )

  // Poll while the audit runs. Stops on the first finished answer, and stops
  // itself if the component goes away mid flight.
  useEffect(() => {
    if (state.kind !== 'queued' || !token.current) return
    let live = true

    const timer = setInterval(async () => {
      try {
        const response = await fetch(`/api/mock/audits/${token.current}/status`)
        if (!live || !response.ok) return
        const body = (await response.json()) as {
          status: string
          score: number | null
          report_url: string
        }
        if (!live) return

        reportUrl.current = body.report_url

        if (body.status === 'done') {
          track('result_viewed', { score: body.score })
          setState({
            kind: 'done',
            score: body.score ?? 0,
            email: email.current,
            reportUrl: body.report_url,
          })
          return
        }

        if (body.status === 'failed' || body.status === 'expired') {
          // The reason belongs in the report, which can show what was fetched
          // and what came back. docs/15-frontend-spec.md 1.2.
          track('result_viewed', { status: body.status })
          open()
          return
        }

        setState((current) =>
          current.kind === 'queued'
            ? { ...current, status: body.status as typeof current.status }
            : current,
        )
      } catch {
        /* one missed poll is not a failure; the next one is two seconds away */
      }
    }, POLL_MS)

    return () => {
      live = false
      clearInterval(timer)
    }
  }, [state.kind, open])

  return (
    <div ref={shell}>
      <EmbedForm
        agencyName={agencyName}
        branding={branding}
        state={state}
        showPoweredBy={showPoweredBy}
        onSubmit={submit}
        onRetry={() => setState({ kind: 'form' })}
        onOpenReport={open}
      />
    </div>
  )
}
