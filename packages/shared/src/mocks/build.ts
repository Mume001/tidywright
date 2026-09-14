import { PHASE_1_CHECKS } from '../checks-catalog'
import { prioritise, scoreChecks } from '../score'
import { entitlementsFor } from '../plans'
import type {
  Agency,
  Audit,
  AuditStatus,
  Branding,
  AuditSummary,
  CheckResult,
  EmbedKey,
  Entitlements,
  Fix,
  Lead,
  LeadStatus,
  Membership,
  Plan,
  StatsDaily,
  UsageMonthly,
  User,
} from '../types'
import { CITIES, COUNTRIES, FIRST_NAMES, INBOXES, SITES, UTM_SOURCES } from './fixtures'
import { daysAgo, minutesAgo, MOCK_NOW, Rng } from './rng'

export interface MockData {
  users: User[]
  agencies: Agency[]
  memberships: Membership[]
  branding: Branding[]
  entitlements: Entitlements[]
  usage: UsageMonthly[]
  embedKeys: EmbedKey[]
  leads: Lead[]
  audits: Audit[]
  stats: StatsDaily[]
}

const FIXABLE_CODES = new Set(PHASE_1_CHECKS.filter((c) => c.fixable).map((c) => c.code))

const AGENCY_SEEDS = [
  {
    slug: 'northwind-digital',
    name: 'Northwind Digital',
    plan: 'starter' as Plan,
    color: '#1F5AF6',
  },
  { slug: 'atlas-web-studio', name: 'Atlas Web Studio', plan: 'free' as Plan, color: '#C2410C' },
  { slug: 'meridian-seo', name: 'Meridian SEO', plan: 'agency' as Plan, color: '#0F766E' },
]

function buildChecks(rng: Rng, quality: number): CheckResult[] {
  return PHASE_1_CHECKS.map((d): CheckResult => {
    const base = d.severity === 'critical' ? 0.3 : d.severity === 'warning' ? 0.42 : 0.5
    const chanceToFail = base * (1 - quality)
    const roll = rng.float()
    const status = roll < chanceToFail ? 'fail' : roll < chanceToFail * 1.7 ? 'warn' : 'pass'
    return {
      code: d.code,
      group: d.group,
      severity: d.severity,
      status,
      title: d.title,
      detail: status === 'pass' ? 'Looks right.' : d.failText,
      evidence: status === 'pass' ? null : `<${d.code}>`,
    }
  })
}

function buildFixes(rng: Rng, site: (typeof SITES)[number], city: string): Fix[] {
  const SERVICE: Record<string, string> = {
    construction: 'Kitchen Renovation & Custom Cabinets',
    dental: 'Family and Cosmetic Dentistry',
    roofing: 'Roof Repair and Replacement',
    legal: 'Business and Family Law',
    plumbing: 'Emergency Plumbing and Repairs',
    cafe: 'Coffee, Breakfast and Lunch',
    realty: 'Homes and Property Management',
    accounting: 'Bookkeeping and Tax Filing',
    vet: 'Veterinary Care and Boarding',
    salon: 'Hair, Color and Styling',
    gym: 'Personal Training and Group Classes',
    moving: 'Local and Long Distance Moving',
    hvac: 'Heating, Cooling and Air Quality',
    florist: 'Wedding and Event Flowers',
    carpentry: 'Custom Carpentry and Built-Ins',
    photo: 'Wedding and Portrait Photography',
    landscaping: 'Garden Design and Yard Care',
    bakery: 'Fresh Bread, Cakes and Pastries',
    interiors: 'Interior Design and Styling',
    spam: 'Services',
  }
  const service = SERVICE[site.kind] ?? 'Local Services'

  return [
    {
      kind: 'title',
      severity: 'critical',
      label: 'Title tag',
      before: rng.chance(0.5) ? `Home | ${site.name}` : site.name,
      after: `${service} in ${city} | ${site.name}`,
      reasons: [
        'The current title does not name a service or a city.',
        'The new one leads with what people actually search for, then the brand.',
        `${`${service} in ${city} | ${site.name}`.length} characters, fits in results without being cut.`,
      ],
    },
    {
      kind: 'meta',
      severity: 'critical',
      label: 'Meta description',
      before: null,
      after: `${city} ${site.kind} services, done in-house. See recent work, our process, and get a quote in 48 hours.`,
      reasons: [
        'No description means Google picks random text from the page.',
        'This one says what, where, and what to do next.',
      ],
    },
    {
      kind: 'jsonld',
      severity: 'critical',
      label: 'Structured data (LocalBusiness)',
      before: null,
      after: JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: site.name,
          address: { '@type': 'PostalAddress', addressLocality: city, addressRegion: 'OR' },
          url: `https://${site.host}`,
        },
        null,
        2,
      ),
      reasons: [
        'Tells Google this is a local business with an address, which local results require.',
        'Paste inside <head> in a script tag of type application/ld+json.',
      ],
    },
  ]
}

