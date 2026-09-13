import type { ReactNode } from 'react'
import { onPrimary } from '@/lib/contrast'

/**
 * Everything a visitor sees runs in the report theme, on the agency's colour.
 * The colour is resolved on the server so contrast is checked before it reaches
 * the browser. docs/27-design-system.md.
 *
 * In F1 the colour comes from the branding row for the audit's agency. Until the
 * database exists it falls back to our own ink.
 */
export default function ReportLayout({ children }: { children: ReactNode }) {
  const primary = '#1F5AF6'

  return (
    <div
      data-theme="report"
      style={
        {
          '--agency-primary': primary,
          '--agency-on-primary': onPrimary(primary),
          background: 'var(--color-bg)',
          color: 'var(--color-tx)',
          minHeight: '100vh',
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  )
}
