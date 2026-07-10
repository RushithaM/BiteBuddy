import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, dayOfMonth, shortWeekday, todayISO, weekStart } from '../lib/dates'
import {
  dateCellLabelClass,
  dateCellNumberClass,
  getDateCellState,
} from '../lib/dateCellStyle'
import type { PlanByDate } from '../types'

/** Horizontal week strip with navigation and meal-state circles. */
export function CalendarStrip({
  selected,
  onSelect,
  plans,
}: {
  selected: string
  onSelect: (date: string) => void
  plans: PlanByDate
}) {
  const start = weekStart(selected)
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
  const today = todayISO()

  const shiftWeek = (delta: number) => {
    onSelect(addDays(selected, delta * 7))
  }

  return (
    <div className="rounded-card bg-paper px-1.5 py-3 shadow-card ring-1 ring-line-soft">
      <div className="flex items-center">
        <button
          type="button"
          aria-label="Previous week"
          onClick={() => shiftWeek(-1)}
          className="flex h-9 w-8 shrink-0 items-center justify-center text-brand active:opacity-70"
        >
          <ChevronLeft size={22} strokeWidth={2.4} />
        </button>

        <div className="flex min-w-0 flex-1 justify-between">
          {days.map((date) => {
            const state = getDateCellState(plans, date, selected, today)
            return (
              <button
                key={date}
                type="button"
                onClick={() => onSelect(date)}
                className="flex min-w-0 flex-1 flex-col items-center py-0.5"
              >
                <span
                  className={`text-[10px] font-extrabold tracking-wide ${dateCellLabelClass(state)}`}
                >
                  {shortWeekday(date).toUpperCase()}
                </span>
                <span
                  className={`mt-1 flex h-9 w-9 items-center justify-center rounded-full text-[16px] font-extrabold leading-none transition-colors ${dateCellNumberClass(state)}`}
                >
                  {dayOfMonth(date)}
                </span>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          aria-label="Next week"
          onClick={() => shiftWeek(1)}
          className="flex h-9 w-8 shrink-0 items-center justify-center text-brand active:opacity-70"
        >
          <ChevronRight size={22} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  )
}
