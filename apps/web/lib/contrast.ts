/**
 * Pick black or white text for a background, by WCAG relative luminance.
 * Runs on the server so a badly chosen agency colour never produces unreadable
 * buttons in a visitor's report. docs/27-design-system.md.
 */
export function relativeLuminance(hex: string): number {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean

  const channel = (start: number): number => {
    const value = Number.parseInt(full.slice(start, start + 2), 16) / 255
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4)
  }

  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4)
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const [light, dark] = la > lb ? [la, lb] : [lb, la]
  return (light + 0.05) / (dark + 0.05)
}

/** Text colour to put on top of the agency colour. */
export function onPrimary(hex: string): '#ffffff' | '#111111' {
  return contrastRatio(hex, '#ffffff') >= contrastRatio(hex, '#111111') ? '#ffffff' : '#111111'
}

/** True when the colour is safe to use for text on white. */
export function readableOnWhite(hex: string): boolean {
  return contrastRatio(hex, '#ffffff') >= 4.5
}
