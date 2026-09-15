import { type NextRequest, NextResponse } from 'next/server'

/**
 * One deployment serves three hosts. docs/14-product-map.md.
 *
 *   tidywright.com          marketing, our brand
 *   app.tidywright.com      the agency app, our brand
 *   siteauditserver.com     everything a visitor sees, never our brand
 *
 * The host decides which route group answers, so an agency's report can never be
 * served from a URL carrying our name.
 *
 * Next 16 calls this file proxy.ts. It was middleware.ts up to Next 15.
 */
const VISITOR_PATHS = ['/e/', '/r/', '/a/', '/u/', '/embed.js', '/embed/']

/** The token out of /r/<token>, and nothing from /r/gone. */
function reportToken(pathname: string): string | null {
  if (!pathname.startsWith('/r/')) return null
  const segment = pathname.slice(3).split('/')[0]
  if (!segment || segment === 'gone') return null
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

export default async function proxy(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const { pathname } = request.nextUrl
  const isVisitorHost = host.includes('siteauditserver')
  const isVisitorPath = VISITOR_PATHS.some((p) => pathname.startsWith(p))

  // Visitor surfaces must not answer on the branded hosts, and the neutral host
  // must not serve anything else. In development every host is allowed.
  if (process.env.NODE_ENV === 'production') {
    if (isVisitorHost && !isVisitorPath) {
      return new NextResponse(null, { status: 404 })
    }
    if (!isVisitorHost && isVisitorPath) {
      return new NextResponse(null, { status: 404 })
    }
  }

  /*
   * A deleted or expired report has to answer 410, not 200. A page in Next
   * cannot set its own status code, and notFound() is the only interrupt there
   * is, so the status is put on here and the body comes from /r/gone.
   *
   * The lookup is imported inside the branch: it reads the whole mock dataset,
   * and no other request should pay for that. In B4 it becomes the same shape of
   * check against a deleted_at column.
   */
  const token = reportToken(pathname)
  if (token) {
    const { isExpiredToken } = await import('@/lib/mock/expired')
    if (isExpiredToken(token)) {
      const gone = request.nextUrl.clone()
      gone.pathname = '/r/gone'
      gone.search = ''
      gone.searchParams.set('t', token)
      const response = NextResponse.rewrite(gone, { status: 410 })
      response.headers.set('X-Robots-Tag', 'noindex, nofollow')
      response.headers.set('x-tw-surface', 'visitor')
      return response
    }
  }

  const response = NextResponse.next()
  response.headers.set('x-tw-surface', isVisitorPath ? 'visitor' : 'brand')

  // Nothing a visitor sees belongs in an index. A report is somebody's audit
  // with their address in it, and a form indexed on our host would compete with
  // the agency's own page. docs/15-frontend-spec.md 2.1.
  if (isVisitorPath) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
