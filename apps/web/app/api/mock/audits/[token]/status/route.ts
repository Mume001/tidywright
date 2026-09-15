import { findAudit } from '@/lib/mock/audit-state'
import { mockGuard } from '@/lib/mock/guard'

/**
 * Stands in for GET /api/v1/audits/:id/status. Polled every two seconds by the
 * form while it waits and by the report while it is pending.
 *
 * Deliberately says nothing a visitor should not see: a status, a score once
 * there is one, and the report address. No email, no agency, no cost.
 */
export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const blocked = mockGuard()
  if (blocked) return blocked

  const { token } = await params
  const audit = findAudit(token)
  if (!audit) return Response.json({ error: 'not_found' }, { status: 404 })

  return Response.json(
    {
      status: audit.status,
      failure_code: audit.failureCode,
      score: audit.score,
      report_url: `${new URL(request.url).origin}/r/${audit.token}`,
    },
    // One second, exactly as docs/17-backend-spec.md specifies, so a burst of
    // pollers from one report does not turn into a burst of queries.
    { headers: { 'Cache-Control': 'public, max-age=1' } },
  )
}
