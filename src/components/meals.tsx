import type { MealType } from '../types'

/**
 * Per-meal presentation. `cardBg` tints each Home card to blend with its
 * composed scene thumbnail (meal-<type>.png); `sceneTint`/`icon` back the
 * emoji placeholder when no scene image exists.
 */
export const MEAL_META: Record<
  MealType,
  {
    icon: string
    emptyHome: string
    emptyPlannerTitle: string
    emptyPlannerHint: string
    sceneTint: string
    cardBg: string
  }
> = {
  breakfast: {
    icon: '☀️',
    emptyHome: 'Nothing added yet',
    emptyPlannerTitle: 'No breakfast added yet',
    emptyPlannerHint: 'Tap + Add to log your breakfast',
    sceneTint: '#fdf0cf',
    cardBg: '#f8f2dc',
  },
  lunch: {
    icon: '🌤️',
    emptyHome: 'Nothing added yet',
    emptyPlannerTitle: 'No lunch added yet',
    emptyPlannerHint: 'Tap + Add to log your lunch',
    sceneTint: '#eaf2fa',
    cardBg: '#f5f2e4',
  },
  snack: {
    icon: '🌞',
    emptyHome: 'Nothing added yet',
    emptyPlannerTitle: 'No snack added yet',
    emptyPlannerHint: 'Tap + Add to log your snack',
    sceneTint: '#fde7cc',
    cardBg: '#f3e3c2',
  },
  dinner: {
    icon: '🌙',
    emptyHome: 'Plan or add dinner',
    emptyPlannerTitle: 'No dinner added yet',
    emptyPlannerHint: 'Tap + Add to log your dinner',
    sceneTint: '#e3e9f5',
    cardBg: '#e4e7ef',
  },
}
