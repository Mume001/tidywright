import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'

const button = cva(
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-field)] border font-semibold whitespace-nowrap transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'border-lime bg-lime text-on-lime hover:border-lime-l hover:bg-lime-l',
        secondary: 'border-line2 bg-raise text-tx hover:bg-panel2',
        ghost: 'border-transparent bg-transparent text-tx2 hover:bg-panel2 hover:text-tx',
        danger: 'border-coral/40 bg-transparent text-coral hover:bg-coral/10',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-3.5 text-[13px]',
        lg: 'h-11 px-5 text-sm',
      },
      full: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'md', full: false },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof button> {
  loading?: boolean
  /** Rendered before the label. Skipped while loading, the spinner takes its place. */
  icon?: ReactNode
}

export function Button({
  className,
  variant,
  size,
  full,
  loading = false,
  icon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(button({ variant, size, full }), className)}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  )
}
