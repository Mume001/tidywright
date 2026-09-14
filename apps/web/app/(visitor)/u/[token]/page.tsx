import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BrandTheme } from '@/components/brand-theme'
import { agencyById, brandingFor, leadByToken } from '@/lib/mock/resolve'
import { UnsubscribeClient } from './unsubscribe-client'

/**
 * One page, no login, reached from a link in an email.
 * docs/15-frontend-spec.md 2.3.
 */
export const metadata: Metadata = {
  title: 'Unsubscribe',
  robots: { index: false, follow: false },
}

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function UnsubscribePage({ params }: PageProps) {
  const { token } = await params

  const lead = leadByToken(token)
  if (!lead) notFound()

  const agency = agencyById(lead.agencyId)
  const branding = brandingFor(lead.agencyId)
  if (!agency || !branding) notFound()

  return (
    <BrandTheme primary={branding.primaryColor}>
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <UnsubscribeClient agencyName={agency.name} token={token} />
      </div>
    </BrandTheme>
  )
}
