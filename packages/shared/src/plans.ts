import type { Entitlements, Plan } from './types'

/**
 * One source of truth for what each plan allows. The pricing page, Stripe checkout
 * and every limit check read this file. docs/24-billing.md.
 *
 * Prices are in cents, USD. Yearly is ten months for twelve.
 */
export interface PlanDefinition {
  plan: Plan
  name: string
  monthlyCents: number
  yearlyCents: number
  /** Filled in when the Stripe products exist. Phase 2. */
  stripePriceIdMonthly: string | null
  stripePriceIdYearly: string | null
  tagline: string
  limits: Omit<Entitlements, 'agencyId' | 'source'>
}

export const PLANS: Record<Plan, PlanDefinition> = {
  free: {
    plan: 'free',
    name: 'Free',
    monthlyCents: 0,
    yearlyCents: 0,
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
    tagline: 'Enough to see whether it brings you leads.',
    limits: {
      auditsPerMonth: 50,
      embedKeysMax: 1,
      teamSeats: 1,
      concurrentAudits: 3,
      hidePoweredBy: false,
      pdf: false,
      webhook: false,
      export: false,
      customDomain: false,
      retentionDaysMax: 30,
    },
  },
  starter: {
    plan: 'starter',
    name: 'Starter',
    monthlyCents: 3900,
    yearlyCents: 39000,
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
    tagline: 'Your brand, your domain, no badge.',
    limits: {
      auditsPerMonth: 500,
      embedKeysMax: 3,
      teamSeats: 3,
      concurrentAudits: 20,
      hidePoweredBy: true,
      pdf: true,
      webhook: true,
      export: true,
      customDomain: false,
      retentionDaysMax: 90,
    },
  },
  agency: {
    plan: 'agency',
    name: 'Agency',
    monthlyCents: 9900,
    yearlyCents: 99000,
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
    tagline: 'For a team running this across many client sites.',
    limits: {
      auditsPerMonth: 2500,
      embedKeysMax: 10,
      teamSeats: 10,
      concurrentAudits: 20,
      hidePoweredBy: true,
      pdf: true,
      webhook: true,
      export: true,
      customDomain: false,
      retentionDaysMax: 365,
    },
  },
  pro: {
    plan: 'pro',
    name: 'Pro',
    monthlyCents: 24900,
    yearlyCents: 249000,
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
    tagline: 'High volume, unlimited keys.',
    limits: {
      auditsPerMonth: 10000,
      embedKeysMax: Number.POSITIVE_INFINITY,
      teamSeats: 25,
      concurrentAudits: 20,
      hidePoweredBy: true,
      pdf: true,
      webhook: true,
      export: true,
      customDomain: true,
      retentionDaysMax: 365,
    },
  },
}

export const PLAN_ORDER: Plan[] = ['free', 'starter', 'agency', 'pro']

export function entitlementsFor(agencyId: string, plan: Plan): Entitlements {
  return { agencyId, source: 'plan', ...PLANS[plan].limits }
}

/** Cents to a display string. 3900 -> "$39". 39000 -> "$390". */
export function formatPrice(cents: number): string {
  if (cents === 0) return '$0'
  const dollars = cents / 100
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`
}
