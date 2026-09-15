'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { AppShell, Badge, appCommands, navigation, type TopBarAgency } from '@tw/ui'

/**
 * The shell, client side, because the sidebar drawer, the agency picker and the
 * command palette all hold state.
 *
 * The agency lives in component state in F2 and in the session in B1. The
 * important part now is that every screen reads it from one place, so moving it
 * is one file.
 */
export function Shell({
  agencies,
  user,
  newLeads,
  plan,
  usage,
  children,
}: {
  agencies: TopBarAgency[]
  user: { email: string; fullName?: string | null }
  newLeads: number
  plan: string
  usage?: { used: number; limit: number }
  children: React.ReactNode
}) {
  const pathname = usePathname() ?? '/overview'
  const [currentAgencyId, setCurrentAgencyId] = useState(agencies[0]?.id ?? '')
  const nav = navigation({ leads: newLeads })

  return (
    <AppShell
      pathname={pathname}
      agencies={agencies}
      currentAgencyId={currentAgencyId}
      onSelectAgency={setCurrentAgencyId}
      user={user}
      nav={nav}
      commands={appCommands({ agencies, onSelectAgency: setCurrentAgencyId, groups: nav })}
      unreadNotifications={newLeads}
      sidebarFooter={<PlanFooter plan={plan} usage={usage} />}
    >
      {children}
    </AppShell>
  )
}

/** The usage meter, which only a free plan has a reason to look at. */
function PlanFooter({ plan, usage }: { plan: string; usage?: { used: number; limit: number } }) {
  if (!usage) return <Badge tone="neutral">{plan}</Badge>

  const share = Math.min(100, (usage.used / usage.limit) * 100)

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <Badge tone={share > 80 ? 'mid' : 'neutral'}>{plan}</Badge>
        <span className="tabular ml-auto text-[11px] text-tx3">
          {usage.used} / {usage.limit}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-raise">
        <div className="h-full rounded-full bg-lime" style={{ width: `${share}%` }} />
      </div>
    </div>
  )
}
