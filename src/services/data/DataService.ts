import type { MealType, PlanByDate, User } from '../../types'

/**
 * Storage abstraction the screens talk to. The app currently ships with a
 * localStorage-backed mock implementation; a remote (API-backed)
 * implementation can be swapped in later without touching the screens.
 */
export interface DataService {
  getUser(): User | null
  signIn(user: User): void
  signOut(): void

  getPlans(): PlanByDate
  addFood(date: string, meal: MealType, foodId: string): void
  removeItem(date: string, meal: MealType, itemId: string): void

  /** Notifies on any data change; returns an unsubscribe function. */
  subscribe(listener: () => void): () => void
}
