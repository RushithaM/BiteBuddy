import { MEAL_TYPES, type PlanByDate } from '../types'
import { getMealSlot, itemsForMode } from './mealPlans'
import { addDays, daysInMonth, monthStart, todayISO, weekDates, weekStart } from './dates'

/** How many meal slots have at least one logged item on a date. */
export function loggedMealsOnDate(plans: PlanByDate, date: string): number {
  const day = plans[date] ?? {}
  return MEAL_TYPES.filter(
    (meal) => itemsForMode(getMealSlot(day, meal), 'logged').length > 0,
  ).length
}

export function loggedMealsInRange(plans: PlanByDate, dates: string[]): number {
  return dates.reduce((sum, date) => sum + loggedMealsOnDate(plans, date), 0)
}

export function completionPercent(logged: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((logged / total) * 100)
}

/** Dates from `start` through `end` inclusive. */
export function dateRange(start: string, end: string): string[] {
  const dates: string[] = []
  let cursor = start
  while (cursor <= end) {
    dates.push(cursor)
    cursor = addDays(cursor, 1)
  }
  return dates
}

export function computeStreaks(plans: PlanByDate, throughDate = todayISO()) {
  const allDates = Object.keys(plans).sort()
  const active = (date: string) => loggedMealsOnDate(plans, date) > 0

  let best = 0
  let run = 0
  for (const date of allDates) {
    if (active(date)) {
      run += 1
      best = Math.max(best, run)
    } else {
      run = 0
    }
  }

  let current = 0
  let cursor = throughDate
  const earliest = allDates[0] ?? throughDate
  while (cursor >= earliest) {
    if (active(cursor)) {
      current += 1
      cursor = addDays(cursor, -1)
    } else break
  }

  return { current, best: Math.max(best, current) }
}

export function weekChartData(plans: PlanByDate, anchor = todayISO()) {
  const days = weekDates(weekStart(anchor))
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map((date, i) => ({
    date,
    label: labels[i],
    meals: loggedMealsOnDate(plans, date),
  }))
}

export function monthWeekChartData(plans: PlanByDate, anchor = todayISO()) {
  const start = monthStart(anchor)
  const totalDays = daysInMonth(anchor)
  const weeks: { label: string; meals: number }[] = []
  let weekIndex = 1
  for (let day = 1; day <= totalDays; day += 7) {
    const chunk = Array.from({ length: Math.min(7, totalDays - day + 1) }, (_, i) =>
      addDays(start, day - 1 + i),
    )
    weeks.push({
      label: `W${weekIndex}`,
      meals: loggedMealsInRange(plans, chunk),
    })
    weekIndex += 1
  }
  return weeks
}

export function dailyMealSlots(plans: PlanByDate, date = todayISO()) {
  const day = plans[date] ?? {}
  return MEAL_TYPES.map((meal) => ({
    meal,
    logged: itemsForMode(getMealSlot(day, meal), 'logged').length > 0,
  }))
}
