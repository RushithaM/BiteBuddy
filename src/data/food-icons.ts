import type { FoodIconId } from '../types'

export const FOOD_ICON_OPTIONS: { id: FoodIconId; label: string; emoji: string }[] = [
  { id: 'icon-raspberries', label: 'Berries', emoji: '🍓' },
  { id: 'icon-pancakes', label: 'Pancakes', emoji: '🥞' },
  { id: 'icon-milk', label: 'Milk', emoji: '🥛' },
  { id: 'icon-oatmeal-bowl', label: 'Oatmeal bowl', emoji: '🥣' },
  { id: 'icon-egg', label: 'Egg', emoji: '🍳' },
  { id: 'icon-sandwich', label: 'Sandwich', emoji: '🥪' },
  { id: 'icon-soup', label: 'Soup', emoji: '🍲' },
  { id: 'icon-avocado-bowl', label: 'Bowl', emoji: '🥗' },
  { id: 'icon-burger', label: 'Burger', emoji: '🍔' },
  { id: 'icon-pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'icon-chicken', label: 'Chicken', emoji: '🍗' },
]

export const DEFAULT_FOOD_ICON: FoodIconId = 'icon-oatmeal-bowl'

const byId = new Map(FOOD_ICON_OPTIONS.map((o) => [o.id, o]))

export function getFoodIconMeta(id: FoodIconId) {
  return byId.get(id) ?? FOOD_ICON_OPTIONS[0]
}
