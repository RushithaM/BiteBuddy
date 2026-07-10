import type { MealType } from '../types'

export type GoalId =
  | 'track-meals'
  | 'eat-healthier'
  | 'weight-loss'
  | 'build-muscle'
  | 'plan-weekly'

export type FoodPreference = 'vegetarian' | 'vegan' | 'non-vegetarian' | 'eggetarian'

export const GOAL_OPTIONS: { id: GoalId; label: string }[] = [
  { id: 'track-meals', label: 'Track my meals' },
  { id: 'eat-healthier', label: 'Eat healthier' },
  { id: 'weight-loss', label: 'Weight loss' },
  { id: 'build-muscle', label: 'Build muscle' },
  { id: 'plan-weekly', label: 'Plan weekly meals' },
]

export const FOOD_PREFERENCE_OPTIONS: {
  id: FoodPreference
  label: string
  emoji: string
}[] = [
  { id: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
  { id: 'vegan', label: 'Vegan', emoji: '🌱' },
  { id: 'non-vegetarian', label: 'Non-vegetarian', emoji: '🍗' },
  { id: 'eggetarian', label: 'Eggetarian', emoji: '🥚' },
]

export const DEFAULT_REMINDER_TIMES: Record<MealType, string> = {
  breakfast: '08:00',
  lunch: '13:00',
  snack: '17:00',
  dinner: '20:00',
}

export const DEFAULT_MOTIVATIONAL_TIME = '09:00'
