'use client'

import { Check, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { groupCountLabel, isProblem, type ReportGroup } from '@tw/shared'
import { CheckRow } from '../components/check-row'
import { Switch } from '../components/toggle'
import { scoreBand, SCORE_TEXT_CLASS } from '../lib/score'

export interface ChecksExplorerProps {
  groups: ReportGroup[]
  onExpand?: (group: string) => void
}

/**
 * Row 5: every check that ran, grouped and collapsed.
 * docs/15-frontend-spec.md, "Raspored izvještaja kad ima 174 nalaza".
 *
 * The rules there are all load bearing:
 *
 *   - collapsed by default, with the count in the header, because 176 open rows
 *     is a wall nobody walks through
 *   - a group where everything passed shows one green line and does not open
 *   - inside a group: failures, then warnings, then passes, greyed, at the
 *     bottom
 *   - a check that did not run is not shown at all, never as a pass. False
 *     green is worse than nothing, and packages/shared drops it before it
 *     reaches this component
 *   - "Show only problems", on by default
 *
 * Built on <details>, so the groups still open if the JavaScript never arrives.
 */
export function ChecksExplorer({ groups, onExpand }: ChecksExplorerProps) {
  const [onlyProblems, setOnlyProblems] = useState(true)

  const visible = groups.filter((group) => !onlyProblems || !group.allPassed)

  return (
    <section className="mt-9">
      <div className="mb-3.5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <h2 className="font-display text-xl font-bold tracking-tight">Everything we checked</h2>
        <div className="ml-auto">
          <Switch checked={onlyProblems} onChange={setOnlyProblems} label="Show only problems" />
        </div>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-panel">
        {visible.map((group) => (
          <GroupBlock
            key={group.group}
            group={group}
            onlyProblems={onlyProblems}
            onExpand={onExpand}
          />
        ))}

        {visible.length === 0 && (
          <p className="px-4.5 py-6 text-center text-[13px] text-tx2">
            Nothing failed. Turn off &quot;Show only problems&quot; to see every check that ran.
          </p>
        )}
      </div>
    </section>
  )
}

function GroupBlock({
  group,
  onlyProblems,
  onExpand,
}: {
  group: ReportGroup
  onlyProblems: boolean
  onExpand?: (group: string) => void
}) {
  const scoreClass = SCORE_TEXT_CLASS[scoreBand(group.score)]
  const rows = onlyProblems ? group.checks.filter(isProblem) : group.checks

  // Nothing to open. One green line is the whole story. docs/15-frontend-spec.
  if (group.allPassed) {
    return (
      <div className="flex items-center gap-3 border-t border-line px-4.5 py-3 text-[13px] first:border-t-0">
        <Check className="size-4 shrink-0 text-score-good-ink" aria-hidden />
        <span className="font-semibold">{group.label}</span>
        <span className="text-tx2">{groupCountLabel(group)}</span>
        <span className={`tabular ml-auto font-semibold ${scoreClass}`}>{group.score}</span>
      </div>
    )
  }

  return (
    <details
      className="group border-t border-line first:border-t-0"
      onToggle={(event) => {
        if ((event.currentTarget as HTMLDetailsElement).open) onExpand?.(group.group)
      }}
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4.5 py-3 text-[13px] marker:hidden">
        <ChevronRight
          className="size-4 shrink-0 text-tx3 transition-transform group-open:rotate-90"
          aria-hidden
        />
        <span className="font-semibold">{group.label}</span>
        <span className="text-tx2">{groupCountLabel(group)}</span>
        <span className={`tabular ml-auto font-semibold ${scoreClass}`}>{group.score}</span>
      </summary>

      <div className="border-t border-line bg-bg">
        {rows.map((check) => (
          <CheckRow key={check.code} check={check} />
        ))}
      </div>
    </details>
  )
}
