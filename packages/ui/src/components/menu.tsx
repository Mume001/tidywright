'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '../lib/cn'

export interface MenuItem {
  label: string
  icon?: ReactNode
  onSelect?: () => void
  href?: string
  /** A thin line above this item, for signing out and the like. */
  separated?: boolean
  danger?: boolean
  /** A tick on the right, for a picker where one option is current. */
  selected?: boolean
}

export interface MenuProps {
  trigger: (props: { open: boolean }) => ReactNode
  items: MenuItem[]
  /** Which edge the panel lines up with. */
  align?: 'left' | 'right'
  label: string
  className?: string
  panelClassName?: string
}

/**
 * A dropdown small enough to own. Escape closes, a click outside closes, focus
 * goes back to the trigger, and arrow keys walk the items.
 *
 * Written rather than installed because the two menus in the app, the agency
 * picker and the avatar, are the only ones phase 1 has. When a third arrives
 * with different behaviour this becomes a real library.
 */
export function Menu({
  trigger,
  items,
  align = 'left',
  label,
  className,
  panelClassName,
}: MenuProps) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActive((i) => (i + 1) % items.length)
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActive((i) => (i - 1 + items.length) % items.length)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, items.length])

  return (
    <div ref={root} className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => {
          setOpen((v) => !v)
          setActive(0)
        }}
        className="flex items-center rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
      >
        {trigger({ open })}
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            'absolute z-50 mt-1.5 min-w-52 rounded-[var(--radius-card)] border border-line2 bg-panel p-1 shadow-[0_16px_40px_rgba(0,0,0,0.45)]',
            align === 'right' ? 'right-0' : 'left-0',
            panelClassName,
          )}
        >
          {items.map((item, index) => {
            const content = (
              <>
                {item.icon}
                <span className="truncate">{item.label}</span>
                {item.selected && <span className="ml-auto text-lime">✓</span>}
              </>
            )
            const classes = cn(
              'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] transition-colors',
              item.danger
                ? 'text-coral hover:bg-coral/10'
                : 'text-tx2 hover:bg-panel2 hover:text-tx',
              index === active && (item.danger ? 'bg-coral/10' : 'bg-panel2 text-tx'),
              item.separated && 'mt-1 border-t border-line pt-2.5',
            )

            return item.href ? (
              <a
                key={item.label}
                role="menuitem"
                href={item.href}
                className={classes}
                onMouseEnter={() => setActive(index)}
                onClick={() => setOpen(false)}
              >
                {content}
              </a>
            ) : (
              <button
                key={item.label}
                role="menuitem"
                type="button"
                className={classes}
                onMouseEnter={() => setActive(index)}
                onClick={() => {
                  item.onSelect?.()
                  setOpen(false)
                }}
              >
                {content}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
