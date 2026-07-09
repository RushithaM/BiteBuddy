import type { Food } from '../types'

/**
 * Mock food catalog. Every item currently renders as an emoji on a pastel
 * tint; real food images can later be dropped into
 * src/assets/foods/<id>.png and will be picked up automatically.
 */
export const FOODS: Food[] = [
  // Breakfast
  { id: 'masala-dosa', name: 'Masala Dosa', emoji: '🌯', tint: '#fdeccd', usualMeal: 'breakfast' },
  { id: 'aloo-paratha', name: 'Aloo Paratha', emoji: '🫓', tint: '#fbe7c6', usualMeal: 'breakfast' },
  { id: 'poha', name: 'Poha', emoji: '🍛', tint: '#fdf3c9', usualMeal: 'breakfast' },
  { id: 'oats', name: 'Oats', emoji: '🥣', tint: '#f4e8d2', usualMeal: 'breakfast' },
  { id: 'upma', name: 'Upma', emoji: '🍲', tint: '#fdeccd', usualMeal: 'breakfast' },
  { id: 'pancakes', name: 'Pancakes', emoji: '🥞', tint: '#fbe7c6', usualMeal: 'breakfast' },
  { id: 'idli-sambar', name: 'Idli Sambar', emoji: '🍥', tint: '#f4e8d2', usualMeal: 'breakfast' },

  // Lunch
  { id: 'rice', name: 'Rice', emoji: '🍚', tint: '#f0ecd8', usualMeal: 'lunch' },
  { id: 'dal', name: 'Dal', emoji: '🍲', tint: '#fdf3c9', usualMeal: 'lunch' },
  { id: 'paneer', name: 'Paneer', emoji: '🧀', tint: '#fdeccd', usualMeal: 'lunch' },
  { id: 'rajma-chawal', name: 'Rajma Chawal', emoji: '🍛', tint: '#f9e0cb', usualMeal: 'lunch' },
  { id: 'veg-pulao', name: 'Veg Pulao', emoji: '🍚', tint: '#e6f0d6', usualMeal: 'lunch' },
  { id: 'dal-chawal', name: 'Dal Chawal', emoji: '🍛', tint: '#fdf3c9', usualMeal: 'lunch' },
  { id: 'paneer-rice', name: 'Paneer Rice', emoji: '🍛', tint: '#fdeccd', usualMeal: 'lunch' },
  { id: 'khichdi', name: 'Khichdi', emoji: '🍲', tint: '#f4e8d2', usualMeal: 'lunch' },
  { id: 'curd-rice', name: 'Curd Rice', emoji: '🍚', tint: '#f0ecd8', usualMeal: 'lunch' },

  // Evening snack
  { id: 'fruits', name: 'Fruits', emoji: '🍎', tint: '#fbdfd3', usualMeal: 'snack' },
  { id: 'chai', name: 'Chai', emoji: '☕', tint: '#f4e8d2', usualMeal: 'snack' },
  { id: 'masala-chai', name: 'Masala Chai', emoji: '☕', tint: '#f9e0cb', usualMeal: 'snack' },
  { id: 'nuts', name: 'Nuts', emoji: '🥜', tint: '#fdeccd', usualMeal: 'snack' },
  { id: 'biscuits', name: 'Biscuits', emoji: '🍪', tint: '#fbe7c6', usualMeal: 'snack' },
  { id: 'samosa', name: 'Samosa', emoji: '🥟', tint: '#fdf3c9', usualMeal: 'snack' },

  // Dinner
  { id: 'veg-soup', name: 'Veg Soup', emoji: '🍜', tint: '#e6f0d6', usualMeal: 'dinner' },
  { id: 'roti-sabzi', name: 'Roti Sabzi', emoji: '🫓', tint: '#f4e8d2', usualMeal: 'dinner' },
  { id: 'dal-tadka', name: 'Dal Tadka', emoji: '🍲', tint: '#fdf3c9', usualMeal: 'dinner' },
  { id: 'pulao', name: 'Pulao', emoji: '🍚', tint: '#f0ecd8', usualMeal: 'dinner' },
  { id: 'vegetable-pulao', name: 'Vegetable Pulao', emoji: '🥗', tint: '#e6f0d6', usualMeal: 'dinner' },
  { id: 'salad', name: 'Salad', emoji: '🥗', tint: '#e2f0d3', usualMeal: 'dinner' },
]

const byId = new Map(FOODS.map((f) => [f.id, f]))

export function getFood(id: string): Food {
  const food = byId.get(id)
  if (food) return food
  return { id, name: id, emoji: '🍽️', tint: '#f0ecd8', usualMeal: 'lunch' }
}
