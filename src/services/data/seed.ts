import type { MealType, PlanByDate, MealSlot } from '../../types'
import { getFood } from '../../data/foods'
import { addDays, todayISO, weekStart } from '../../lib/dates'

let nextId = 1
const item = (foodId: string) => {
  const food = getFood(foodId)
  return { id: `seed-${nextId++}`, foodId, iconId: food.iconId }
}

const planned = (foodId: string): MealSlot => ({ planned: [item(foodId)], logged: [] })
const logged = (foodId: string): MealSlot => ({ planned: [], logged: [item(foodId)] })
const loggedMany = (...foodIds: string[]): MealSlot => ({
  planned: [],
  logged: foodIds.map(item),
})

/**
 * Seeds the current week to mirror the reference designs: today matches the
 * Home screen (logged breakfast + lunch), the surrounding days are planned.
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
      ;(plans[date] ??= {})[meal] = planned(foodId)
    })
  }

  // Today mirrors the Home screen — already eaten, so logged.
  plans[todayISO()] = {
    breakfast: logged('masala-dosa'),
    lunch: loggedMany('rice', 'dal', 'paneer'),
  }
  return plans
}
