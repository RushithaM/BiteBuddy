import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, dayOfMonth, shortWeekday, todayISO, weekStart } from '../lib/dates'
import { dateHasActivity } from '../lib/plannerStats'
import type { MealMode, PlanByDate } from '../types'

/** Horizontal week strip with navigation and activity dots. */
export function CalendarStrip({
  selected,
  onSelect,
  plans,
  mode,
}: {
  selected: string
  onSelect: (date: string) => void
  plans: PlanByDate
  mode: MealMode
}) {
  const start = weekStart(selected)
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
  const today = todayISO()

  const shiftWeek = (delta: number) => {
    onSelect(addDays(selected, delta * 7))
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Previous week"
        onClick={() => shiftWeek(-1)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-soft active:bg-cream-dark"
      >
        <ChevronLeft size={22} strokeWidth={2.2} />
      </button>

      <div className="no-scrollbar flex min-w-0 flex-1 justify-between gap-0.5 overflow-x-auto px-0.5">
        {days.map((date) => {
          const isSelected = date === selected
          const isToday = date === today
          const hasActivity = dateHasActivity(plans, date, mode)
          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelect(date)}
              className="flex min-w-[2.5rem] shrink-0 flex-col items-center py-0.5"
            >
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wide ${
                  isSelected ? 'text-brand' : 'text-muted'
                }`}
              >
                {shortWeekday(date)}
              </span>
              <span
                className={`mt-1 flex h-9 w-9 items-center justify-center rounded-full text-[16px] font-extrabold leading-none transition-all ${
                  isSelected
                    ? 'bg-brand text-white shadow-card ring-4 ring-brand/15'
                    : isToday
                      ? 'bg-brand-tint text-brand ring-2 ring-brand/25'
                      : 'text-ink'
                }`}
              >
                {dayOfMonth(date)}
              </span>
              <span
                className={`mt-1 h-1.5 w-1.5 rounded-full ${
                  hasActivity ? 'bg-brand' : 'bg-transparent'
                }`}
                aria-hidden
              />
            </button>
          )
        })}
      </div>

      <button
        type="button"
        aria-label="Next week"
        onClick={() => shiftWeek(1)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-soft active:bg-cream-dark"
      >
        <ChevronRight size={22} strokeWidth={2.2} />
      </button>
    </div>
  )
}
