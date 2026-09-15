import { cn } from '../lib/cn'

export interface AgencyMarkProps {
  name: string
  logoUrl?: string | null
  size?: number
  className?: string
}

/**
 * The agency's logo, or its initial on its own colour when there is none.
 *
 * Every visitor surface opens with this, and most agencies will not have
 * uploaded anything on day one. A coloured square with a letter reads as
 * deliberate; a broken image or an empty gap reads as ours.
 */
export function AgencyMark({ name, logoUrl, size = 24, className }: AgencyMarkProps) {
  if (logoUrl) {
    return (
      // A plain img, not next/image: this package is framework free, and the
      // logo is a small file served from our own Storage bucket.
      <img
        src={logoUrl}
        alt={name}
        width={size}
        height={size}
        className={cn('shrink-0 rounded-md object-contain', className)}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <span
      aria-hidden
      className={cn(
        'grid shrink-0 place-items-center rounded-md bg-lime font-display font-bold text-on-lime',
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.55) }}
    >
      {name.trim().charAt(0).toUpperCase() || '?'}
    </span>
  )
}
