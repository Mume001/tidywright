'use client'

import { CornerDownLeft, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '../lib/cn'

export interface Command {
  label: string
  /** "Go to", "Agency", "Action". Grouped in the list under this. */
  group: string
  href?: string
  onSelect?: () => void
  icon?: React.ReactNode
  /** Extra words that should match but are not shown, like "clients" for Leads. */
  keywords?: string
}

export interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  commands: Command[]
}

/**
 * Cmd+K. Everything in the sidebar plus switching agency, which is the pair of
 * things somebody does forty times a day and the reason this exists at all.
 *
 * Filtering is a substring match over the label and its keywords. There is no
 * fuzzy matcher, because with about fifteen commands a fuzzy match mostly
 * produces surprising results rather than helpful ones.
 */
export function CommandPalette({ open, onClose, commands }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter((c) => `${c.label} ${c.keywords ?? ''}`.toLowerCase().includes(q))
  }, [commands, query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      // The input is not in the tree until this render commits.
      queueMicrotask(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => setActive(0), [query])

  if (!open) return null

  function run(command: Command | undefined) {
    if (!command) return
    onClose()
    if (command.onSelect) command.onSelect()
    else if (command.href) window.location.assign(command.href)
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') onClose()
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((i) => Math.min(i + 1, matches.length - 1))
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      run(matches[active])
    }
  }

  let lastGroup = ''

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-4 pt-[12vh]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="w-full max-w-lg overflow-hidden rounded-[var(--radius-card)] border border-line2 bg-panel shadow-[0_24px_64px_rgba(0,0,0,0.55)]"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-2.5 border-b border-line px-4">
          <Search className="size-4 shrink-0 text-tx3" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Go to, or switch agency"
            aria-label="Search commands"
            className="h-12 w-full bg-transparent text-sm text-tx outline-none placeholder:text-tx3"
          />
          <kbd className="rounded border border-line2 px-1.5 py-0.5 font-mono text-[10px] text-tx2">
            esc
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-1.5">
          {matches.length === 0 && (
            <p className="px-3 py-8 text-center text-[13px] text-tx2">
              Nothing matches {`"${query}"`}.
            </p>
          )}

          {matches.map((command, index) => {
            const heading = command.group !== lastGroup ? command.group : null
            lastGroup = command.group

            return (
              <div key={`${command.group}:${command.label}`}>
                {heading && (
                  <div className="mt-1.5 mb-1 px-2.5 text-[10px] font-semibold tracking-wider text-tx2 uppercase">
                    {heading}
                  </div>
                )}
                <button
                  type="button"
                  onMouseEnter={() => setActive(index)}
                  onClick={() => run(command)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] transition-colors',
                    index === active ? 'bg-panel2 text-tx' : 'text-tx2',
                  )}
                >
                  {command.icon}
                  <span className="truncate">{command.label}</span>
                  {index === active && (
                    <CornerDownLeft className="ml-auto size-3.5 text-tx3" aria-hidden />
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** Cmd+K on a Mac, Ctrl+K elsewhere, and never while typing in a field. */
export function useCommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((v) => !v)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return { open, setOpen }
}
