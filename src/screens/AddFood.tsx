import { useMemo, useState } from 'react'
import { CalendarDays, Plus, Search } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Screen, SubHeader } from '../components/Screen'
import { FoodIcon } from '../components/FoodIcon'
import { FoodIconPickerSheet } from '../components/FoodIconPickerSheet'
import { PlanLogToggle } from '../components/PlanLogToggle'
import { showToast } from '../components/toast'
import { useMealActions } from '../state/useAppData'
import { FOODS, getFood } from '../data/foods'
import {
  MEAL_TYPES,
  MEAL_LABELS,
  MEAL_MODE_LABELS,
  type MealType,
  type FoodIconId,
  type MealMode,
} from '../types'
import { MEAL_META } from '../components/meals'
import { formatFullDate, todayISO } from '../lib/dates'

function isMealType(v: string | null): v is MealType {
  return MEAL_TYPES.includes(v as MealType)
}

function isMealMode(v: string | null): v is MealMode {
  return v === 'planned' || v === 'logged'
}

type PendingAdd =
  | { kind: 'catalog'; foodId: string; foodName: string; iconId: FoodIconId }
  | { kind: 'custom' }

/**
 * Food picker backing every "+ Add food" action. Users pick planning vs logging
 * first; catalog picks open the icon sheet before saving.
 */
export function AddFood() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const date = params.get('date') ?? todayISO()
  const [meal, setMeal] = useState<MealType>(() =>
    isMealType(params.get('meal')) ? (params.get('meal') as MealType) : 'breakfast',
  )
  const [mode, setMode] = useState<MealMode>(() =>
    isMealMode(params.get('mode')) ? (params.get('mode') as MealMode) : 'planned',
  )
  const [query, setQuery] = useState('')
  const [pending, setPending] = useState<PendingAdd | null>(null)
  const [customName, setCustomName] = useState('')
  const { addFood, addCustomFood } = useMealActions()

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q ? FOODS.filter((f) => f.name.toLowerCase().includes(q)) : FOODS
    return [...list].sort(
      (a, b) => Number(b.usualMeal === meal) - Number(a.usualMeal === meal),
    )
  }, [query, meal])

  const confirmAdd = (iconId: FoodIconId, name?: string) => {
    if (!pending) return
    const modeLabel = MEAL_MODE_LABELS[mode].toLowerCase()
    if (pending.kind === 'custom') {
      if (!name) return
      addCustomFood(date, meal, name, iconId, mode)
      showToast(`${name} added to ${MEAL_LABELS[meal]} (${modeLabel})`)
    } else {
      addFood(date, meal, pending.foodId, mode, iconId)
      showToast(`${pending.foodName} added to ${MEAL_LABELS[meal]} (${modeLabel})`)
    }
    setPending(null)
    setCustomName('')
    navigate(-1)
  }

  const openCatalog = (foodId: string) => {
    const food = getFood(foodId)
    setPending({ kind: 'catalog', foodId, foodName: food.name, iconId: food.iconId })
  }

  const openCustom = () => {
    setCustomName('')
    setPending({ kind: 'custom' })
  }

  return (
    <Screen>
      <SubHeader title="Add Food" />

      <div className="flex items-center justify-center gap-1.5 pb-3">
        <CalendarDays size={15} className="text-brand" />
        <span className="text-[13.5px] font-bold text-brand">{formatFullDate(date)}</span>
      </div>

      <PlanLogToggle value={mode} onChange={setMode} />

      <p className="mt-3 text-center text-[13px] font-semibold text-muted">
        {mode === 'planned'
          ? 'Adding to your plan for later'
          : 'Logging what you already ate'}
      </p>

      <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1">
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

      <button
        type="button"
        onClick={openCustom}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand/40 bg-brand-tint/40 px-4 py-3 text-sm font-extrabold text-brand active:bg-brand-tint"
      >
        <Plus size={16} strokeWidth={2.8} />
        Add custom food
      </button>

      <div className="mt-3 flex flex-col gap-2 pb-6">
        {results.map((food) => (
          <button
            key={food.id}
            onClick={() => openCatalog(food.id)}
            className="flex items-center gap-3 rounded-2xl bg-paper px-3 py-2.5 text-left shadow-card active:bg-cream-dark"
          >
            <FoodIcon id={food.iconId} className="h-12 w-12 shrink-0 object-contain" />
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

      {pending?.kind === 'catalog' && (
        <FoodIconPickerSheet
          open
          title={`Icon for ${pending.foodName}`}
          initialIconId={pending.iconId}
          confirmLabel="Add food"
          onConfirm={confirmAdd}
          onClose={() => setPending(null)}
        />
      )}

      {pending?.kind === 'custom' && (
        <FoodIconPickerSheet
          open
          title="Add custom food"
          customName={customName}
          onCustomNameChange={setCustomName}
          confirmLabel="Add food"
          onConfirm={confirmAdd}
          onClose={() => {
            setPending(null)
            setCustomName('')
          }}
        />
      )}
    </Screen>
  )
}
