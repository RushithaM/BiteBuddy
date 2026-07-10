import { getItemNutrition } from '../data/nutrition'
import { getMealSlot, itemsForMode } from './mealPlans'
import { MEAL_TYPES, type MealMode, type PlanByDate } from '../types'

/** Meals on a date that have at least one item in the given mode. */
export function mealsWithItemsOnDate(
  plans: PlanByDate,
  date: string,
  mode: MealMode,
): number {
  const day = plans[date] ?? {}
  return MEAL_TYPES.filter(
    (meal) => itemsForMode(getMealSlot(day, meal), mode).length > 0,
  ).length
}

/** Whether any meal slot has items for this date + mode. */
export function dateHasActivity(plans: PlanByDate, date: string, mode: MealMode): boolean {
  return mealsWithItemsOnDate(plans, date, mode) > 0
}

/** Total kcal from all logged items on a date. */
export function loggedKcalOnDate(plans: PlanByDate, date: string): number {
  const day = plans[date] ?? {}
  let total = 0
  for (const meal of MEAL_TYPES) {
    for (const item of itemsForMode(getMealSlot(day, meal), 'logged')) {
      total += getItemNutrition(item).calories
    }
  }
  return total
}

/** Count of planned items not yet marked eaten. */
export function pendingPlannedCount(plans: PlanByDate, date: string): number {
  const day = plans[date] ?? {}
  let count = 0
  for (const meal of MEAL_TYPES) {
    for (const item of getMealSlot(day, meal).planned) {
      if (!item.loggedAt) count++
    }
  }
  return count
}
