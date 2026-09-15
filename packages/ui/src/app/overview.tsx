import { ArrowRight, Code2, Globe, Inbox, Rocket, Share2 } from 'lucide-react'
import { scoreBand } from '../lib/score'
import { Badge } from '../components/badge'
import { Button, ButtonLink } from '../components/button'
import { Card, CardBody, CardHeader } from '../components/card'
import { EmptyState } from '../components/empty-state'
import { KpiCard } from '../components/kpi-card'
import { Skeleton, SkeletonTable } from '../components/skeleton'
import { BarChart, Sparkline } from '../components/sparkline'

export interface OverviewKpi {
  label: string
  value: number
  delta: number
  spark: readonly number[]
}

export interface OverviewLead {
  id: string
  email: string
  host: string
  score: number | null
  ago: string
  href: string
}

export interface OverviewProps {
  kpis: readonly OverviewKpi[]
  chart: readonly { day: string; value: number }[]
  leads: readonly OverviewLead[]
  /** Hosts an audit has actually arrived from. Empty means not installed yet. */
  installedHosts: readonly string[]
  usage?: { used: number; limit: number; plan: string }
  /** Only while the agency is one of the five pilots. */
  pilot?: { auditsThisMonth: number; leadRate: number; ctaRate: number }
}

/**
 * docs/15-frontend-spec.md 3.3.
 *
 * The order answers three questions in the order an agency asks them: is it
 * working, who came in, and is the widget actually on the site. The last one is
 * third because it only matters when one of the first two looks wrong.
 */
