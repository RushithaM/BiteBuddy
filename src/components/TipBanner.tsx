import type { ReactNode } from 'react'
import { Illustration, type IllustrationName } from './Illustration'

/** Soft green banner with a mascot (planner tip, day-plan encouragement). */
export function TipBanner({
  mascot,
  children,
  large = false,
}: {
  mascot: IllustrationName
  children: ReactNode
  large?: boolean
}) {
  return (
    <div
      className={`flex items-center rounded-card border border-brand/15 bg-brand-tint ${
        large ? 'gap-4 px-5 py-5' : 'gap-3 px-4 py-3'
      }`}
    >
      <Illustration
        name={mascot}
        className={`shrink-0 object-contain ${large ? 'h-16 w-16' : 'h-11 w-11'}`}
      />
      <p
        className={`leading-snug font-bold text-ink ${large ? 'text-[15px]' : 'text-sm'}`}
      >
        {children}
      </p>
    </div>
  )
}
