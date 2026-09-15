import { cn } from '../lib/cn'
import { Wordmark } from './logo'

export interface AuthCardProps {
  title: string
  description?: React.ReactNode
  /** Under the card, usually the link to the opposite screen. */
  footer?: React.ReactNode
  children: React.ReactNode
  className?: string
}

/**
 * The frame every auth screen sits in. Our brand, because this is our
 * application: an agency signing in knows who it is signing in to.
 * decisions/0011 point 5.
 */
export function AuthCard({ title, description, footer, children, className }: AuthCardProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-10">
      <div className={cn('w-full max-w-sm', className)}>
        <div className="mb-7 flex justify-center">
          <Wordmark />
        </div>

        <div className="rounded-[var(--radius-card)] border border-line bg-panel p-6">
          <h1 className="font-display text-lg font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1.5 text-[13px] leading-relaxed text-tx2">{description}</p>
          )}
          <div className="mt-5">{children}</div>
        </div>

        {footer && <div className="mt-5 text-center text-[13px] text-tx2">{footer}</div>}
      </div>
    </div>
  )
}

export function AuthLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="font-semibold text-lime underline-offset-2 hover:underline">
      {children}
    </a>
  )
}
