import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import {
  addMonths,
  daysInMonth,
  formatMonthYear,
  fromISODate,
  monthStart,
  todayISO,
  toISODate,
} from '../lib/dates'
import {
  dateCellNumberClass,
  getDateCellState,
} from '../lib/dateCellStyle'
import type { PlanByDate } from '../types'

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface DatePickerSheetProps {
  open: boolean
  selected: string
  plans: PlanByDate
  onSelect: (date: string) => void
  onClose: () => void
}

/** Bottom sheet calendar for picking a date. */
export function DatePickerSheet({
  open,
  selected,
  plans,
  onSelect,
  onClose,
}: DatePickerSheetProps) {
  const [viewMonth, setViewMonth] = useState(() => monthStart(selected))
  const today = todayISO()

  if (!open) return null

  const firstDay = fromISODate(viewMonth)
  const leadingBlanks = (firstDay.getDay() + 6) % 7
  const totalDays = daysInMonth(viewMonth)
  const cells: (string | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: totalDays }, (_, i) =>
      toISODate(new Date(firstDay.getFullYear(), firstDay.getMonth(), i + 1)),
    ),
  ]

  const pickDate = (date: string) => {
    onSelect(date)
    onClose()
  }

  return (
    <>
      <button
        aria-label="Close calendar"
        className="fixed inset-0 z-40 bg-ink/30"
        onClick={onClose}
      />
      <div className="pb-safe fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-[1.5rem] bg-paper px-5 pt-4 shadow-sheet">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-ink">Select date</h2>
          <button
            aria-label="Close"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink active:bg-cream-dark"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <button
            aria-label="Previous month"
            onClick={() => setViewMonth((m) => addMonths(m, -1))}
            className="flex h-9 w-9 items-center justify-center rounded-full text-brand active:bg-cream-dark"
          >
            <ChevronLeft size={22} />
          </button>
          <span className="text-[16px] font-extrabold text-ink">{formatMonthYear(viewMonth)}</span>
          <button
            aria-label="Next month"
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full text-brand active:bg-cream-dark"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1 text-center">
          {WEEKDAY_LABELS.map((label) => (
            <span key={label} className="py-1 text-[11px] font-bold text-muted">
              {label}
            </span>
          ))}
          {cells.map((date, i) => {
            if (!date) return <span key={`blank-${i}`} />

            const state = getDateCellState(plans, date, selected, today)

            return (
              <button
                key={date}
                onClick={() => pickDate(date)}
                className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold transition-colors active:opacity-80 ${dateCellNumberClass(state)}`}
              >
                {fromISODate(date).getDate()}
              </button>
            )
          })}
        </div>

        <p className="mt-4 pb-4 text-center text-[12px] font-semibold text-muted">
          Tap a date to view or plan meals
        </p>
      </div>
    </>
  )
}
