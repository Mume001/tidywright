/**
 * The analytics events from docs/15-frontend-spec.md, named once so the screens
 * can call them while they are being written.
 *
 * An empty shell on purpose. In B5 the body of `track` becomes a write to the
 * events table and stats.rollup turns them into the numbers on /overview.
 * Adding the call sites later means missing half of them, so they go in now and
 * the sink arrives under them.
 */

export type TrackEvent =
  // Form, docs/15-frontend-spec.md 1.2
  | 'form_viewed'
  | 'form_submitted'
  | 'form_error'
  | 'result_viewed'
  | 'report_opened'
  // Report, docs/15-frontend-spec.md 2.1
  | 'report_viewed'
  | 'fix_copied'
  | 'fixes_expanded'
  | 'checks_expanded'
  | 'cta_clicked'
  | 'calendar_clicked'
  | 'powered_by_clicked'
  | 'unsubscribed'

export type TrackProps = Record<string, string | number | boolean | null>

export function track(event: TrackEvent, props: TrackProps = {}): void {
  if (typeof navigator === 'undefined') return

  const body = JSON.stringify({ event, props, at: new Date().toISOString() })

  try {
    // Beacon survives the page being closed, which is the whole point for
    // cta_clicked and report_opened.
    if (typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon('/api/mock/events', new Blob([body], { type: 'application/json' }))
      return
    }
    void fetch('/api/mock/events', { method: 'POST', body, keepalive: true })
  } catch {
    // Analytics never breaks a page.
  }
}
