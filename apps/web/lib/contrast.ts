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

function toRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean
  return [
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  ]
}

function toHex([r, g, b]: [number, number, number]): string {
  const part = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, '0')
  return `#${part(r)}${part(g)}${part(b)}`
}

/** True when the string is a colour we are willing to put on a page. */
export function isHexColor(value: string): boolean {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())
}

/**
 * The agency's colour, darkened until it is readable as text on white.
 *
 * An agency picks its colour for a logo, not for body text, so a bright orange
 * or a pale teal arrives regularly. docs/27-design-system.md says never to put
 * the brand colour on white below 4.5:1, and to mix it towards black until it
 * passes. This is that mix, done on the server, so no visitor is ever served a
 * link they cannot read.
 */
export function readableInk(hex: string, target = 4.5): string {
  if (!isHexColor(hex)) return '#16161a'

  const rgb = toRgb(hex)
  for (let mix = 0; mix <= 100; mix += 4) {
    const candidate = toHex([
      (rgb[0] * (100 - mix)) / 100,
      (rgb[1] * (100 - mix)) / 100,
      (rgb[2] * (100 - mix)) / 100,
    ])
    if (contrastRatio(candidate, '#ffffff') >= target) return candidate
  }
  return '#16161a'
}
