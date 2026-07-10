import { useSearchParams } from 'react-router-dom'
import { todayISO, suggestedMealForNow } from './dates'
import { MEAL_TYPES, type MealMode, type MealType } from '../types'

export type ReturnTo = 'home' | 'meal' | 'planner'

function isMealType(v: string | null): v is MealType {
  return MEAL_TYPES.includes(v as MealType)
}

function isMealMode(v: string | null): v is MealMode {
  return v === 'planned' || v === 'logged'
}

export function isReturnTo(v: string | null): v is ReturnTo {
  return v === 'home' || v === 'meal' || v === 'planner'
}

/** Shared date / meal / mode query params for the add-food flow. */
export function useAddFoodParams() {
  const [params] = useSearchParams()
  return {
    date: params.get('date') ?? todayISO(),
    meal: isMealType(params.get('meal')) ? (params.get('meal') as MealType) : suggestedMealForNow(),
    mode: isMealMode(params.get('mode')) ? (params.get('mode') as MealMode) : 'logged',
    returnTo: isReturnTo(params.get('returnTo')) ? (params.get('returnTo') as ReturnTo) : 'home',
    customName: params.get('name') ?? undefined,
    iconId: params.get('iconId') ?? undefined,
  }
}

export function addFoodQuery(
  base: { date: string; meal: MealType; mode: MealMode; returnTo?: ReturnTo },
  extra?: Record<string, string>,
) {
  const q = new URLSearchParams({ date: base.date, meal: base.meal, mode: base.mode })
  if (base.returnTo) q.set('returnTo', base.returnTo)
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v) q.set(k, v)
    }
  }
  return q.toString()
}
