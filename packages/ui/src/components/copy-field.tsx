'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Button } from './button'
import { cn } from '../lib/cn'

export interface CopyFieldProps {
  value: string
  /** Shown instead of the raw value, for example a masked key. */
  display?: string
  label?: string
  className?: string
}

/** Read-only value with a copy button. Used for embed keys, links and snippets. */
export function CopyField({ value, display, label, className }: CopyFieldProps) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard can be blocked. The value is selectable, so the user can still copy it.
    }
  }

  return (
    <div className={className}>
      {label && <div className="mb-1.5 text-xs font-semibold text-tx2">{label}</div>}
      <div className="flex items-center gap-2">
        <code className="flex h-9 min-w-0 flex-1 items-center overflow-hidden rounded-[var(--radius-field)] border border-line2 bg-raise px-3 font-mono text-[12.5px] text-tx2">
          <span className="truncate">{display ?? value}</span>
        </code>
        <Button
          variant="secondary"
          size="md"
          onClick={copy}
          icon={copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          aria-label={copied ? 'Copied' : 'Copy to clipboard'}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </div>
  )
}

export function CodeBlock({
  code,
  className,
  copyable = true,
}: {
  code: string
  className?: string
  copyable?: boolean
}) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* blocked clipboard, the text is selectable */
    }
  }
  return (
    <div className={cn('relative', className)}>
      {/*
        Focusable, because it scrolls sideways. A region a mouse can scroll and
        a keyboard cannot is a WCAG 2.1.1 failure, and a long embed snippet
        always scrolls. Found by axe on the onboarding embed step.
      */}
      <pre
        tabIndex={0}
        role="region"
        aria-label="Code"
        className="overflow-x-auto rounded-[var(--radius-card)] border border-line bg-bg p-4 font-mono text-[12.5px] leading-relaxed text-tx2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
      >
        {code}
      </pre>
      {copyable && (
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-2.5 right-2.5"
          onClick={copy}
          icon={copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      )}
    </div>
  )
}