export function Overview({ kpis, chart, leads, installedHosts, usage, pilot }: OverviewProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value.toLocaleString('en-US')}
            delta={{ value: kpi.delta }}
            sub={<Sparkline values={kpi.spark} fill className="ml-auto" />}
          />
        ))}
      </div>

      {usage && (
        <p className="text-[13px] text-tx2">
          <span className="font-semibold text-tx">{usage.plan} plan:</span> {usage.used} of{' '}
          {usage.limit} audits used this month.{' '}
          <a href="/billing" className="text-lime underline-offset-2 hover:underline">
            See plans
          </a>
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader
              title="Audits, last 30 days"
              aside={<span className="text-[11px] text-tx2">{sum(chart)} total</span>}
            />
            <CardBody>
              <BarChart values={chart} label="Audits per day over the last 30 days" />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Recent leads"
              aside={
                <ButtonLink href="/leads" size="sm" variant="ghost">
                  All leads <ArrowRight className="size-3.5" aria-hidden />
                </ButtonLink>
              }
            />
            {leads.length === 0 ? (
              <EmptyState
                icon={<Inbox className="size-5" aria-hidden />}
                title="No leads yet"
                description="When somebody runs an audit from your site, they land here with their address and their score."
              />
            ) : (
              <ul className="divide-y divide-line">
                {leads.map((lead) => (
                  <li key={lead.id}>
                    <a
                      href={lead.href}
                      className="flex items-center gap-3 px-4.5 py-3 transition-colors hover:bg-panel2"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-tx">
                          {lead.email}
                        </span>
                        <span className="block truncate text-[12px] text-tx2">{lead.host}</span>
                      </span>
                      {lead.score !== null && (
                        <Badge tone={scoreBand(lead.score)}>{lead.score}</Badge>
                      )}
                      <span className="tabular w-16 shrink-0 text-right text-[12px] text-tx2">
                        {lead.ago}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Your widget" />
            <CardBody className="space-y-3">
              {installedHosts.length > 0 ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-score-good" aria-hidden />
                    <span className="text-[13px] font-semibold text-tx">
                      Live on {installedHosts.length}{' '}
                      {installedHosts.length === 1 ? 'site' : 'sites'}
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {installedHosts.map((host) => (
                      <li key={host} className="flex items-center gap-2 text-[12px] text-tx2">
                        <Globe className="size-3.5 shrink-0 text-tx3" aria-hidden />
                        <span className="truncate">{host}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-score-mid" aria-hidden />
                  <span className="text-[13px] font-semibold text-tx">Not installed yet</span>
                </div>
              )}
              <ButtonLink href="/embed" size="sm" variant="secondary" full>
                <Code2 className="size-3.5" aria-hidden /> Embed code
              </ButtonLink>
            </CardBody>
          </Card>

          {pilot && (
            <Card>
              <CardHeader title="Pilot numbers" aside={<Badge tone="info">pilot</Badge>} />
              <CardBody className="space-y-3">
                <p className="text-[12px] leading-relaxed text-tx2">
                  The three numbers nobody in this category publishes. Yours, so far.
                </p>
                <PilotRow label="Audits this month" value={pilot.auditsThisMonth.toString()} />
                <PilotRow label="Left an email" value={`${pilot.leadRate}%`} />
                <PilotRow label="Clicked your call to action" value={`${pilot.ctaRate}%`} />
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function PilotRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-[12px] text-tx2">{label}</span>
      <span className="tabular ml-auto font-display text-sm font-semibold text-tx">{value}</span>
    </div>
  )
}

function sum(points: readonly { value: number }[]): number {
  return points.reduce((total, p) => total + p.value, 0)
}

export interface OverviewEmptyProps {
  embedHref?: string
  formHref: string
  steps: { code: boolean; tested: boolean; shared: boolean }
}

/**
 * First run. Not an apology for having no data, but the three things that
 * produce data, with the ones already done ticked off.
 */
export function OverviewEmpty({ embedHref = '/embed', formHref, steps }: OverviewEmptyProps) {
  const items = [
    {
      done: steps.code,
      title: 'Add the code to your site',
      body: 'One script tag and one div, anywhere a visitor can reach.',
      action: (
        <ButtonLink href={embedHref} size="sm">
          Get the code
        </ButtonLink>
      ),
      icon: Code2,
    },
    {
      done: steps.tested,
      title: 'Run one audit yourself',
      body: 'On your own site, so you see exactly what a visitor sees.',
      action: (
        <ButtonLink href={formHref} size="sm" variant="secondary" target="_blank" rel="noreferrer">
          Open your form
        </ButtonLink>
      ),
      icon: Rocket,
    },
    {
      done: steps.shared,
      title: 'Put it where people land',
      body: 'A service page or the footer beats a page nobody visits.',
      action: null,
      icon: Share2,
    },
  ]

  return (
    <Card>
      <CardHeader title="Waiting for your first audit" />
      <CardBody className="space-y-1">
        {items.map((item, index) => {
          const Icon = item.icon
          return (
            <div
              key={item.title}
              className="flex items-start gap-3.5 rounded-lg px-1 py-3.5 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-line"
            >
              <span
                className={
                  item.done
                    ? 'grid size-8 shrink-0 place-items-center rounded-lg bg-lime text-on-lime'
                    : 'grid size-8 shrink-0 place-items-center rounded-lg bg-raise text-tx3'
                }
              >
                {item.done ? '✓' : <Icon className="size-4" aria-hidden />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-tx">
                  {index + 1}. {item.title}
                </div>
                <p className="mt-0.5 text-[12px] text-tx2">{item.body}</p>
              </div>
              {!item.done && item.action}
            </div>
          )
        })}
      </CardBody>
    </Card>
  )
}

/** Skeleton for the whole screen, so nothing jumps when the numbers land. */
export function OverviewSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Card key={i} className="p-4.5">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="mt-3 h-8 w-16" />
            <Skeleton className="mt-3 h-3 w-24" />
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader title="Audits, last 30 days" />
            <CardBody>
              <Skeleton className="h-[120px] w-full" />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Recent leads" />
            <CardBody>
              <SkeletonTable rows={5} />
            </CardBody>
          </Card>
        </div>
        <Card>
          <CardHeader title="Your widget" />
          <CardBody className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-full" />
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

/**
 * Something broke. The request id is the only thing support can act on, so it
 * is on screen and selectable rather than in a console nobody opens.
 */
export function ScreenError({
  title = 'We could not load this',
  requestId,
  onRetry,
}: {
  title?: string
  requestId?: string
  onRetry?: () => void
}) {
  return (
    <Card>
      <EmptyState
        title={title}
        description={
          <>
            Nothing is lost. Try again, and if it keeps happening send us the reference below.
            {requestId && (
              <span className="mt-3 block font-mono text-[11px] text-tx2">{requestId}</span>
            )}
          </>
        }
        action={
          onRetry ? (
            <Button variant="secondary" onClick={onRetry}>
              Try again
            </Button>
          ) : undefined
        }
      />
    </Card>
  )
}
