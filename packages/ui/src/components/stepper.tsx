import { Check } from 'lucide-react'
import { cn } from '../lib/cn'

export interface StepperProps {
  steps: readonly string[]
  /** 1 based, so it reads the same here as it does in the URL. */
  current: number
  className?: string
}

/**
 * Three steps, and the reason it is not a progress bar: a bar says how far
 * along you are, a stepper says what is left. Somebody deciding whether to
 * finish onboarding now or after lunch needs the second one.
 */
export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <ol className={cn('flex items-center gap-2', className)}>
      {steps.map((label, index) => {
        const step = index + 1
        const done = step < current
        const active = step === current

        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              aria-current={active ? 'step' : undefined}
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
                done && 'bg-lime text-on-lime',
                active && 'border border-lime text-lime',
                !done && !active && 'border border-line2 text-tx2',
              )}
            >
              {done ? <Check className="size-3.5" aria-hidden /> : step}
            </span>
            <span
              className={cn(
                'hidden text-[13px] sm:block',
                active ? 'font-semibold text-tx' : 'text-tx2',
              )}
            >
              {label}
            </span>
            {step < steps.length && (
              <span
                aria-hidden
                className={cn('ml-1 h-px flex-1', done ? 'bg-lime/50' : 'bg-line')}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
