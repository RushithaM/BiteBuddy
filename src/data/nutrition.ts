import type { MealType } from '../types'
import { FOODS, getFood, getFoodDisplayName } from './foods'
import type { MealItem } from '../types'

export interface FoodNutrition {
  calories: number
  carbs: number
  protein: number
  fats: number
  fiber: number
  /** e.g. plate, bowl, cup */
  portionUnit: string
}

const DEFAULT: FoodNutrition = {
  calories: 250,
  carbs: 35,
  protein: 8,
  fats: 9,
  fiber: 4,
  portionUnit: 'plate',
}

/** Per-serving nutrition (mock data aligned with the reference designs). */
const NUTRITION: Record<string, Partial<FoodNutrition>> = {
  'masala-dosa': { calories: 350, carbs: 42, protein: 8, fats: 14, fiber: 3, portionUnit: 'plate' },
  dosa: { calories: 180, carbs: 28, protein: 4, fats: 6, fiber: 2, portionUnit: 'piece' },
  chutney: { calories: 40, carbs: 6, protein: 1, fats: 2, fiber: 1, portionUnit: 'tbsp' },
  sambar: { calories: 130, carbs: 18, protein: 5, fats: 4, fiber: 4, portionUnit: 'bowl' },
  poha: { calories: 250, carbs: 44, protein: 5, fats: 6, fiber: 3, portionUnit: 'plate' },
  'aloo-paratha': { calories: 320, carbs: 38, protein: 7, fats: 15, fiber: 4, portionUnit: 'piece' },
  oats: { calories: 280, carbs: 40, protein: 9, fats: 6, fiber: 5, portionUnit: 'bowl' },
  upma: { calories: 200, carbs: 32, protein: 5, fats: 6, fiber: 3, portionUnit: 'plate' },
  'boiled-egg': { calories: 78, carbs: 1, protein: 6, fats: 5, fiber: 0, portionUnit: 'piece' },
  pancakes: { calories: 290, carbs: 44, protein: 7, fats: 10, fiber: 2, portionUnit: 'piece' },
  'idli-sambar': { calories: 240, carbs: 42, protein: 8, fats: 4, fiber: 4, portionUnit: 'plate' },
  rice: { calories: 210, carbs: 45, protein: 4, fats: 2, fiber: 1, portionUnit: 'bowl' },
  dal: { calories: 180, carbs: 24, protein: 10, fats: 5, fiber: 6, portionUnit: 'bowl' },
  paneer: { calories: 270, carbs: 8, protein: 14, fats: 20, fiber: 1, portionUnit: 'bowl' },
  'rajma-chawal': { calories: 380, carbs: 52, protein: 14, fats: 10, fiber: 8, portionUnit: 'plate' },
  'dal-chawal': { calories: 340, carbs: 50, protein: 12, fats: 8, fiber: 5, portionUnit: 'plate' },
  fruits: { calories: 120, carbs: 28, protein: 2, fats: 1, fiber: 4, portionUnit: 'bowl' },
  chai: { calories: 90, carbs: 12, protein: 3, fats: 4, fiber: 0, portionUnit: 'cup' },
  'masala-chai': { calories: 110, carbs: 14, protein: 3, fats: 5, fiber: 0, portionUnit: 'cup' },
  biscuits: { calories: 160, carbs: 22, protein: 3, fats: 7, fiber: 1, portionUnit: 'piece' },
  samosa: { calories: 260, carbs: 28, protein: 5, fats: 14, fiber: 2, portionUnit: 'piece' },
  'veg-soup': { calories: 140, carbs: 18, protein: 5, fats: 5, fiber: 4, portionUnit: 'bowl' },
  'roti-sabzi': { calories: 310, carbs: 40, protein: 9, fats: 12, fiber: 6, portionUnit: 'plate' },
  salad: { calories: 150, carbs: 14, protein: 5, fats: 8, fiber: 5, portionUnit: 'bowl' },
}

export interface MealComponentLine {
  name: string
  quantity: string
}

/** @deprecated Use meal items directly — each food is its own logged entry. */
const FOOD_COMPONENTS: Record<string, MealComponentLine[]> = {}

export function getMealComponentLines(items: MealItem[]): MealComponentLine[] {
  if (items.length === 1) {
    const breakdown = FOOD_COMPONENTS[items[0].foodId]
    if (breakdown) return breakdown
  }
  return items.map((item) => {
    const nutrition = getFoodNutrition(item.foodId)
    return {
      name: getFoodDisplayName(item.foodId, item.customName),
      quantity: item.quantity ?? `1 ${nutrition.portionUnit}`,
    }
  })
}

