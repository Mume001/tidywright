import { mockGuard } from '@/lib/mock/guard'

/**
 * Where the analytics events go in F1: nowhere.
 *
 * The events in docs/15-frontend-spec.md are worth naming while the screens are
 * being written, because a call site added later is a call site that gets
 * forgotten. Storing them is B5's job, together with stats.rollup and the
 * events table. Until then this reads the body and drops it.
 */
export async function POST(request: Request) {
  const blocked = mockGuard()
  if (blocked) return blocked

  // Drain the body so sendBeacon counts the delivery as successful.
  await request.text()
  return new Response(null, { status: 204 })
}
