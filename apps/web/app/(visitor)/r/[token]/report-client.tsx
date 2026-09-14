'use client'

import { ReportView, type ReportViewProps } from '@tw/ui'
import { useEffect } from 'react'
import { track, type TrackEvent } from '@/lib/track'

/**
 * The report, with the analytics wired in.
 *
 * ReportView takes an onEvent callback, and a function cannot be handed from a
 * server component to a client one, so this thin wrapper is where the two meet.
 * The page is still rendered on the server; this only decides what happens when
 * somebody copies a fix or clicks the agency's button.
 */
export function Report(props: Omit<ReportViewProps, 'onEvent'> & { token: string }) {
  const { token, ...view } = props

  const score = view.audit.score ?? -1
  const variant = view.audit.variant

  // Once per report, not once per render.
  useEffect(() => {
    track('report_viewed', { token, score, variant })
  }, [token, score, variant])

  return <ReportView {...view} onEvent={(event, data) => track(event as TrackEvent, data)} />
}
