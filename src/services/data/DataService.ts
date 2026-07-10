import type { MealType, PlanByDate, User, FoodIconId, MealMode, MealMood } from '../../types'

/** Storage abstraction the screens talk to — backed by ApiDataService + the REST API. */
export interface DataService {
  /** Resolves when any persisted session/data is loaded. Render app after. */
  init(): Promise<void>
  getUser(): User | null
  signIn(email: string, password: string): Promise<User>
  signUp(name: string, email: string, password: string): Promise<User>
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
