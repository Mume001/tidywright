import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('rounded-[var(--radius-card)] border border-line bg-panel', className)}>
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  aside,
  className,
  children,
}: {
  title?: ReactNode
  aside?: ReactNode
  className?: string
  children?: ReactNode
}) {
  return (
    <div className={cn('flex items-center gap-2.5 border-b border-line px-4.5 py-3.5', className)}>
      {title && <h2 className="font-display text-sm font-semibold">{title}</h2>}
      {children}
      {aside && <div className="ml-auto flex items-center gap-2">{aside}</div>}
    </div>
  )
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('p-4.5', className)}>{children}</div>
}
