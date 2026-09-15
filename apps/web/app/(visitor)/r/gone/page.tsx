import type { Metadata } from 'next'
import { ReportGone } from '@tw/ui'
import { BrandTheme } from '@/components/brand-theme'
import { reportContext, staticAuditByToken } from '@/lib/mock/resolve'

/**
 * A report that is gone. proxy.ts rewrites here and puts 410 on the response,
 * because a page in Next cannot set its own status code and a deleted report
 * answering 200 would be a lie to every crawler and uptime check that follows
 * the link. docs/18-data-model.md.
 *
 * The token comes along so the page can still wear the agency's colours. If the
 * audit is gone entirely, which is what a real deletion under
 * docs/23-compliance.md leaves behind, there is nothing to brand it with and
 * the neutral version is shown.
 */
export const metadata: Metadata = {
  title: 'Report',
  robots: { index: false, follow: false },
}

interface PageProps {
  searchParams: Promise<{ t?: string }>
}

export default async function ReportGonePage({ searchParams }: PageProps) {
  const { t } = await searchParams
  const audit = t ? staticAuditByToken(t) : null
  const context = audit ? reportContext(audit) : null

  return (
    <BrandTheme primary={context?.branding.primaryColor ?? '#16161a'}>
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <ReportGone
          agencyName={context?.agency.name}
          formUrl={context ? `/a/${context.agency.slug}` : null}
        />
      </div>
    </BrandTheme>
  )
}
