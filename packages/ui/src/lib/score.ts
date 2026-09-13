export type ScoreBand = 'good' | 'mid' | 'bad'

/** docs/27-design-system.md: 80 and up good, 50 to 79 mid, under 50 bad. */
export function scoreBand(score: number): ScoreBand {
  if (score >= 80) return 'good'
  if (score >= 50) return 'mid'
  return 'bad'
}

export const SCORE_COLOR: Record<ScoreBand, string> = {
  good: 'var(--color-score-good)',
  mid: 'var(--color-score-mid)',
  bad: 'var(--color-score-bad)',
}

export const SCORE_TEXT_CLASS: Record<ScoreBand, string> = {
  good: 'text-score-good',
  mid: 'text-score-mid',
  bad: 'text-score-bad',
}
