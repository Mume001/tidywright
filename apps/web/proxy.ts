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

export default function proxy(request: NextRequest) {
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
