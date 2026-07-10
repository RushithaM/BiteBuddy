import { useEffect, useMemo, useState } from 'react'
import { CloudSun, Leaf, Moon, Plus, Search, SlidersHorizontal, Sun, Sunset } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Screen, SubHeader } from '../components/Screen'
import { FoodIcon } from '../components/FoodIcon'
import { FoodIconPickerSheet } from '../components/FoodIconPickerSheet'
import { FOODS, getFood } from '../data/foods'
import {
  allFoodsForMeal,
  getFoodNutrition,
  MEAL_TAB_LABELS,
  popularFoodsForMeal,
} from '../data/nutrition'
import { showToast } from '../components/toast'
import { MEAL_TYPES, type MealType, type FoodIconId } from '../types'
import { addFoodQuery, useAddFoodParams } from '../lib/addFoodParams'

const MEAL_TAB_ICONS = {
  breakfast: Sun,
  lunch: CloudSun,
  snack: Sunset,
  dinner: Moon,
} as const

/**
 * Add meal — meal cards, search, popular list, and custom food entry.
 */
export function AddFood() {
  const navigate = useNavigate()
  const { date, meal: initialMeal, mode, returnTo } = useAddFoodParams()
  const [params] = useSearchParams()
  const [meal, setMeal] = useState<MealType>(initialMeal)
  const [query, setQuery] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [customOpen, setCustomOpen] = useState(false)
  const [customName, setCustomName] = useState('')

  const wantsCustom = params.get('custom') === '1'

  useEffect(() => {
    if (wantsCustom) setCustomOpen(true)
  }, [wantsCustom])

  useEffect(() => {
    setShowAll(false)
  }, [meal])

  const isSearching = query.trim().length > 0

  const foods = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q) {
      return FOODS.filter((f) => f.name.toLowerCase().includes(q)).map((f) => ({
        id: f.id,
        name: f.name,
      }))
    }
    return showAll ? allFoodsForMeal(meal) : popularFoodsForMeal(meal)
  }, [query, meal, showAll])

  const openFood = (foodId: string) => {
    navigate(`/add/${foodId}/quantity?${addFoodQuery({ date, meal, mode, returnTo })}`)
  }

  const openCustomQuantity = (iconId: FoodIconId, name?: string) => {
    if (!name?.trim()) return
    setCustomOpen(false)
    setCustomName('')
    navigate(
      `/add/custom/quantity?${addFoodQuery({ date, meal, mode, returnTo }, { name: name.trim(), iconId })}`,
    )
  }

  return (
    <Screen className="flex min-h-dvh flex-col">
      <SubHeader title="Add meal" />

      <div className="grid grid-cols-4 gap-2">
        {MEAL_TYPES.map((m) => {
          const selected = m === meal
          const TabIcon = MEAL_TAB_ICONS[m]
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMeal(m)}
              className={`flex flex-col items-center rounded-2xl border-2 px-1 py-3 transition-colors ${
                selected
                  ? 'border-brand bg-brand-tint/40 text-brand'
                  : 'border-line-soft bg-paper text-ink active:bg-cream-dark'
              }`}
            >
              <TabIcon
                size={26}
                strokeWidth={2}
                className={selected ? 'text-brand' : 'text-ink-soft'}
              />
              <span className="mt-1.5 text-[11px] font-extrabold leading-tight">
                {MEAL_TAB_LABELS[m]}
              </span>
            </button>
          )
        })}
      </div>

      <label className="mt-4 flex h-12 items-center gap-2.5 rounded-2xl border border-line bg-paper px-4 shadow-card focus-within:border-brand">
        <Search size={18} className="shrink-0 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search food..."
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-ink outline-none placeholder:text-muted"
        />
        <button
          type="button"
          aria-label="Filter foods"
          onClick={() => showToast('Filters coming soon')}
          className="shrink-0 text-muted active:text-ink"
        >
          <SlidersHorizontal size={18} strokeWidth={2.2} />
        </button>
      </label>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-[15px] font-extrabold text-ink">
          {isSearching ? 'Results' : 'Popular'}
        </p>
        {!isSearching && !showAll && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="text-[14px] font-extrabold text-brand active:opacity-70"
          >
            View all
          </button>
        )}
        {!isSearching && showAll && (
          <button
            type="button"
            onClick={() => setShowAll(false)}
            className="text-[14px] font-extrabold text-brand active:opacity-70"
          >
            Show less
          </button>
        )}
      </div>

      <ul className="mt-2 flex-1 divide-y divide-line-soft overflow-hidden rounded-card border border-line-soft bg-paper shadow-card">
        {foods.map((food) => {
          const nutrition = getFoodNutrition(food.id)
          const iconId = getFood(food.id).iconId
          return (
            <li key={food.id}>
              <button
                type="button"
                onClick={() => openFood(food.id)}
                className="flex w-full items-center gap-3 px-3 py-3 text-left active:bg-cream-dark"
              >
                <FoodIcon id={iconId} className="h-12 w-12 shrink-0 object-contain" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold text-ink">{food.name}</span>
                  <span className="block text-[13px] font-semibold text-muted">
                    {nutrition.calories} kcal
                  </span>
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-card">
                  <Plus size={18} strokeWidth={2.8} />
                </span>
              </button>
            </li>
          )
        })}
        {foods.length === 0 && (
          <li className="px-4 py-10 text-center text-sm font-semibold text-muted">
            No foods match &ldquo;{query}&rdquo;
          </li>
        )}
      </ul>

      <button
        type="button"
        onClick={() => setCustomOpen(true)}
        className="relative mt-4 mb-2 flex w-full items-center justify-center gap-2 rounded-full bg-brand-tint py-4 text-[15px] font-extrabold text-brand active:bg-brand/15"
      >
        <span className="pointer-events-none absolute left-5 text-brand/40" aria-hidden>
          <Leaf size={18} strokeWidth={2.2} />
        </span>
        <Plus size={18} strokeWidth={2.8} />
        Create custom food
        <span className="pointer-events-none absolute right-5 text-brand/40" aria-hidden>
          <Leaf size={18} strokeWidth={2.2} className="scale-x-[-1]" />
        </span>
      </button>

      {customOpen && (
        <FoodIconPickerSheet
          open
          title="Custom food"
          customName={customName}
          onCustomNameChange={setCustomName}
          confirmLabel="Next"
          onConfirm={openCustomQuantity}
          onClose={() => {
            setCustomOpen(false)
            setCustomName('')
          }}
        />
      )}
    </Screen>
  )
}
