import type { MealType, PlanByDate } from '../../types'
import { addDays, todayISO, weekStart } from '../../lib/dates'

let nextId = 1
const item = (foodId: string) => ({ id: `seed-${nextId++}`, foodId })

/**
 * Seeds the current week to mirror the reference designs: today matches the
 * Home screen (Masala Dosa breakfast, Rice·Dal·Paneer lunch, snack and
 * dinner still empty), the surrounding days match the Weekly Planner grid.
 */
export function buildSeedPlans(): PlanByDate {
  const monday = weekStart(todayISO())
  const week: Partial<Record<MealType, (string | null)[]>> = {
    breakfast: ['poha', 'oats', 'aloo-paratha', 'upma', null, 'pancakes', null],
    lunch: ['rajma-chawal', 'veg-pulao', 'dal-chawal', 'paneer-rice', 'khichdi', null, null],
    snack: ['fruits', 'chai', 'nuts', null, 'chai', 'fruits', null],
    dinner: ['veg-soup', 'roti-sabzi', 'dal-tadka', 'pulao', null, 'roti-sabzi', null],
  }

  const plans: PlanByDate = {}
  for (const [meal, foods] of Object.entries(week) as [MealType, (string | null)[]][]) {
    foods.forEach((foodId, i) => {
      if (!foodId) return
      const date = addDays(monday, i)
      ;(plans[date] ??= {})[meal] = [item(foodId)]
    })
  }

  // Today mirrors the Home screen exactly.
  plans[todayISO()] = {
    breakfast: [item('masala-dosa')],
    lunch: [item('rice'), item('dal'), item('paneer')],
  }
  return plans
}
