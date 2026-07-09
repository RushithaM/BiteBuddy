import { useCallback, useSyncExternalStore } from 'react'
import { dataService } from '../services/data'
import type { MealType } from '../types'

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
    addFood: (date: string, meal: MealType, foodId: string) =>
      dataService.addFood(date, meal, foodId),
    removeItem: (date: string, meal: MealType, itemId: string) =>
      dataService.removeItem(date, meal, itemId),
  }
}
