import { BrandTheme } from '@/components/brand-theme'

/**
 * A visitor asked for a form or a report that is not there: an embed key that
 * was rotated, a slug that changed, a token somebody mistyped.
 *
 * Carries no branding, because we do not know whose it would be, and carries
 * none of ours, because this page is served from the neutral host.
 * docs/16-access-control.md.
 */
export default function VisitorNotFound() {
  return (
    <BrandTheme primary="#16161a">
      <main className="grid min-h-screen place-items-center px-6 text-center">
        <div className="max-w-sm">
          <h1 className="font-display text-xl font-bold">This page is not available</h1>
          <p className="mt-2 text-sm leading-relaxed text-tx2">
            The link may be old, or the form it belongs to may have been replaced. Ask whoever sent
            it to you for a current one.
          </p>
        </div>
      </main>
    </BrandTheme>
  )
}
