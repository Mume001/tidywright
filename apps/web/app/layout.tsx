import type { Metadata } from 'next'
import type { ReactNode } from 'react'

/*
 * Fonts ship as npm packages and are bundled into our own build. Nothing is ever
 * requested from Google at runtime or at build time, which is what
 * docs/23-compliance.md requires and what keeps the agency's cookie banner
 * unchanged when they embed our form.
 */
import '@fontsource-variable/space-grotesk'
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/500.css'
import '@fontsource/ibm-plex-sans/600.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tidywright',
  description: 'Embed a branded SEO audit on your site. Visitors get the fix, you get the lead.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
