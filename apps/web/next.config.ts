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
    ]
  },
}

export default config
