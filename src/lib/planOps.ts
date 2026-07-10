import type { FoodIconId, MealItem, MealMode, MealMood, MealSlot, MealType, PlanByDate } from '../types'
import { getFood } from '../data/foods'
import { EMPTY_MEAL_SLOT } from './mealPlans'

export function slotFor(plans: PlanByDate, date: string, meal: MealType): MealSlot {
  return plans[date]?.[meal] ?? EMPTY_MEAL_SLOT
}

export function withSlot(plans: PlanByDate, date: string, meal: MealType, slot: MealSlot): PlanByDate {
  return { ...plans, [date]: { ...plans[date], [meal]: slot } }
}

export function makeItem(
  foodId: string,
  iconId?: FoodIconId,
  customName?: string,
  opts?: { quantity?: string; note?: string },
): MealItem {
  return {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    foodId,
    iconId: iconId ?? getFood(foodId).iconId,
    ...(customName ? { customName } : {}),
    ...(opts?.quantity ? { quantity: opts.quantity } : {}),
    ...(opts?.note ? { note: opts.note } : {}),
  }
}

export function addItemOp(
  plans: PlanByDate,
  date: string,
  meal: MealType,
  mode: MealMode,
  item: MealItem,
): PlanByDate {
  const slot = slotFor(plans, date, meal)
  const key = mode === 'planned' ? 'planned' : 'logged'
  return withSlot(plans, date, meal, { ...slot, [key]: [...slot[key], item] })
}

export function removeItemOp(
  plans: PlanByDate,
  date: string,
  meal: MealType,
  itemId: string,
  mode: MealMode,
): PlanByDate {
  const slot = slotFor(plans, date, meal)
  if (mode === 'planned') {
    return withSlot(plans, date, meal, { ...slot, planned: slot.planned.filter((i) => i.id !== itemId) })
  }
  return withSlot(plans, date, meal, {
    ...slot,
    planned: slot.planned.map((i) => (i.id === itemId ? { ...i, loggedAt: undefined } : i)),
    logged: slot.logged.filter((i) => i.id !== itemId),
  })
}

export function updateItemOp(
  plans: PlanByDate,
  date: string,
  meal: MealType,
  itemId: string,
  mode: MealMode,
  patch: { quantity?: string; note?: string },
): PlanByDate {
  const slot = slotFor(plans, date, meal)
  const key = mode === 'planned' ? 'planned' : 'logged'
  return withSlot(plans, date, meal, {
    ...slot,
    [key]: slot[key].map((i) => (i.id === itemId ? { ...i, ...patch } : i)),
  })
}

/** Returns null when the item is missing or already logged (no-op). */
export function logPlannedOp(
  plans: PlanByDate,
  date: string,
  meal: MealType,
  itemId: string,
  loggedAt: string,
): PlanByDate | null {
  const slot = slotFor(plans, date, meal)
  const item = slot.planned.find((i) => i.id === itemId)
  if (!item || item.loggedAt) return null
  const { loggedAt: _drop, ...loggedCopy } = item
  return withSlot(plans, date, meal, {
    ...slot,
    planned: slot.planned.map((i) => (i.id === itemId ? { ...i, loggedAt } : i)),
    logged: [...slot.logged, loggedCopy],
  })
}

export function updateMetaOp(
  plans: PlanByDate,
  date: string,
  meal: MealType,
  patch: { mood?: MealMood; mealNote?: string },
): PlanByDate {
  return withSlot(plans, date, meal, { ...slotFor(plans, date, meal), ...patch })
}
