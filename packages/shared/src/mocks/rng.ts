/**
 * Deterministic pseudo-random. Same seed, same data, every run, on every machine.
 * That is what makes visual snapshots and Storybook stable.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function next(): number {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export class Rng {
  private next: () => number

  constructor(seed = 42) {
    this.next = mulberry32(seed)
  }

  float(): number {
    return this.next()
  }

  /** Integer in [min, max], both inclusive. */
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1))
  }

  pick<T>(items: readonly T[]): T {
    const item = items[Math.floor(this.next() * items.length)]
    if (item === undefined) throw new Error('pick() called on an empty list')
    return item
  }

  /** True with the given probability. */
  chance(p: number): boolean {
    return this.next() < p
  }

  /** A weighted pick. Weights do not need to sum to one. */
  weighted<T>(entries: readonly (readonly [T, number])[]): T {
    const total = entries.reduce((sum, [, w]) => sum + w, 0)
    let roll = this.next() * total
    for (const [value, weight] of entries) {
      roll -= weight
      if (roll <= 0) return value
    }
    const last = entries[entries.length - 1]
    if (!last) throw new Error('weighted() called on an empty list')
    return last[0]
  }

  /** A hex id that looks like a UUID but is stable for the seed. */
  id(): string {
    const hex = (n: number) =>
      Array.from({ length: n }, () => '0123456789abcdef'[this.int(0, 15)]).join('')
    return `${hex(8)}-${hex(4)}-7${hex(3)}-${'89ab'[this.int(0, 3)]}${hex(3)}-${hex(12)}`
  }

  token(len = 32): string {
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return Array.from({ length: len }, () => this.pick(alphabet.split(''))).join('')
  }

  /**
   * What base64url encoding of n random bytes looks like: 43 characters for 32
   * bytes, no padding. Used where the real column will hold a secret rather
   * than an identifier, so the mock is the same shape and the same length.
   */
  secret(bytes = 32): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
    const length = Math.ceil((bytes * 4) / 3)
    return Array.from({ length }, () => this.pick(alphabet.split(''))).join('')
  }
}

/** Fixed "now" so relative times in stories never drift. */
export const MOCK_NOW = new Date('2026-09-14T09:00:00.000Z')

export function minutesAgo(n: number): string {
  return new Date(MOCK_NOW.getTime() - n * 60_000).toISOString()
}

export function daysAgo(n: number): string {
  return minutesAgo(n * 60 * 24)
}
