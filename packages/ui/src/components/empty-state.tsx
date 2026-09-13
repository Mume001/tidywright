import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  /** Say what to do next, not just that there is nothing here. */
  description: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-14 text-center', className)}>
      {icon && (
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-raise text-tx3">
          {icon}
        </div>
      )}
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-[13px] leading-relaxed text-tx2">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
