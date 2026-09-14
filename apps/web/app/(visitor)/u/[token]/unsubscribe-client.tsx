'use client'

import { useEffect, useState } from 'react'
import { UnsubscribeCard } from '@tw/ui'
import { track } from '@/lib/track'

export interface UnsubscribeClientProps {
  agencyName: string
  token: string
}

/**
 * Takes the address off the list. docs/15-frontend-spec.md 2.3.
 *
 * The write is a POST sent once the page is open, never the link itself. Mail
 * scanners and link previewers follow every GET in an email, and a GET that
 * unsubscribes people unsubscribes people who never clicked. docs/26-email.md.
 */
export function UnsubscribeClient({ agencyName, token }: UnsubscribeClientProps) {
  const [state, setState] = useState<'working' | 'done' | 'failed'>('working')

  useEffect(() => {
    let live = true

    void fetch(`/api/mock/unsubscribe/${token}`, { method: 'POST' })
      .then((response) => {
        if (!live) return
        setState(response.ok ? 'done' : 'failed')
        if (response.ok) track('unsubscribed', { token })
      })
      .catch(() => {
        if (live) setState('failed')
      })

    return () => {
      live = false
    }
  }, [token])

  return <UnsubscribeCard agencyName={agencyName} state={state} />
}
