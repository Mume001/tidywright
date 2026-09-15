import { BOT } from '@tw/shared'

/**
 * The published egress list. One of the three validation methods Cloudflare
 * accepts, and the one Bing and most WAF vendors still expect.
 *
 * It is served from code rather than kept as a static file so that it cannot
 * disagree with what safeFetch actually uses, and so that adding an address is a
 * commit somebody reviews. An address that appears here without being briefed to
 * Cloudflare is a listed reason for removal from the programme, so the runbook
 * in docs/38-bot-verification.md pairs the two steps.
 */

export const runtime = 'nodejs'

export function GET() {
  const body = {
    name: BOT.name,
    operator: BOT.operator,
    user_agent: BOT.userAgent,
    info_url: BOT.infoUrl,
    contact: BOT.contactEmail,
    category: BOT.category,
    /** Reverse DNS on each of these forward-confirms back to the address. */
    ips: BOT.egressIps,
    updated: '2026-09-15',
  }

  return Response.json(body, {
    headers: { 'cache-control': 'public, max-age=3600', 'x-tw-bot': BOT.name },
  })
}
