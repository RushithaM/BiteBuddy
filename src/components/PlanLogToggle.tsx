import type { MealMode } from '../types'
import { MEAL_MODE_LABELS } from '../types'

/** Planning / Logging segmented toggle below the Day Plan date. */
export function PlanLogToggle({
  value,
  onChange,
}: {
  value: MealMode
  onChange: (mode: MealMode) => void
}) {
  return (
    <div
      className="mx-auto flex w-full max-w-xs rounded-full border border-line bg-paper p-1"
      role="tablist"
      aria-label="Plan or log meals"
    >
      {(['planned', 'logged'] as MealMode[]).map((mode) => {
        const selected = value === mode
        return (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(mode)}
            className={`flex-1 rounded-full py-2 text-sm font-extrabold transition-colors ${
              selected ? 'bg-brand text-white shadow-card' : 'text-ink-soft active:bg-cream-dark'
            }`}
          >
            {MEAL_MODE_LABELS[mode]}
          </button>
        )
      })}
    </div>
  )
}
