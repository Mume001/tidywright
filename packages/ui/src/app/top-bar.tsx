'use client'

import {
  Bell,
  Building2,
  ChevronsUpDown,
  LogOut,
  Menu as MenuIcon,
  Search,
  Settings,
} from 'lucide-react'
import { cn } from '../lib/cn'
import { AgencyMark } from '../components/agency-mark'
import { Menu } from '../components/menu'

export interface TopBarAgency {
  id: string
  name: string
  plan: string
}

export interface TopBarProps {
  agencies: TopBarAgency[]
  currentAgencyId: string
  onSelectAgency?: (id: string) => void
  user: { email: string; fullName?: string | null }
  unreadNotifications?: number
  /** Opens the command palette. The keyboard route is handled by the shell. */
  onOpenSearch?: () => void
  /** Only rendered below lg, where the sidebar is a drawer. */
  onOpenNav?: () => void
  onSignOut?: () => void
  className?: string
}

/**
 * Agency on the left, because on this screen "which client am I looking at" is
 * the question that invalidates everything else if you get it wrong. An agency
 * with one client still sees the picker, so the habit is formed before the
 * second one arrives.
 */
export function TopBar({
  agencies,
  currentAgencyId,
  onSelectAgency,
  user,
  unreadNotifications = 0,
  onOpenSearch,
  onOpenNav,
  onSignOut,
  className,
}: TopBarProps) {
  const current = agencies.find((a) => a.id === currentAgencyId) ?? agencies[0]
  const initials = (user.fullName ?? user.email).slice(0, 1).toUpperCase()

  return (
    <header
      className={cn(
        'flex h-14 items-center gap-2 border-b border-line bg-bg px-3 sm:px-4',
        className,
      )}
    >
      {onOpenNav && (
        <button
          type="button"
          onClick={onOpenNav}
          aria-label="Open navigation"
          className="-ml-1 rounded-lg p-2 text-tx2 hover:bg-panel hover:text-tx lg:hidden"
        >
          <MenuIcon className="size-5" strokeWidth={1.75} aria-hidden />
        </button>
      )}

      {current && (
        <Menu
          label="Switch agency"
          items={agencies.map((agency) => ({
            label: agency.name,
            icon: <Building2 className="size-4" aria-hidden />,
            selected: agency.id === currentAgencyId,
            onSelect: () => onSelectAgency?.(agency.id),
          }))}
          trigger={() => (
            <span className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-panel">
              <AgencyMark name={current.name} size={22} />
              <span className="max-w-40 truncate text-[13px] font-semibold text-tx sm:max-w-none">
                {current.name}
              </span>
              <ChevronsUpDown className="size-3.5 text-tx3" aria-hidden />
            </span>
          )}
        />
      )}

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenSearch}
          className="hidden items-center gap-2 rounded-lg border border-line2 bg-raise px-2.5 py-1.5 text-[12px] text-tx2 transition-colors hover:text-tx sm:flex"
        >
          <Search className="size-3.5" aria-hidden />
          Search
          <kbd className="ml-6 rounded border border-line2 px-1 font-mono text-[10px]">⌘K</kbd>
        </button>

        <button
          type="button"
          aria-label={
            unreadNotifications > 0
              ? `Notifications, ${unreadNotifications} unread`
              : 'Notifications'
          }
          className="relative rounded-lg p-2 text-tx2 transition-colors hover:bg-panel hover:text-tx"
        >
          <Bell className="size-5" strokeWidth={1.75} aria-hidden />
          {unreadNotifications > 0 && (
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-lime" />
          )}
        </button>

        <Menu
          label="Account"
          align="right"
          items={[
            { label: 'Settings', href: '/settings', icon: <Settings className="size-4" /> },
            { label: 'Docs', href: '/docs', icon: <Search className="size-4" /> },
            {
              label: 'Sign out',
              icon: <LogOut className="size-4" />,
              separated: true,
              onSelect: onSignOut,
            },
          ]}
          trigger={() => (
            <span className="ml-1 flex size-8 items-center justify-center rounded-full bg-panel2 text-[12px] font-semibold text-tx">
              {initials}
            </span>
          )}
        />
      </div>
    </header>
  )
}
