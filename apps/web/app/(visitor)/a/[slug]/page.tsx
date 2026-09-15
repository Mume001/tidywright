import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AgencyMark } from '@tw/ui'
import { AuditForm } from '@/components/audit-form'
import { BrandTheme } from '@/components/brand-theme'
import { formContextBySlug } from '@/lib/mock/resolve'

/**
 * The hosted form. docs/15-frontend-spec.md 1.3.
 *
 * Same card as the embed, on a page of its own, for agencies who cannot touch
 * their CMS or who would rather put a link in an email. Our name appears
 * nowhere: the host is neutral and the page is the agency's.
 */

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const context = formContextBySlug(slug)

  return {
    title: context ? `Free SEO check | ${context.agency.name}` : 'Free SEO check',
    description: context?.branding.subline,
    robots: { index: false, follow: false },
  }
}

export default async function HostedFormPage({ params }: PageProps) {
  const { slug } = await params
  const context = formContextBySlug(slug)
  if (!context) notFound()

  const { agency, branding, embedKey } = context

  return (
    <BrandTheme primary={branding.primaryColor}>
      <div className="flex min-h-screen flex-col">
        <div className="h-1 bg-lime" />

        <main className="flex flex-1 items-center justify-center px-4 py-10">
          <div className="w-full max-w-[420px]">
            <div className="mb-6 flex items-center justify-center gap-2.5">
              <AgencyMark name={agency.name} logoUrl={null} size={28} />
              <span className="font-display text-lg font-bold tracking-tight">{agency.name}</span>
            </div>

            <AuditForm
              agencyName={agency.name}
              branding={branding}
              publicKey={embedKey.publicKey}
              showPoweredBy={!branding.hidePoweredBy}
              mode="inline"
            />
          </div>
        </main>

        <footer className="px-4 pb-8 text-center text-xs text-tx3">
          {branding.companyAddress && <p>{branding.companyAddress}</p>}
          {branding.privacyPolicyUrl && (
            <p className="mt-1">
              <a
                href={branding.privacyPolicyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                Privacy policy
              </a>
            </p>
          )}
        </footer>
      </div>
    </BrandTheme>
  )
}
