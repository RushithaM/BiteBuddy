export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner'

export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner']

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  snack: 'Evening Snack',
  dinner: 'Dinner',
}

/** Whether a food entry is planned ahead or logged after eating. */
export type MealMode = 'planned' | 'logged'

export const MEAL_MODES: MealMode[] = ['planned', 'logged']

export const MEAL_MODE_LABELS: Record<MealMode, string> = {
  planned: 'Planning',
  logged: 'Logging',
}

export type FoodIconId =
  | 'icon-raspberries'
  | 'icon-pancakes'
  | 'icon-milk'
  | 'icon-oatmeal-bowl'
  | 'icon-egg'
  | 'icon-sandwich'
  | 'icon-soup'
  | 'icon-avocado-bowl'
  | 'icon-burger'
  | 'icon-pizza'
  | 'icon-chicken'

export interface Food {
  id: string
  name: string
  emoji: string
  /** pastel background behind the emoji placeholder */
  tint: string
  /** default icon from the predefined food-icon set */
  iconId: FoodIconId
  /** meal the food is usually eaten at — used to group the Add Food picker */
  usualMeal: MealType
}

/** A food logged/planned for a given date + meal. */
export interface MealItem {
  id: string
  foodId: string
  iconId: FoodIconId
  /** set when the user adds a custom food name */
  customName?: string
  /** set on a planned item once the user marks it as eaten */
  loggedAt?: string
  quantity?: string
  note?: string
}

/** Planned and logged items kept separate for the same meal slot. */
export interface MealSlot {
  planned: MealItem[]
  logged: MealItem[]
  /** 1 = meh, 2 = okay, 3 = loved it */
  mood?: MealMood
  mealNote?: string
}

export type MealMood = 1 | 2 | 3

/** ISO date (yyyy-mm-dd) → meal type → planned + logged items */
export type PlanByDate = Record<string, Partial<Record<MealType, MealSlot>>>

export type AvatarId =
  | 'avatar-apple'
  | 'avatar-orange'
  | 'avatar-strawberry'
  | 'avatar-watermelon'
  | 'avatar-peach'
  | 'avatar-grapes'
  | 'avatar-corn'
  | 'avatar-broccoli'
  | 'avatar-blueberry'
  | 'avatar-lemon'
  | 'avatar-carrot'
  | 'avatar-avocado'
  | 'avatar-banana'
  | 'avatar-mushroom'
  | 'avatar-tomato'
  | 'avatar-pineapple'

export type GoalId =
  | 'track-meals'
  | 'eat-healthier'
  | 'weight-loss'
  | 'build-muscle'
  | 'plan-weekly'

export type FoodPreference = 'vegetarian' | 'vegan' | 'non-vegetarian' | 'eggetarian'

export interface MealReminder {
  enabled: boolean
  time: string
}

export interface MotivationalReminder {
  enabled: boolean
  time: string
}

export interface User {
  name: string
  email: string
  avatarId: AvatarId
  setupComplete?: boolean
  goals?: GoalId[]
  foodPreference?: FoodPreference
  mealReminders?: Partial<Record<MealType, MealReminder>>
  hydrationReminders?: { enabled: boolean; interval: string }
  motivationalReminders?: MotivationalReminder | boolean
}