export function buildMockData(seed = 42): MockData {
  const rng = new Rng(seed)

  const users: User[] = []
  const agencies: Agency[] = []
  const memberships: Membership[] = []
  const branding: Branding[] = []
  const entitlements: Entitlements[] = []
  const usage: UsageMonthly[] = []
  const embedKeys: EmbedKey[] = []

  for (const seedAgency of AGENCY_SEEDS) {
    const ownerId = rng.id()
    const agencyId = rng.id()
    const first = rng.pick(FIRST_NAMES)

    users.push({
      id: ownerId,
      email: `${first}@${seedAgency.slug}.com`,
      fullName: `${first[0]?.toUpperCase()}${first.slice(1)} H.`,
      avatarPath: null,
      createdAt: daysAgo(120),
    })

    agencies.push({
      id: agencyId,
      slug: seedAgency.slug,
      name: seedAgency.name,
      plan: seedAgency.plan,
      status: 'active',
      ownerUserId: ownerId,
      timezone: 'UTC',
      createdAt: daysAgo(120),
    })

    memberships.push({
      id: rng.id(),
      agencyId,
      userId: ownerId,
      role: 'owner',
      acceptedAt: daysAgo(120),
      createdAt: daysAgo(120),
    })

    branding.push({
      agencyId,
      logoPath: null,
      primaryColor: seedAgency.color,
      headline: 'Get a free SEO report for your website',
      subline: 'Score, what is broken, and three fixes you can use today. Takes about 15 seconds.',
      buttonLabel: 'Get my report',
      reportIntro:
        'We read your homepage the way Google does. Below are the three changes we would make first, ready to paste.',
      ctaLabel: 'Book a free 20 minute call',
      ctaUrl: `https://${seedAgency.slug}.com/call`,
      footerText: null,
      companyAddress: '1200 NW Naito Pkwy, Portland OR',
      hidePoweredBy: seedAgency.plan !== 'free',
      consentVersion: '2026-09-01',
      privacyPolicyUrl: `https://${seedAgency.slug}.com/privacy`,
      updatedAt: daysAgo(2),
    })

    entitlements.push(entitlementsFor(agencyId, seedAgency.plan))

    const limit = entitlementsFor(agencyId, seedAgency.plan).auditsPerMonth
    usage.push({
      agencyId,
      period: '2026-09-01',
      auditsUsed: seedAgency.slug === 'northwind-digital' ? 146 : rng.int(4, 40),
      auditsLimit: limit,
      resetsAt: '2026-10-01T00:00:00.000Z',
    })
  }

  const mainAgency = agencies[0]!
  const keyLabels = [
    {
      label: 'Main site',
      origins: ['northwinddigital.com', 'www.northwinddigital.com'],
      status: 'active' as const,
    },
    {
      label: 'Landing: roofing',
      origins: ['offers.northwinddigital.com'],
      status: 'active' as const,
    },
    { label: 'Old site', origins: [], status: 'revoked' as const },
  ]
  for (const k of keyLabels) {
    embedKeys.push({
      id: rng.id(),
      agencyId: mainAgency.id,
      publicKey: `pk_live_${rng.token(24)}`,
      label: k.label,
      allowedOrigins: k.origins,
      status: k.status,
      lastUsedAt: k.status === 'active' ? minutesAgo(rng.int(4, 400)) : null,
      createdAt: daysAgo(100),
    })
  }
  for (const agency of agencies.slice(1)) {
    embedKeys.push({
      id: rng.id(),
      agencyId: agency.id,
      publicKey: `pk_live_${rng.token(24)}`,
      label: 'Main site',
      allowedOrigins: [`${agency.slug}.com`],
      status: 'active',
      lastUsedAt: minutesAgo(rng.int(30, 2000)),
      createdAt: daysAgo(90),
    })
  }

  const leads: Lead[] = []
  const audits: Audit[] = []

  const statusWeights: readonly (readonly [LeadStatus, number])[] = [
    ['new', 45],
    ['contacted', 20],
    ['qualified', 12],
    ['won', 8],
    ['lost', 12],
    ['spam', 3],
  ]

  for (let i = 0; i < 200; i += 1) {
    const agency = i < 150 ? mainAgency : rng.pick(agencies.slice(1))
    const site = rng.pick(SITES)
    const isSpam = site.kind === 'spam'
    const minutes = Math.round(Math.pow(rng.float(), 2) * 60 * 24 * 30) + 4
    const inbox = rng.chance(0.5) ? rng.pick(INBOXES) : rng.pick(FIRST_NAMES)
    const key = embedKeys.find((k) => k.agencyId === agency.id) ?? embedKeys[0]!
    const leadId = rng.id()

    const lead: Lead = {
      id: leadId,
      agencyId: agency.id,
      embedKeyId: key.id,
      email: `${inbox}@${site.host}`,
      siteUrl: `https://${site.host}/`,
      siteHost: site.host,
      name: null,
      phone: null,
      status: isSpam ? 'spam' : rng.weighted(statusWeights),
      sourceUrl: `https://${agency.slug}.com/free-seo-check`,
      utm: { source: rng.pick(UTM_SOURCES), medium: 'organic' },
      consent: {
        text: `I agree to receive my report and follow-up from ${agency.name} by email.`,
        version: '2026-09-01',
        checked: true,
        ts: minutesAgo(minutes),
        formUrl: `https://${agency.slug}.com/free-seo-check`,
      },
      country: rng.pick(COUNTRIES),
      firstViewedAt: rng.chance(0.7) ? minutesAgo(Math.max(1, minutes - 20)) : null,
      notes: null,
      unsubscribedAt: null,
      createdAt: minutesAgo(minutes),
    }
    leads.push(lead)
  }

  for (let i = 0; i < 500; i += 1) {
    const lead = i < leads.length ? leads[i]! : rng.pick(leads)
    const site = SITES.find((s) => s.host === lead.siteHost) ?? SITES[0]
    const city = rng.pick(CITIES)
    const minutes = Math.round(Math.pow(rng.float(), 2) * 60 * 24 * 30) + 3

    const status: AuditStatus = rng.weighted([
      ['done', 88],
      ['failed', 7],
      ['queued', 2],
      ['checking', 2],
      ['expired', 1],
    ])
    const failed = status === 'failed'
    const done = status === 'done'
    const quality = rng.float() * 0.7 + 0.1
    const checks = done ? buildChecks(rng, quality) : []
    const breakdown = done ? scoreChecks(checks) : null

    audits.push({
      id: rng.id(),
      agencyId: lead.agencyId,
      leadId: lead.id,
      token: rng.token(32),
      url: lead.siteUrl,
      finalUrl: done ? lead.siteUrl : null,
      status,
      failureCode: failed
        ? rng.weighted([
            ['blocked', 5],
            ['fetch_timeout', 3],
            ['dns', 1],
          ])
        : null,
      score: breakdown ? breakdown.score : null,
      summary: breakdown
        ? {
            groups: breakdown.groups as AuditSummary['groups'],
            counts: breakdown.counts,
            priority: prioritise(checks, FIXABLE_CODES).slice(0, 8),
            passed: checks.filter((c) => c.status === 'pass').map((c) => c.code),
            failed: checks.filter((c) => c.status === 'fail').map((c) => c.code),
            warnings: checks.filter((c) => c.status === 'warn').map((c) => c.code),
            headline:
              breakdown.score >= 80
                ? 'Solid, a few things to tidy'
                : breakdown.score >= 50
                  ? 'Good bones, weak first impression'
                  : 'Google can barely read this page',
            intro:
              'Google can read the site, but the title and description do not say what you do or where.',
          }
        : null,
      fixes: done ? buildFixes(rng, site!, city) : [],
      checks,
      variant: 'full',
      fetchMs: done ? rng.int(300, 2200) : null,
      checkMs: done ? rng.int(40, 120) : null,
      modelMs: done ? rng.int(3800, 11000) : null,
      model: done ? 'gpt-5.6-luna/p1' : null,
      costUsdMicros: done ? rng.int(900, 1400) : 0,
      viewedAt: done && rng.chance(0.65) ? minutesAgo(Math.max(1, minutes - 5)) : null,
      viewCount: done ? rng.int(0, 4) : 0,
      expiresAt: daysAgo(-90),
      createdAt: minutesAgo(minutes),
      finishedAt: done || failed ? minutesAgo(Math.max(1, minutes - 1)) : null,
    })
  }

  leads.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  audits.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const stats: StatsDaily[] = []
  for (const agency of agencies) {
    for (let d = 29; d >= 0; d -= 1) {
      const trend = 1 + (29 - d) * 0.03
      const base = agency.id === mainAgency.id ? 80 : 20
      const formViews = Math.round(base * trend * (0.7 + rng.float() * 0.6))
      const submits = Math.round(formViews * (0.05 + rng.float() * 0.03))
      const done = Math.max(0, submits - rng.int(0, 1))
      stats.push({
        agencyId: agency.id,
        day: new Date(MOCK_NOW.getTime() - d * 86_400_000).toISOString().slice(0, 10),
        formViews,
        submits,
        auditsDone: done,
        auditsFailed: submits - done,
        reportViews: Math.round(done * (1.5 + rng.float())),
        ctaClicks: Math.round(done * (0.3 + rng.float() * 0.2)),
        leadsNew: submits,
      })
    }
  }

  return {
    users,
    agencies,
    memberships,
    branding,
    entitlements,
    usage,
    embedKeys,
    leads,
    audits,
    stats,
  }
}
