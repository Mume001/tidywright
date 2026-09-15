'use client'

import {
  Building2,
  Code2,
  CreditCard,
  LayoutDashboard,
  type LucideIcon,
  Palette,
  ScrollText,
  Settings,
  Users,
  UsersRound,
} from 'lucide-react'
import { cn } from '../lib/cn'
import type { Command } from './command-palette'
import { Wordmark } from './logo'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  /** Rendered as a pill on the right. Omitted at zero, never shown as "0". */
  count?: number
  /** Phase 2 screens exist and are reachable, but say so. */
  soon?: boolean
}

export interface NavGroup {
  /** Undefined for the first group, which carries no heading. */
  label?: string
  items: NavItem[]
}

/**
 * Phase 1 navigation, docs/15-frontend-spec.md 3.0. Phase 3 inserts a SITES
 * group above WIDGET, which is why the shape is groups and not a flat list.
 */
export function navigation(counts: { leads?: number } = {}): NavGroup[] {
  return [
    { items: [{ label: 'Overview', href: '/overview', icon: LayoutDashboard }] },
    {
      label: 'Widget',
      items: [
        { label: 'Leads', href: '/leads', icon: Users, count: counts.leads },
        { label: 'Audits', href: '/audits', icon: ScrollText },
        { label: 'Embed code', href: '/embed', icon: Code2 },
        { label: 'Branding', href: '/branding', icon: Palette },
      ],
    },
    {
      label: 'Account',
      items: [
        { label: 'Billing', href: '/billing', icon: CreditCard, soon: true },
        { label: 'Team', href: '/team', icon: UsersRound, soon: true },
        { label: 'Settings', href: '/settings', icon: Settings },
      ],
    },
  ]
}

export interface SidebarProps {
  /** Current path, so the active item is the caller's business and not ours. */
  pathname: string
  groups?: NavGroup[]
  /** Rendered under the nav: the usage meter on a free plan. */
  footer?: React.ReactNode
  className?: string
  onNavigate?: () => void
}

export function Sidebar({ pathname, groups, footer, className, onNavigate }: SidebarProps) {
  const nav = groups ?? navigation()

  return (
    <div className={cn('flex h-full flex-col bg-bg', className)}>
      <div className="flex h-14 items-center px-4">
        <Wordmark />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Main">
        {nav.map((group, index) => (
          <div key={group.label ?? index} className={index === 0 ? '' : 'mt-6'}>
            {group.label && (
              <div className="mb-1.5 px-2.5 text-[10px] font-semibold tracking-wider text-tx2 uppercase">
                {group.label}
              </div>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors',
                        active
                          ? 'bg-panel2 font-semibold text-tx'
                          : 'text-tx2 hover:bg-panel hover:text-tx',
                      )}
                    >
                      <Icon className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
                      <span className="truncate">{item.label}</span>
                      {item.count !== undefined && item.count > 0 && (
                        <span className="tabular ml-auto rounded-full bg-lime px-1.5 py-0.5 text-[10px] font-bold text-on-lime">
                          {item.count}
                        </span>
                      )}
                      {item.soon && !item.count && (
                        <span className="ml-auto text-[10px] text-tx2">soon</span>
                      )}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {footer && <div className="border-t border-line p-3">{footer}</div>}
    </div>
  )
}

/**
 * What Cmd+K offers: everywhere the sidebar goes, plus switching agency. Built
 * here rather than in the app so the two lists cannot fall out of step, and so
 * the app needs no icon library of its own.
 */
export function appCommands(options: {
  agencies?: { id: string; name: string }[]
  onSelectAgency?: (id: string) => void
  groups?: NavGroup[]
}): Command[] {
  const nav = options.groups ?? navigation()
  const keywords: Record<string, string> = {
    '/leads': 'clients contacts inbox',
    '/audits': 'reports scans',
    '/embed': 'script snippet install widget code',
    '/branding': 'logo colour color white label',
    '/settings': 'account notifications retention',
  }

  const goTo: Command[] = nav.flatMap((group) =>
    group.items.map((item) => {
      const Icon = item.icon
      return {
        label: item.label,
        group: 'Go to',
        href: item.href,
        keywords: keywords[item.href],
        icon: <Icon className="size-4" aria-hidden />,
      }
    }),
  )

  const switchAgency: Command[] = (options.agencies ?? []).map((agency) => ({
    label: agency.name,
    group: 'Switch agency',
    icon: <Building2 className="size-4" aria-hidden />,
    onSelect: () => options.onSelectAgency?.(agency.id),
  }))

  return [...goTo, ...switchAgency]
}
