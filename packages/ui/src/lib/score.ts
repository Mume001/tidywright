export type ScoreBand = 'good' | 'mid' | 'bad'

/** docs/27-design-system.md: 80 and up good, 50 to 79 mid, under 50 bad. */
export function scoreBand(score: number): ScoreBand {
  if (score >= 80) return 'good'
  if (score >= 50) return 'mid'
  return 'bad'
}

/** For rings, bars and meters. Graphics clear 3:1, so these can stay bright. */
export const SCORE_COLOR: Record<ScoreBand, string> = {
  good: 'var(--color-score-good)',
  mid: 'var(--color-score-mid)',
  bad: 'var(--color-score-bad)',
}

/**
 * For letters. Text clears 4.5:1, which the bar colours do not on white, so the
 * report theme swaps in darker versions. Use these anywhere the band colours a
 * word or a number, never SCORE_COLOR.
 */
export const SCORE_INK: Record<ScoreBand, string> = {
  good: 'var(--color-score-good-ink)',
  mid: 'var(--color-score-mid-ink)',
  bad: 'var(--color-score-bad-ink)',
}

export const SCORE_TEXT_CLASS: Record<ScoreBand, string> = {
  good: 'text-score-good-ink',
  mid: 'text-score-mid-ink',
  bad: 'text-score-bad-ink',
}
