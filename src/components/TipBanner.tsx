import type { ReactNode } from 'react'
import { Illustration, type IllustrationName } from './Illustration'

/** Soft green banner with a mascot (planner tip, day-plan encouragement). */
export function TipBanner({
  mascot,
  children,
}: {
  mascot: IllustrationName
  children: ReactNode
}) {
  return (
    <div className="flex items-center gap-3 rounded-card bg-brand-tint px-4 py-3">
      <Illustration name={mascot} className="h-11 w-11 shrink-0 object-contain" />
      <p className="text-sm leading-snug font-bold text-ink">{children}</p>
    </div>
  )
}
