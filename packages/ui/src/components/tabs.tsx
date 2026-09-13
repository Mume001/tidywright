'use client'

import { cn } from '../lib/cn'

export interface TabsProps<T extends string> {
  tabs: readonly { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export function Tabs<T extends string>({ tabs, value, onChange, className }: TabsProps<T>) {
  return (
    <div className={cn('flex gap-0.5 border-b border-line', className)} role="tablist">
      {tabs.map((tab) => {
        const active = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              'border-b-2 px-3.5 py-2.5 text-[12.5px] font-semibold transition-colors',
              active ? 'border-lime text-tx' : 'border-transparent text-tx2 hover:text-tx',
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
