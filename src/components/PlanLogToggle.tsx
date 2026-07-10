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
      className="flex w-full rounded-full border border-line bg-paper p-1 shadow-card"
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
            className={`flex-1 rounded-full py-2.5 text-[15px] font-extrabold transition-colors ${
              selected ? 'bg-brand text-white shadow-card' : 'text-brand active:bg-cream-dark'
            }`}
          >
            {MEAL_MODE_LABELS[mode]}
          </button>
        )
      })}
    </div>
  )
}
