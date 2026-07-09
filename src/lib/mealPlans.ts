import { MEAL_TYPES, type MealMode, type MealSlot, type MealType, type MealItem } from '../types'

export const EMPTY_MEAL_SLOT: MealSlot = { planned: [], logged: [] }

export function getMealSlot(
  dayPlan: Partial<Record<MealType, MealSlot>> | undefined,
  meal: MealType,
): MealSlot {
  return dayPlan?.[meal] ?? EMPTY_MEAL_SLOT
}

export function itemsForMode(slot: MealSlot, mode: MealMode): MealItem[] {
  return mode === 'planned' ? slot.planned : slot.logged
}

export function dayHasItems(
  dayPlan: Partial<Record<MealType, MealSlot>> | undefined,
  mode: MealMode,
): boolean {
  return MEAL_TYPES.some((meal) => itemsForMode(getMealSlot(dayPlan, meal), mode).length > 0)
}

export function emptyMealCopy(mode: MealMode): string {
  return mode === 'planned' ? 'Nothing planned yet' : 'Nothing logged yet'
}

export function isPlannedItemLogged(item: MealItem): boolean {
  return item.loggedAt != null
}
