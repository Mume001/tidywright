import { markUnsubscribed } from '@/lib/mock/audit-state'
import { mockGuard } from '@/lib/mock/guard'
import { leadByToken } from '@/lib/mock/resolve'

/**
 * Stands in for POST /api/v1/unsubscribe/:token.
 *
 * A POST, not a GET, because the link in an email is followed by scanners and
 * preview fetchers, and a GET that unsubscribes people is a GET that
 * unsubscribes people who never clicked. docs/26-email.md.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const blocked = mockGuard()
  if (blocked) return blocked

  const { token } = await params
  // Answer the same way whether or not the token is real: the reply must not
  // tell a stranger which tokens exist.
  if (leadByToken(token)) markUnsubscribed(token)
  return new Response(null, { status: 204 })
}
