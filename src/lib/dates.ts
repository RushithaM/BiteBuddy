export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function addDays(iso: string, days: number): string {
  const d = fromISODate(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

/** Monday of the week containing the given date. */
export function weekStart(iso: string): string {
  const d = fromISODate(iso)
  const offset = (d.getDay() + 6) % 7 // Mon=0 … Sun=6
  d.setDate(d.getDate() - offset)
  return toISODate(d)
}

export function weekDates(startISO: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(startISO, i))
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** e.g. "12 – 18 May 2025" (spans month/year boundaries gracefully) */
export function formatWeekRange(startISO: string): string {
  const start = fromISODate(startISO)
  const end = fromISODate(addDays(startISO, 6))
  const sm = MONTHS[start.getMonth()]
  const em = MONTHS[end.getMonth()]
  if (start.getFullYear() !== end.getFullYear())
    return `${start.getDate()} ${sm} ${start.getFullYear()} – ${end.getDate()} ${em} ${end.getFullYear()}`
  if (sm !== em) return `${start.getDate()} ${sm} – ${end.getDate()} ${em} ${end.getFullYear()}`
  return `${start.getDate()} – ${end.getDate()} ${em} ${end.getFullYear()}`
}

/** e.g. "Wednesday, 14 May 2025" */
export function formatFullDate(iso: string): string {
  const d = fromISODate(iso)
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** e.g. "Fri, 10 July" */
export function formatPlannerDateShort(iso: string): string {
  const d = fromISODate(iso)
  return `${WEEKDAYS[d.getDay()].slice(0, 3)}, ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

/** e.g. "Wednesday, 14 May" */
export function formatPlannerDate(iso: string): string {
  const d = fromISODate(iso)
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export function monthStart(iso: string): string {
  const d = fromISODate(iso)
  return toISODate(new Date(d.getFullYear(), d.getMonth(), 1))
}

export function addMonths(iso: string, months: number): string {
  const d = fromISODate(iso)
  return toISODate(new Date(d.getFullYear(), d.getMonth() + months, 1))
}

export function daysInMonth(iso: string): number {
  const d = fromISODate(iso)
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

export function formatMonthYear(iso: string): string {
  const d = fromISODate(iso)
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function shortWeekday(iso: string): string {
  return WEEKDAYS[fromISODate(iso).getDay()].slice(0, 3)
}

export function dayOfMonth(iso: string): number {
  return fromISODate(iso).getDate()
}

export function greetingForNow(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

import type { MealType } from '../types'

/** Suggest which meal slot to open based on time of day. */
export function suggestedMealForNow(): MealType {
  const h = new Date().getHours()
  if (h < 11) return 'breakfast'
  if (h < 14) return 'lunch'
  if (h < 17) return 'snack'
  return 'dinner'
}
