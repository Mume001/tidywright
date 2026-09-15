'use client'

import { PageBody, ScreenError } from '@tw/ui'

/**
 * The error boundary for every signed in screen.
 *
 * The digest is Next's own identifier for the thrown error and it is the only
 * thing that ties what the agency saw to what our logs saw, so it goes on the
 * screen where it can be read out, not into a console.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <PageBody>
      <ScreenError requestId={error.digest} onRetry={reset} />
    </PageBody>
  )
}
