import { cn } from '../lib/cn'

/**
 * Our mark. Only ever appears on our own surfaces: the application, the auth
 * screens, the bot page. Never in a report, never in the form, because those
 * carry the agency's brand. decisions/0011 point 5.
 */
export function Logo({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn('flex items-center justify-center rounded-lg bg-lime text-on-lime', className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        style={{ width: size * 0.55, height: size * 0.55 }}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M14.7 6.3a4.5 4.5 0 0 0 5.9 5.9l-8.4 8.4a2.1 2.1 0 0 1-3-3z" />
      </svg>
    </span>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <Logo />
      <span className="font-display text-[15px] font-bold tracking-tight">Tidywright</span>
    </span>
  )
}
