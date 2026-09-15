import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { useId } from 'react'
import { cn } from '../lib/cn'

interface FieldShellProps {
  label?: string
  hint?: string
  error?: string
  /** Shown at the right of the label row, for example a character counter. */
  aside?: ReactNode
  htmlFor: string
  children: ReactNode
}

function FieldShell({ label, hint, error, aside, htmlFor, children }: FieldShellProps) {
  return (
    <div className="mb-3.5">
      {(label || aside) && (
        <div className="mb-1.5 flex items-baseline gap-2">
          {label && (
            <label htmlFor={htmlFor} className="text-xs font-semibold text-tx2">
              {label}
            </label>
          )}
          {aside && <span className="ml-auto text-[11px] text-tx2">{aside}</span>}
        </div>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-coral" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-tx2">{hint}</p>
      ) : null}
    </div>
  )
}

const fieldBase =
  'w-full rounded-[var(--radius-field)] border bg-raise px-3 text-[13px] text-tx placeholder:text-tx3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  hint?: string
  error?: string
  aside?: ReactNode
  /** Static text glued to the left, for example https://. */
  prefix?: string
}

export function Input({ label, hint, error, aside, prefix, className, id, ...props }: InputProps) {
  const generated = useId()
  const inputId = id ?? generated
  return (
    <FieldShell label={label} hint={hint} error={error} aside={aside} htmlFor={inputId}>
      <div className="flex items-stretch">
        {prefix && (
          <span className="flex items-center rounded-l-[var(--radius-field)] border border-r-0 border-line2 bg-panel2 px-3 text-[13px] text-tx2">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          className={cn(
            fieldBase,
            'h-9',
            error ? 'border-coral' : 'border-line2 focus:border-lime',
            prefix && 'rounded-l-none',
            className,
          )}
          {...props}
        />
      </div>
    </FieldShell>
  )
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
  aside?: ReactNode
}

export function Textarea({ label, hint, error, aside, className, id, ...props }: TextareaProps) {
  const generated = useId()
  const areaId = id ?? generated
  return (
    <FieldShell label={label} hint={hint} error={error} aside={aside} htmlFor={areaId}>
      <textarea
        id={areaId}
        aria-invalid={error ? true : undefined}
        className={cn(
          fieldBase,
          'min-h-20 resize-y py-2 leading-relaxed',
          error ? 'border-coral' : 'border-line2 focus:border-lime',
          className,
        )}
        {...props}
      />
    </FieldShell>
  )
}
