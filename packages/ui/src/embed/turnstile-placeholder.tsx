'use client'

import { Check } from 'lucide-react'
import { useId } from 'react'
import { cn } from '../lib/cn'

export interface TurnstilePlaceholderProps {
  token: string | null
  onChange: (token: string | null) => void
  error?: string
  disabled?: boolean
}

/**
 * Where Cloudflare Turnstile goes in B4.
 *
 * It is a real checkbox rather than a picture of one, for two reasons: the form
 * has to reserve the height the widget will take so nothing jumps when the real
 * one arrives, and turnstile_failed has to be reachable from the test page
 * without editing code.
 */
export function TurnstilePlaceholder({
  token,
  onChange,
  error,
  disabled,
}: TurnstilePlaceholderProps) {
  const id = useId()
  const solved = token !== null

  return (
    <div className="mb-3.5">
      <button
        type="button"
        id={id}
        role="checkbox"
        aria-checked={solved}
        aria-describedby={error ? `${id}-error` : undefined}
        disabled={disabled}
        onClick={() => onChange(solved ? null : 'mock-turnstile-token')}
        className={cn(
          'flex h-11 w-full items-center gap-2.5 rounded-[var(--radius-field)] border bg-panel px-3 text-left transition-colors disabled:opacity-50',
          error ? 'border-score-bad' : 'border-line hover:border-line2',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'grid size-[18px] shrink-0 place-items-center rounded border-[1.5px]',
            solved ? 'border-score-good bg-score-good text-bg' : 'border-line2',
          )}
        >
          {solved && <Check className="size-3" strokeWidth={3} />}
        </span>
        <span className="text-[13px] text-tx2">{solved ? 'Verified' : 'Verify you are human'}</span>
        <span className="ml-auto text-[10px] text-tx3">Cloudflare</span>
      </button>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-score-bad" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