export function itemQuantityLabel(item: MealItem): string {
  const nutrition = getFoodNutrition(item.foodId)
  return item.quantity ?? `1 ${nutrition.portionUnit}`
}

export function aggregateMealNutrition(items: MealItem[]): FoodNutrition {
  const total: FoodNutrition = {
    calories: 0,
    carbs: 0,
    protein: 0,
    fats: 0,
    fiber: 0,
    portionUnit: 'serving',
  }
  for (const item of items) {
    const n = getItemNutrition(item)
    total.calories += n.calories
    total.carbs += n.carbs
    total.protein += n.protein
    total.fats += n.fats
    total.fiber += n.fiber
  }
  return total
}

function quantityMultiplierFromLabel(label: string): number {
  if (label.startsWith('½ ')) return 0.5
  if (label.startsWith('1½ ')) return 1.5
  const match = label.match(/^([\d.]+)/)
  if (match) return parseFloat(match[1])
  return 1
}

/** Nutrition for a logged item, scaled by its stored quantity. */
export function getItemNutrition(item: MealItem): FoodNutrition {
  const base = getFoodNutrition(item.foodId)
  const mult = quantityMultiplierFromLabel(itemQuantityLabel(item))
  return scaleNutrition(base, mult)
}

export function getFoodNutrition(foodId: string): FoodNutrition {
  const food = getFood(foodId)
  const base = NUTRITION[foodId] ?? {}
  const usual = food.usualMeal
  const portionUnit =
    base.portionUnit ??
    (usual === 'snack' ? 'cup' : usual === 'lunch' ? 'bowl' : 'plate')

  return { ...DEFAULT, portionUnit, ...base }
}

/** Overlay per-food nutrition fetched from the API onto the local table. */
export function applyCatalogNutrition(
  rows: { id: string; calories: number; carbs: number; protein: number; fats: number; fiber: number; portionUnit: string }[],
) {
  for (const r of rows) {
    NUTRITION[r.id] = {
      calories: r.calories,
      carbs: r.carbs,
      protein: r.protein,
      fats: r.fats,
      fiber: r.fiber,
      portionUnit: r.portionUnit,
    }
  }
}

export function scaleNutrition(n: FoodNutrition, multiplier: number): FoodNutrition {
  return {
    portionUnit: n.portionUnit,
    calories: Math.round(n.calories * multiplier),
    carbs: Math.round(n.carbs * multiplier),
    protein: Math.round(n.protein * multiplier),
    fats: Math.round(n.fats * multiplier),
    fiber: Math.round(n.fiber * multiplier),
  }
}

/** Quantity steps shown on the portion picker (in portions). */
export const QUANTITY_STEPS = [0.5, 1, 1.5, 2, 2.5, 3] as const

export function formatPortion(amount: number, unit: string): string {
  if (amount === 0.5) return `½ ${unit}`
  if (amount === 1) return `1 ${unit}`
  if (amount === 1.5) return `1½ ${unit}s`
  return `${amount} ${unit}s`
}

export const MEAL_TAB_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  snack: 'Snack',
  dinner: 'Dinner',
}

/** Curated popular picks shown on the Add meal screen (matches design board). */
const POPULAR_FOOD_IDS: Record<MealType, { id: string; label?: string }[]> = {
  breakfast: [
    { id: 'dosa' },
    { id: 'poha' },
    { id: 'oats', label: 'Oats with Fruits' },
    { id: 'upma', label: 'Masala Upma' },
    { id: 'boiled-egg' },
  ],
  lunch: [
    { id: 'rice' },
    { id: 'dal' },
    { id: 'paneer' },
    { id: 'dal-chawal' },
    { id: 'rajma-chawal' },
  ],
  snack: [
    { id: 'fruits' },
    { id: 'masala-chai' },
    { id: 'biscuits' },
    { id: 'samosa' },
    { id: 'nuts' },
  ],
  dinner: [
    { id: 'roti-sabzi' },
    { id: 'veg-soup' },
    { id: 'dal-tadka' },
    { id: 'salad' },
    { id: 'pulao' },
  ],
}

export type PopularFoodRow = { id: string; name: string }

/** Popular picks for the Add Food screen when not searching. */
export function popularFoodsForMeal(meal: MealType): PopularFoodRow[] {
  return POPULAR_FOOD_IDS[meal].map(({ id, label }) => ({
    id,
    name: label ?? getFood(id).name,
  }))
}

/** All foods for a meal type (View all). */
export function allFoodsForMeal(meal: MealType): PopularFoodRow[] {
  return FOODS.filter((f) => f.usualMeal === meal).map((f) => ({ id: f.id, name: f.name }))
}
