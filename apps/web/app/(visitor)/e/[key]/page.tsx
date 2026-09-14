import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AuditForm } from '@/components/audit-form'
import { BrandTheme } from '@/components/brand-theme'
import { formContextByKey } from '@/lib/mock/resolve'

/**
 * The form inside the iframe, loaded by /embed.js on the agency's own site.
 * docs/15-frontend-spec.md 1.2.
 *
 * The page is see through and has no padding of its own: the loader reserves
 * the height and the card sits on the agency's background, so the embed looks
 * like part of their page rather than a window cut into it.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

interface PageProps {
  params: Promise<{ key: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export default async function EmbeddedFormPage({ params, searchParams }: PageProps) {
  const { key } = await params
  const query = await searchParams

  const context = formContextByKey(key)
  if (!context) notFound()

  const { agency, branding } = context
  const mode = one(query.mode) === 'redirect' ? 'redirect' : 'inline'
  const variant = one(query.variant) === 'score_only' ? 'score_only' : 'full'

  return (
    <BrandTheme primary={branding.primaryColor} surface="transparent">
      <AuditForm
        agencyName={agency.name}
        branding={branding}
        publicKey={key}
        showPoweredBy={!branding.hidePoweredBy}
        mode={mode}
        variant={variant}
      />
    </BrandTheme>
  )
}
