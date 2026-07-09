import { useMemo, useState } from 'react'
import { CalendarDays, Plus, Search } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Screen, SubHeader } from '../components/Screen'
import { FoodTile } from '../components/FoodTile'
import { showToast } from '../components/toast'
import { useMealActions } from '../state/useAppData'
import { FOODS } from '../data/foods'
import { MEAL_TYPES, MEAL_LABELS, type MealType } from '../types'
import { MEAL_META } from '../components/meals'
import { formatFullDate, todayISO } from '../lib/dates'

function isMealType(v: string | null): v is MealType {
  return MEAL_TYPES.includes(v as MealType)
}

/**
 * Food picker backing every "+ Add food" action. Adds to the meal/date it
 * was opened for; both are adjustable here (the FAB opens it meal-less).
 */
export function AddFood() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const date = params.get('date') ?? todayISO()
  const [meal, setMeal] = useState<MealType>(() =>
    isMealType(params.get('meal')) ? (params.get('meal') as MealType) : 'breakfast',
  )
  const [query, setQuery] = useState('')
  const { addFood } = useMealActions()

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q ? FOODS.filter((f) => f.name.toLowerCase().includes(q)) : FOODS
    // Suggested-for-this-meal first, then everything else.
    return [...list].sort(
      (a, b) => Number(b.usualMeal === meal) - Number(a.usualMeal === meal),
    )
  }, [query, meal])

  const add = (foodId: string, foodName: string) => {
    addFood(date, meal, foodId)
    showToast(`${foodName} added to ${MEAL_LABELS[meal]}`)
    navigate(-1)
  }

  return (
    <Screen>
      <SubHeader title="Add Food" />

      <div className="flex items-center justify-center gap-1.5 pb-3">
        <CalendarDays size={15} className="text-brand" />
        <span className="text-[13.5px] font-bold text-ink-soft">{formatFullDate(date)}</span>
      </div>

      {/* Meal selector */}
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {MEAL_TYPES.map((m) => (
          <button
            key={m}
            onClick={() => setMeal(m)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-bold ${
              m === meal
                ? 'border-brand bg-brand text-white'
                : 'border-line bg-paper text-ink'
            }`}
          >
            <span className="text-[13px] leading-none">{MEAL_META[m].icon}</span>
            {MEAL_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Search */}
      <label className="mt-3 flex h-12 items-center gap-3 rounded-field border border-line bg-paper px-4 shadow-card focus-within:border-brand">
        <Search size={18} className="shrink-0 text-muted" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search foods"
          className="h-full w-full bg-transparent text-[15px] font-semibold text-ink outline-none placeholder:text-muted"
        />
      </label>

      {/* Results */}
      <div className="mt-3 flex flex-col gap-2 pb-6">
        {results.map((food) => (
          <button
            key={food.id}
            onClick={() => add(food.id, food.name)}
            className="flex items-center gap-3 rounded-2xl bg-paper px-3 py-2.5 text-left shadow-card active:bg-cream-dark"
          >
            <FoodTile foodId={food.id} className="h-11 w-11" emojiClassName="text-2xl" />
            <span className="flex-1">
              <span className="block text-[15px] font-bold text-ink">{food.name}</span>
              {food.usualMeal === meal && (
                <span className="block text-xs font-semibold text-brand">Suggested</span>
              )}
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white">
              <Plus size={16} strokeWidth={2.6} />
            </span>
          </button>
        ))}
        {results.length === 0 && (
          <p className="py-8 text-center text-sm font-semibold text-muted">
            No foods match “{query}”
          </p>
        )}
      </div>
    </Screen>
  )
}
