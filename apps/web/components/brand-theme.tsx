import type { CSSProperties, ReactNode } from 'react'
import { isHexColor, onPrimary, readableInk } from '@/lib/contrast'

export interface BrandThemeProps {
  /** branding.primary_color, straight from the agency. */
  primary: string
  /**
   * `page` paints the sheet white, for the report and the hosted form.
   * `transparent` lets the agency's own page show through behind the card,
   * which is what the embedded iframe needs.
   */
  surface?: 'page' | 'transparent'
  children: ReactNode
}

/**
 * Everything a visitor sees runs in the report theme, on the agency's colour.
 *
 * Three colours are resolved here, on the server, and handed to CSS as
 * variables, so no browser ever has to decide and no visitor is ever served an
 * unreadable button. docs/27-design-system.md.
 *
 *   --agency-primary     the colour as given, for filled surfaces
 *   --agency-on-primary  black or white, whichever can be read on top of it
 *   --agency-ink         the same colour darkened until it reads as text on white
 *
 * The colour is checked against a hex pattern before it is used. It arrives from
 * an agency's own branding form, and in B1 that means it arrives from the
 * database: a value that reached CSS unchecked would be a way to write CSS into
 * somebody else's report. docs/22-security.md.
 */
export function BrandTheme({ primary, surface = 'page', children }: BrandThemeProps) {
  const safe = isHexColor(primary) ? primary.trim() : '#16161a'
  const background = surface === 'transparent' ? 'transparent' : '#ffffff'

  return (
    <>
      {/*
        The root layout paints the body in the dark app theme, which is right for
        every screen except these. The embedded form has to be see through so the
        card sits on the agency's own background.
      */}
      <style>{`html,body{background:${background};}`}</style>
      <div
        data-theme="report"
        style={
          {
            '--agency-primary': safe,
            '--agency-on-primary': onPrimary(safe),
            '--agency-ink': readableInk(safe),
            background,
            color: 'var(--color-tx)',
            minHeight: surface === 'page' ? '100vh' : undefined,
          } as CSSProperties
        }
      >
        {children}
      </div>
    </>
  )
}
