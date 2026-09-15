import type { Metadata } from 'next'
import { PLANS } from '@tw/shared'
import { mock } from '@tw/shared/mocks'
import { agencyOr, currentUser, myAgencies, usageFor } from '@/lib/mock/app'
import { Shell } from './shell-client'

/**
 * Every signed in screen. docs/15-frontend-spec.md 3.0.
 *
 * Onboarding is not in this group: it has no sidebar, because a person who has
 * not finished setting up has nowhere useful to navigate to yet.
 */

export const metadata: Metadata = {
  title: { default: 'Tidywright', template: '%s | Tidywright' },
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const agencies = myAgencies()
  const current = agencyOr(undefined)
  const usage = usageFor(current.id)

  const newLeads = mock.leads.filter(
    (l) => l.agencyId === current.id && l.status === 'new' && l.firstViewedAt === null,
  ).length

  return (
    <Shell
      agencies={agencies.map((a) => ({ id: a.id, name: a.name, plan: a.plan }))}
      user={currentUser()}
      newLeads={newLeads}
      plan={PLANS[current.plan].name}
      usage={usage ? { used: usage.used, limit: usage.limit } : undefined}
    >
      {children}
    </Shell>
  )
}
