import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Screen, SubHeader } from '../components/Screen'
import { PrimaryButton } from '../components/Buttons'
import { FoodIcon } from '../components/FoodIcon'
import { TextField } from '../components/TextField'
import { useMealActions } from '../state/useAppData'
import { getFood, getFoodDisplayName } from '../data/foods'
import {
  formatPortion,
  getFoodNutrition,
  QUANTITY_STEPS,
  scaleNutrition,
} from '../data/nutrition'
import { MEAL_LABELS, type FoodIconId } from '../types'
import { addFoodQuery, useAddFoodParams } from '../lib/addFoodParams'

const MACRO_META = [
  { key: 'carbs' as const, label: 'Carbs', color: 'bg-amber-100 text-amber-800' },
  { key: 'protein' as const, label: 'Protein', color: 'bg-sky-100 text-sky-800' },
  { key: 'fats' as const, label: 'Fats', color: 'bg-orange-100 text-orange-800' },
  { key: 'fiber' as const, label: 'Fiber', color: 'bg-lime-100 text-lime-800' },
]

/** Portion picker — quantity, macros, optional note, then add to meal. */
export function AddFoodQuantity() {
  const navigate = useNavigate()
  const { foodId } = useParams<{ foodId: string }>()
  const { date, meal, mode, customName, iconId: customIconId, returnTo } = useAddFoodParams()
  const { addFood, addCustomFood } = useMealActions()

  const isCustom = foodId === 'custom'
  const catalogFood = !isCustom && foodId ? getFood(foodId) : null
  const foodName = isCustom
    ? (customName ?? 'Custom food')
    : getFoodDisplayName(foodId ?? 'custom')
  const iconId = (isCustom ? customIconId : catalogFood?.iconId) as FoodIconId | undefined

  const baseNutrition = getFoodNutrition(isCustom ? 'custom' : (foodId ?? 'custom'))
  const [qtyIndex, setQtyIndex] = useState(1)
  const [note, setNote] = useState('')

  const multiplier = QUANTITY_STEPS[qtyIndex]
  const nutrition = scaleNutrition(baseNutrition, multiplier)
  const portionLabel = formatPortion(multiplier, baseNutrition.portionUnit)

  const stepQty = (delta: number) => {
    setQtyIndex((i) => Math.max(0, Math.min(QUANTITY_STEPS.length - 1, i + delta)))
  }

  const addToMeal = () => {
    const opts = { quantity: portionLabel, ...(note.trim() ? { note: note.trim() } : {}) }
    if (isCustom) {
      if (!customName?.trim() || !iconId) return
      addCustomFood(date, meal, customName.trim(), iconId, mode, opts)
    } else if (foodId) {
      addFood(date, meal, foodId, mode, iconId, opts)
    }
    const qs = addFoodQuery(
      { date, meal, mode, returnTo },
      {
        foodName,
        ...(foodId && !isCustom ? { foodId } : {}),
        ...(isCustom && iconId ? { iconId } : {}),
      },
    )
    navigate(`/add/success?${qs}`, { replace: true })
  }

  return (
    <Screen className="flex min-h-dvh flex-col">
      <SubHeader title={foodName} />

      <div className="flex flex-col items-center text-center">
        {iconId && (
          <FoodIcon id={iconId} className="h-28 w-28 object-contain" />
        )}
        <p className="mt-2 text-[28px] font-extrabold text-ink">{nutrition.calories} kcal</p>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {MACRO_META.map(({ key, label, color }) => (
          <div
            key={key}
            className={`flex flex-col items-center rounded-card px-2 py-3 ${color}`}
          >
            <span className="text-lg font-extrabold">{nutrition[key]}g</span>
            <span className="mt-0.5 text-[11px] font-bold">{label}</span>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <p className="mb-2 text-[14px] font-extrabold text-ink">Quantity</p>
        <div className="flex items-center justify-between rounded-card border border-line-soft bg-paper px-4 py-3 shadow-card">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => stepQty(-1)}
            disabled={qtyIndex === 0}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-dark text-ink disabled:opacity-40"
          >
            <Minus size={20} />
          </button>
          <span className="text-[17px] font-extrabold text-ink">{portionLabel}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => stepQty(1)}
            disabled={qtyIndex === QUANTITY_STEPS.length - 1}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-tint text-brand"
          >
            <Plus size={20} strokeWidth={2.6} />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[14px] font-extrabold text-ink">Additional info</p>
        <TextField
          icon={<span className="text-base">📝</span>}
          placeholder="Optional notes"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div className="mt-auto pb-6 pt-8">
        <PrimaryButton type="button" onClick={addToMeal}>
          Add to {MEAL_LABELS[meal]}
        </PrimaryButton>
      </div>
    </Screen>
  )
}
