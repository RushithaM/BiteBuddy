import type { MealType, PlanByDate, User, FoodIconId, MealMode, MealMood } from '../../types'

/**
 * Storage abstraction the screens talk to. The app currently ships with a
 * localStorage-backed mock implementation; a remote (API-backed)
 * implementation can be swapped in later without touching the screens.
 */
export interface DataService {
  getUser(): User | null
  signIn(user: User): void
  updateUser(patch: Partial<User>): void
  signOut(): void

  getPlans(): PlanByDate
  addFood(
    date: string,
    meal: MealType,
    foodId: string,
    mode: MealMode,
    iconId?: FoodIconId,
    opts?: { quantity?: string; note?: string },
  ): void
  addCustomFood(
    date: string,
    meal: MealType,
    name: string,
    iconId: FoodIconId,
    mode: MealMode,
    opts?: { quantity?: string; note?: string },
  ): void
  removeItem(date: string, meal: MealType, itemId: string, mode: MealMode): void
  updateItem(
    date: string,
    meal: MealType,
    itemId: string,
    mode: MealMode,
    patch: { quantity?: string; note?: string },
  ): void
  logPlannedItem(date: string, meal: MealType, itemId: string): void
  updateMealMeta(
    date: string,
    meal: MealType,
    patch: { mood?: MealMood; mealNote?: string },
  ): void

  /** Notifies on any data change; returns an unsubscribe function. */
  subscribe(listener: () => void): () => void
}
