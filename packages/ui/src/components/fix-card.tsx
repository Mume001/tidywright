'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import type { Fix } from '@tw/shared'
import { cn } from '../lib/cn'
import { SeverityBadge } from './badge'
import { Button } from './button'

/**
 * The thing the whole product is about. Before on the left, suggested on the right,
 * and the reasons underneath in words a business owner understands.
 *
 * Works in both themes: the app shows it inside an audit, the report shows it to
 * the visitor on the agency's white page.
 */
export interface FixCardProps {
  fix: Fix
  /** Reported so the pilot can count which fixes people actually take. */
  onCopy?: (kind: Fix['kind']) => void
}

export function FixCard({ fix, onCopy }: FixCardProps) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(fix.after)
      setCopied(true)
      onCopy?.(fix.kind)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* blocked clipboard, the text is selectable */
    }
  }

  return (
    <article className="mb-3.5 rounded-[var(--radius-card)] border border-line bg-panel p-5">
      <div className="flex items-center gap-2.5">
        <SeverityBadge severity={fix.severity} />
        <h3 className="font-display text-[15px] font-bold">{fix.label}</h3>
        <Button
          variant="secondary"
          size="sm"
          className="ml-auto"
          onClick={copy}
          icon={copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>

      <div className="mt-3.5 grid gap-3.5 md:grid-cols-2">
        <div>
          <div className="text-[10.5px] font-bold tracking-wider text-tx3 uppercase">Now</div>
          <p className="mt-1.5 rounded-lg bg-score-bad/10 p-3 font-mono text-[12.5px] leading-relaxed break-words text-tx2">
            {fix.before ?? <span className="text-tx3 italic">(missing)</span>}
          </p>
        </div>
        <div>
          <div className="text-[10.5px] font-bold tracking-wider text-score-good uppercase">
            Suggested
          </div>
          <p
            className={cn(
              'mt-1.5 rounded-lg bg-score-good/10 p-3 font-mono text-[12.5px] leading-relaxed break-words text-tx2',
              // A JSON-LD block is pasted verbatim, so its line breaks are part of the answer.
              fix.kind === 'jsonld' && 'overflow-x-auto whitespace-pre',
            )}
          >
            {fix.after}
          </p>
        </div>
      </div>

      <ul className="mt-3 list-disc space-y-1 pl-5 text-[12.5px] leading-relaxed text-tx2">
        {fix.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
    </article>
  )
}
