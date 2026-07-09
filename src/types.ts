export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner'

export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner']

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  snack: 'Evening Snack',
  dinner: 'Dinner',
}

export interface Food {
  id: string
  name: string
  emoji: string
  /** pastel background behind the emoji placeholder */
  tint: string
  /** meal the food is usually eaten at — used to group the Add Food picker */
  usualMeal: MealType
}

/** A food logged/planned for a given date + meal. */
export interface MealItem {
  id: string
  foodId: string
}

/** ISO date (yyyy-mm-dd) → meal type → items */
export type PlanByDate = Record<string, Partial<Record<MealType, MealItem[]>>>

export type AvatarId =
  | 'avatar-avocado'
  | 'avatar-tomato'
  | 'avatar-carrot'
  | 'avatar-blueberry'
  | 'avatar-broccoli'
  | 'avatar-banana'

export interface User {
  name: string
  email: string
  avatarId: AvatarId
}
