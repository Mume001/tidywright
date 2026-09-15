import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  // The UI package ships TypeScript source, not a build. Next compiles it with the app.
  transpilePackages: ['@tw/ui', '@tw/shared'],
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      /*
       * The two halves of the embed, cached very differently on purpose.
       * docs/15-frontend-spec.md 1.1: the tag an agency pastes points at a file
       * we can replace within five minutes, and that file points at one that is
       * never edited, so the bytes on the critical path of their page are
       * fetched once a year rather than revalidated on every view.
       */
      {
        source: '/embed.js',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=300, must-revalidate' }],
      },
      {
        source: '/embed/:version/frame.js',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },
}

export default config
