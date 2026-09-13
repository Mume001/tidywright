'use client'

import { Check } from 'lucide-react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { useId } from 'react'
import { cn } from '../lib/cn'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode
}

export function Checkbox({ label, className, id, checked, ...props }: CheckboxProps) {
  const generated = useId()
  const boxId = id ?? generated
  return (
    <div className={cn('flex gap-2.5', className)}>
      <span className="relative mt-0.5 inline-flex size-[18px] shrink-0">
        <input
          id={boxId}
          type="checkbox"
          checked={checked}
          className="peer size-[18px] cursor-pointer appearance-none rounded border-[1.5px] border-line2 bg-transparent checked:border-lime checked:bg-lime"
          {...props}
        />
        <Check
          className="pointer-events-none absolute inset-0 m-auto size-3 text-on-lime opacity-0 peer-checked:opacity-100"
          aria-hidden
        />
      </span>
      <label htmlFor={boxId} className="cursor-pointer text-xs leading-relaxed text-tx2">
        {label}
      </label>
    </div>
  )
}

export interface SwitchProps {
  checked: boolean
  onChange?: (checked: boolean) => void
  label?: ReactNode
  disabled?: boolean
  className?: string
}

export function Switch({ checked, onChange, label, disabled, className }: SwitchProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={typeof label === 'string' ? label : 'Toggle'}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          'relative h-5 w-[34px] shrink-0 rounded-full transition-colors disabled:opacity-50',
          checked ? 'bg-lime' : 'bg-line2',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-4 rounded-full transition-all',
            checked ? 'right-0.5 bg-on-lime' : 'left-0.5 bg-tx2',
          )}
        />
      </button>
      {label && <span className="text-xs text-tx2">{label}</span>}
    </div>
  )
}
