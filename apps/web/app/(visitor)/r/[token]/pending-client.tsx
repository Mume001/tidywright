'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ReportPending } from '@tw/ui'

export interface PendingReportProps {
  agencyName: string
  token: string
  host: string
  initialStatus: 'queued' | 'fetching' | 'checking' | 'generating'
}

/** docs/15-frontend-spec.md 2.1: every two seconds, for up to sixty. */
const POLL_MS = 2_000
const GIVE_UP_MS = 60_000

/**
 * The report while the worker still has it.
 *
 * When the status turns, it asks the server to render the page again rather
 * than building the report from the polled JSON. The status endpoint returns a
 * status and a score and nothing else, on purpose, so the finished report is
 * always the server's version and there is only one way a report gets built.
 */
export function PendingReport({ agencyName, token, host, initialStatus }: PendingReportProps) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus)
  const [tookTooLong, setTookTooLong] = useState(false)

  useEffect(() => {
    let live = true
    const startedAt = Date.now()

    const timer = setInterval(async () => {
      if (Date.now() - startedAt > GIVE_UP_MS) {
        // We stop asking, but the audit has not failed. The worker will finish
        // and the visitor gets the email. docs/15-frontend-spec.md 2.1.
        if (live) setTookTooLong(true)
        clearInterval(timer)
        return
      }

      try {
        const response = await fetch(`/api/mock/audits/${token}/status`)
        if (!live || !response.ok) return
        const body = (await response.json()) as { status: string }
        if (!live) return

        if (body.status === 'done' || body.status === 'failed' || body.status === 'expired') {
          clearInterval(timer)
          router.refresh()
          return
        }

        setStatus(body.status as typeof status)
      } catch {
        /* a missed poll costs two seconds, not the page */
      }
    }, POLL_MS)

    return () => {
      live = false
      clearInterval(timer)
    }
  }, [router, token])

  return (
    <ReportPending agencyName={agencyName} host={host} status={status} tookTooLong={tookTooLong} />
  )
}
