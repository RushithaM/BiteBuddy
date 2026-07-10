import type { MealMode, MealType } from '../types'

export type PlannerRestoreState = {
  date: string
  viewMode: MealMode
  expandedMeals: Partial<Record<MealType, boolean>>
  scrollY: number
}

const STORAGE_KEY = 'bitebuddy.plannerRestore'

export function buildPlannerRestore(
  snapshot: Omit<PlannerRestoreState, 'expandedMeals'> & {
    expandedMeals: Partial<Record<MealType, boolean>>
    openMeal: MealType
  },
): PlannerRestoreState {
  return {
    date: snapshot.date,
    viewMode: snapshot.viewMode,
    scrollY: snapshot.scrollY,
    expandedMeals: { ...snapshot.expandedMeals, [snapshot.openMeal]: true },
  }
}

/** Persist planner UI while the add-food flow is open (multi-step navigation). */
export function savePlannerRestore(state: PlannerRestoreState) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function takePlannerRestore(): PlannerRestoreState | null {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  sessionStorage.removeItem(STORAGE_KEY)
  try {
    return JSON.parse(raw) as PlannerRestoreState
  } catch {
    return null
  }
}

/** Merge saved planner snapshot with the meal that was just added. */
export function plannerRestoreAfterAdd(
  date: string,
  meal: MealType,
  mode: MealMode,
): PlannerRestoreState {
  const saved = takePlannerRestore()
  return {
    date,
    viewMode: mode,
    expandedMeals: { ...(saved?.expandedMeals ?? {}), [meal]: true },
    scrollY: saved?.scrollY ?? 0,
  }
}
