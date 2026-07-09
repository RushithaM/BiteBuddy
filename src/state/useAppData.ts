import { useCallback, useSyncExternalStore } from 'react'
import { dataService } from '../services/data'
import type { FoodIconId, MealMode, MealType } from '../types'

export function useUser() {
  return useSyncExternalStore(
    useCallback((cb) => dataService.subscribe(cb), []),
    () => dataService.getUser(),
  )
}

export function usePlans() {
  return useSyncExternalStore(
    useCallback((cb) => dataService.subscribe(cb), []),
    () => dataService.getPlans(),
  )
}

export function useMealActions() {
  return {
    addFood: (
      date: string,
      meal: MealType,
      foodId: string,
      mode: MealMode,
      iconId?: FoodIconId,
    ) => dataService.addFood(date, meal, foodId, mode, iconId),
    addCustomFood: (
      date: string,
      meal: MealType,
      name: string,
      iconId: FoodIconId,
      mode: MealMode,
    ) => dataService.addCustomFood(date, meal, name, iconId, mode),
    removeItem: (date: string, meal: MealType, itemId: string, mode: MealMode) =>
      dataService.removeItem(date, meal, itemId, mode),
    logPlannedItem: (date: string, meal: MealType, itemId: string) =>
      dataService.logPlannedItem(date, meal, itemId),
  }
}
