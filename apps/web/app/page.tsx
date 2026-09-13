import { Badge, Button, Card, CardBody, CardHeader, ScoreRing } from '@tw/ui'
import { PLANS, PLAN_ORDER, formatPrice, CHECKS } from '@tw/shared'

/**
 * F0 landing. Not the marketing page, that arrives in F3. This exists so the
 * toolchain is provably wired end to end: tokens, components and shared data all
 * render in one place.
 */
export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex items-center gap-3">
        <div className="flex size-7 items-center justify-center rounded-lg bg-lime text-on-lime">
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.7 6.3a4.5 4.5 0 0 0 5.9 5.9l-8.4 8.4a2.1 2.1 0 0 1-3-3z" />
          </svg>
        </div>
        <span className="font-display text-lg font-bold tracking-tight">Tidywright</span>
        <Badge tone="info">F0</Badge>
      </div>

      <h1 className="mt-8 font-display text-4xl font-bold tracking-tight">The toolchain is up.</h1>
      <p className="mt-3 max-w-xl text-tx2">
        Design tokens, the component library and the shared domain data all render from one place.
        Screens arrive in F1. See <code className="font-mono text-lime">docs/31-build-plan.md</code>
        .
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Score ring" aside={<Badge tone="good">component</Badge>} />
          <CardBody className="flex items-center gap-6">
            <ScoreRing score={58} size={120} />
            <div className="text-sm text-tx2">
              Colour comes from the band, not the brand, so a bad score reads as bad on any agency
              palette.
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Checks in the catalogue" aside={<Badge>{CHECKS.length}</Badge>} />
          <CardBody>
            <ul className="space-y-1.5 text-[13px] text-tx2">
              {CHECKS.slice(0, 6).map((check) => (
                <li key={check.code} className="flex gap-2">
                  <code className="font-mono text-xs text-tx3">{check.code}</code>
                  <span className="truncate">{check.title}</span>
                </li>
              ))}
              <li className="text-tx3">and {CHECKS.length - 6} more</li>
            </ul>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader
          title="Plans"
          aside={
            <Button size="sm" variant="secondary">
              docs/24-billing.md
            </Button>
          }
        />
        <CardBody className="flex flex-wrap gap-3">
          {PLAN_ORDER.map((plan) => (
            <div key={plan} className="min-w-40 flex-1 rounded-lg border border-line p-4">
              <div className="font-display font-semibold">{PLANS[plan].name}</div>
              <div className="tabular my-1 font-display text-2xl font-semibold">
                {formatPrice(PLANS[plan].monthlyCents)}
              </div>
              <div className="text-xs text-tx3">
                {PLANS[plan].limits.auditsPerMonth.toLocaleString('en-US')} reports a month
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </main>
  )
}
