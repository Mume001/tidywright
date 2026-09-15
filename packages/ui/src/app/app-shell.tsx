'use client'

import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '../lib/cn'
import { CommandPalette, useCommandPalette, type Command } from './command-palette'
import { Sidebar, type NavGroup } from './sidebar'
import { TopBar, type TopBarAgency } from './top-bar'

export interface AppShellProps {
  pathname: string
  agencies: TopBarAgency[]
  currentAgencyId: string
  user: { email: string; fullName?: string | null }
  nav?: NavGroup[]
  sidebarFooter?: React.ReactNode
  commands?: Command[]
  unreadNotifications?: number
  onSelectAgency?: (id: string) => void
  onSignOut?: () => void
  children: React.ReactNode
}

/**
 * Sidebar, top bar, and the page. docs/15-frontend-spec.md 3.0.
 *
 * Below lg the sidebar is a drawer rather than a squeezed column. An agency
 * checking leads on a phone between meetings is a real thing, and 240 px of
 * permanent navigation on a 390 px screen leaves 150 px of content.
 */
export function AppShell({
  pathname,
  agencies,
  currentAgencyId,
  user,
  nav,
  sidebarFooter,
  commands = [],
  unreadNotifications,
  onSelectAgency,
  onSignOut,
  children,
}: AppShellProps) {
  const [drawer, setDrawer] = useState(false)
  const palette = useCommandPalette()

  // A route change has to close the drawer, or the next page opens behind it.
  useEffect(() => setDrawer(false), [pathname])

  return (
    <div className="flex min-h-screen bg-bg text-tx">
      <aside className="hidden w-60 shrink-0 border-r border-line lg:block">
        <div className="sticky top-0 h-screen">
          <Sidebar pathname={pathname} groups={nav} footer={sidebarFooter} />
        </div>
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setDrawer(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 w-64 border-r border-line bg-bg">
            <button
              type="button"
              onClick={() => setDrawer(false)}
              aria-label="Close navigation"
              className="absolute top-3.5 right-3 rounded-lg p-1.5 text-tx3 hover:bg-panel hover:text-tx"
            >
              <X className="size-5" aria-hidden />
            </button>
            <Sidebar
              pathname={pathname}
              groups={nav}
              footer={sidebarFooter}
              onNavigate={() => setDrawer(false)}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          agencies={agencies}
          currentAgencyId={currentAgencyId}
          onSelectAgency={onSelectAgency}
          user={user}
          unreadNotifications={unreadNotifications}
          onOpenSearch={() => palette.setOpen(true)}
          onOpenNav={() => setDrawer(true)}
          onSignOut={onSignOut}
        />
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <CommandPalette
        open={palette.open}
        onClose={() => palette.setOpen(false)}
        commands={commands}
      />
    </div>
  )
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap items-start gap-3 pb-5', className)}>
      <div className="min-w-0">
        <h1 className="font-display text-xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-[13px] text-tx2">{description}</p>}
      </div>
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </div>
  )
}

/** Every page body sits in this, so the gutters are decided once. */
export function PageBody({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={cn('mx-auto max-w-6xl px-4 py-6 sm:px-6', className)}>{children}</div>
}
