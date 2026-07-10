import { useCallback, useSyncExternalStore } from 'react'
import { dataService } from '../services/data'
import type { FoodIconId, MealMode, MealType, MealMood } from '../types'

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
      opts?: { quantity?: string; note?: string },
    ) => dataService.addFood(date, meal, foodId, mode, iconId, opts),
    addCustomFood: (
      date: string,
      meal: MealType,
      name: string,
      iconId: FoodIconId,
      mode: MealMode,
      opts?: { quantity?: string; note?: string },
    ) => dataService.addCustomFood(date, meal, name, iconId, mode, opts),
    removeItem: (date: string, meal: MealType, itemId: string, mode: MealMode) =>
      dataService.removeItem(date, meal, itemId, mode),
    updateItem: (
      date: string,
      meal: MealType,
      itemId: string,
      mode: MealMode,
      patch: { quantity?: string; note?: string },
    ) => dataService.updateItem(date, meal, itemId, mode, patch),
    logPlannedItem: (date: string, meal: MealType, itemId: string) =>
      dataService.logPlannedItem(date, meal, itemId),
    updateMealMeta: (
      date: string,
      meal: MealType,
      patch: { mood?: MealMood; mealNote?: string },
    ) => dataService.updateMealMeta(date, meal, patch),
  }
}
