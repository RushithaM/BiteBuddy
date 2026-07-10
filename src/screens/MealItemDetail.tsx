import { useMemo } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Screen, SubHeader } from '../components/Screen'
import { FoodIcon } from '../components/FoodIcon'
import { getFoodImageUrl } from '../components/FoodTile'
import { getFoodDisplayName } from '../data/foods'
import { getFoodNutrition, itemQuantityLabel } from '../data/nutrition'
import { getMealSlot, itemsForMode } from '../lib/mealPlans'
import { usePlans } from '../state/useAppData'
import { MEAL_TYPES, type MealMode, type MealType } from '../types'

const MACRO_RINGS = [
  { key: 'carbs' as const, label: 'Carbs', ring: 'border-amber-300 bg-amber-50 text-amber-900' },
  { key: 'protein' as const, label: 'Protein', ring: 'border-sky-300 bg-sky-50 text-sky-900' },
  { key: 'fats' as const, label: 'Fats', ring: 'border-orange-300 bg-orange-50 text-orange-900' },
  { key: 'fiber' as const, label: 'Fiber', ring: 'border-lime-300 bg-lime-50 text-lime-900' },
]

function isMealType(v: string | undefined): v is MealType {
  return MEAL_TYPES.includes(v as MealType)
}

function isMealMode(v: string | null): v is MealMode {
  return v === 'planned' || v === 'logged'
}

/** Single food item within a meal — calories, macros, quantity. */
export function MealItemDetail() {
  const navigate = useNavigate()
  const { date, meal: mealParam, itemId } = useParams<{
    date: string
    meal: string
    itemId: string
  }>()
  const [searchParams] = useSearchParams()
  const mode: MealMode = isMealMode(searchParams.get('mode'))
    ? (searchParams.get('mode') as MealMode)
    : 'logged'

  const plans = usePlans()

  const item = useMemo(() => {
    if (!date || !isMealType(mealParam) || !itemId) return undefined
    const slot = getMealSlot(plans[date], mealParam)
    return itemsForMode(slot, mode).find((i) => i.id === itemId)
  }, [date, mealParam, itemId, mode, plans])

  const nutrition = useMemo(
    () => (item ? getFoodNutrition(item.foodId) : null),
    [item],
  )

  if (!date || !isMealType(mealParam) || !itemId) {
    return <Navigate to="/" replace />
  }

  const meal = mealParam

  if (!item || !nutrition) {
    return <Navigate to={`/meal/${date}/${meal}?mode=${mode}`} replace />
  }

  const name = getFoodDisplayName(item.foodId, item.customName)
  const heroPhoto = getFoodImageUrl(item.foodId)
  const quantity = itemQuantityLabel(item)

  return (
    <Screen className="pb-6">
      <SubHeader
        title={name}
        onBack={() => navigate(`/meal/${date}/${meal}?mode=${mode}`)}
      />

      <div className="flex flex-col items-center text-center">
        {heroPhoto ? (
          <img src={heroPhoto} alt="" className="h-36 w-36 rounded-card object-cover shadow-card" />
        ) : (
          <FoodIcon id={item.iconId} className="h-32 w-32 object-contain" />
        )}
        <p className="mt-4 text-[28px] font-extrabold text-ink">{nutrition.calories} kcal</p>
      </div>

      <div className="mt-4 flex justify-center gap-3">
        {MACRO_RINGS.map(({ key, label, ring }) => (
          <div
            key={key}
            className={`flex h-[4.25rem] w-[4.25rem] flex-col items-center justify-center rounded-full border-2 ${ring}`}
          >
            <span className="text-[15px] font-extrabold leading-none">{nutrition[key]}g</span>
            <span className="mt-1 text-[10px] font-bold">{label}</span>
          </div>
        ))}
      </div>

      <section className="mt-6">
        <h2 className="text-[15px] font-extrabold text-ink">Quantity</h2>
        <div className="mt-2 rounded-card border border-line-soft bg-paper px-4 py-3.5 text-center shadow-card">
          <span className="text-[17px] font-extrabold text-ink">{quantity}</span>
        </div>
      </section>

      {item.note && (
        <section className="mt-4">
          <h2 className="text-[15px] font-extrabold text-ink">Notes</h2>
          <p className="mt-2 rounded-card border border-line-soft bg-paper px-4 py-3 text-[15px] font-semibold text-ink-soft shadow-card">
            {item.note}
          </p>
        </section>
      )}
    </Screen>
  )
}
