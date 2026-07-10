import type { Food, FoodIconId } from '../types'

/**
 * Mock food catalog. Each item maps to one of the predefined food icons in
 * src/assets/food-icons/; users pick from the same set when adding food.
 */
export const FOODS: Food[] = [
  // Breakfast
  { id: 'dosa', name: 'Dosa', emoji: '🌯', tint: '#fdeccd', iconId: 'icon-sandwich', usualMeal: 'breakfast' },
  { id: 'chutney', name: 'Chutney', emoji: '🥣', tint: '#fdf3c9', iconId: 'icon-soup', usualMeal: 'breakfast' },
  { id: 'sambar', name: 'Sambar', emoji: '🍲', tint: '#e6f0d6', iconId: 'icon-soup', usualMeal: 'breakfast' },
  { id: 'masala-dosa', name: 'Masala Dosa', emoji: '🌯', tint: '#fdeccd', iconId: 'icon-sandwich', usualMeal: 'breakfast' },
  { id: 'aloo-paratha', name: 'Aloo Paratha', emoji: '🫓', tint: '#fbe7c6', iconId: 'icon-pancakes', usualMeal: 'breakfast' },
  { id: 'poha', name: 'Poha', emoji: '🍛', tint: '#fdf3c9', iconId: 'icon-oatmeal-bowl', usualMeal: 'breakfast' },
  { id: 'oats', name: 'Oats', emoji: '🥣', tint: '#f4e8d2', iconId: 'icon-oatmeal-bowl', usualMeal: 'breakfast' },
  { id: 'upma', name: 'Upma', emoji: '🍲', tint: '#fdeccd', iconId: 'icon-oatmeal-bowl', usualMeal: 'breakfast' },
  { id: 'pancakes', name: 'Pancakes', emoji: '🥞', tint: '#fbe7c6', iconId: 'icon-pancakes', usualMeal: 'breakfast' },
  { id: 'idli-sambar', name: 'Idli Sambar', emoji: '🍥', tint: '#f4e8d2', iconId: 'icon-oatmeal-bowl', usualMeal: 'breakfast' },
  { id: 'boiled-egg', name: 'Boiled Egg', emoji: '🥚', tint: '#fdf3c9', iconId: 'icon-egg', usualMeal: 'breakfast' },

  // Lunch
  { id: 'rice', name: 'Rice', emoji: '🍚', tint: '#f0ecd8', iconId: 'icon-avocado-bowl', usualMeal: 'lunch' },
  { id: 'dal', name: 'Dal', emoji: '🍲', tint: '#fdf3c9', iconId: 'icon-soup', usualMeal: 'lunch' },
  { id: 'paneer', name: 'Paneer', emoji: '🧀', tint: '#fdeccd', iconId: 'icon-burger', usualMeal: 'lunch' },
  { id: 'rajma-chawal', name: 'Rajma Chawal', emoji: '🍛', tint: '#f9e0cb', iconId: 'icon-soup', usualMeal: 'lunch' },
  { id: 'veg-pulao', name: 'Veg Pulao', emoji: '🍚', tint: '#e6f0d6', iconId: 'icon-avocado-bowl', usualMeal: 'lunch' },
  { id: 'dal-chawal', name: 'Dal Chawal', emoji: '🍛', tint: '#fdf3c9', iconId: 'icon-soup', usualMeal: 'lunch' },
  { id: 'paneer-rice', name: 'Paneer Rice', emoji: '🍛', tint: '#fdeccd', iconId: 'icon-avocado-bowl', usualMeal: 'lunch' },
  { id: 'khichdi', name: 'Khichdi', emoji: '🍲', tint: '#f4e8d2', iconId: 'icon-oatmeal-bowl', usualMeal: 'lunch' },
  { id: 'curd-rice', name: 'Curd Rice', emoji: '🍚', tint: '#f0ecd8', iconId: 'icon-milk', usualMeal: 'lunch' },

  // Evening snack
  { id: 'fruits', name: 'Fruits', emoji: '🍎', tint: '#fbdfd3', iconId: 'icon-raspberries', usualMeal: 'snack' },
  { id: 'chai', name: 'Chai', emoji: '☕', tint: '#f4e8d2', iconId: 'icon-milk', usualMeal: 'snack' },
  { id: 'masala-chai', name: 'Masala Chai', emoji: '☕', tint: '#f9e0cb', iconId: 'icon-milk', usualMeal: 'snack' },
  { id: 'nuts', name: 'Nuts', emoji: '🥜', tint: '#fdeccd', iconId: 'icon-raspberries', usualMeal: 'snack' },
  { id: 'biscuits', name: 'Biscuits', emoji: '🍪', tint: '#fbe7c6', iconId: 'icon-pizza', usualMeal: 'snack' },
  { id: 'samosa', name: 'Samosa', emoji: '🥟', tint: '#fdf3c9', iconId: 'icon-pizza', usualMeal: 'snack' },

  // Dinner
  { id: 'veg-soup', name: 'Veg Soup', emoji: '🍜', tint: '#e6f0d6', iconId: 'icon-soup', usualMeal: 'dinner' },
  { id: 'roti-sabzi', name: 'Roti Sabzi', emoji: '🫓', tint: '#f4e8d2', iconId: 'icon-sandwich', usualMeal: 'dinner' },
  { id: 'dal-tadka', name: 'Dal Tadka', emoji: '🍲', tint: '#fdf3c9', iconId: 'icon-soup', usualMeal: 'dinner' },
  { id: 'pulao', name: 'Pulao', emoji: '🍚', tint: '#f0ecd8', iconId: 'icon-avocado-bowl', usualMeal: 'dinner' },
  { id: 'vegetable-pulao', name: 'Vegetable Pulao', emoji: '🥗', tint: '#e6f0d6', iconId: 'icon-avocado-bowl', usualMeal: 'dinner' },
  { id: 'salad', name: 'Salad', emoji: '🥗', tint: '#e2f0d3', iconId: 'icon-avocado-bowl', usualMeal: 'dinner' },
]

const byId = new Map(FOODS.map((f) => [f.id, f]))

export function getFood(id: string): Food {
  const food = byId.get(id)
  if (food) return food
  if (id === 'custom') {
    return {
      id: 'custom',
      name: 'Custom food',
      emoji: '🍽️',
      tint: '#f0ecd8',
      iconId: 'icon-oatmeal-bowl' as FoodIconId,
      usualMeal: 'lunch',
    }
  }
  return {
    id,
    name: id,
    emoji: '🍽️',
    tint: '#f0ecd8',
    iconId: 'icon-oatmeal-bowl' as FoodIconId,
    usualMeal: 'lunch',
  }
}

export function getFoodDisplayName(foodId: string, customName?: string) {
  return customName?.trim() || getFood(foodId).name
}

export function resolveItemIcon(foodId: string, iconId?: FoodIconId): FoodIconId {
  return iconId ?? getFood(foodId).iconId
}
