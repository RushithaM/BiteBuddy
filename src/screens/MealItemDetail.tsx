import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Dumbbell, Droplet, Heart, Leaf, Minus, Plus, Wheat } from 'lucide-react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { FoodIcon } from '../components/FoodIcon'
import { getFoodImageUrl } from '../components/FoodTile'
import { Illustration } from '../components/Illustration'
import { showToast } from '../components/toast'
import { getFoodDisplayName } from '../data/foods'
import {
  formatPortion,
  getFoodNutrition,
  itemQuantityLabel,
  QUANTITY_STEPS,
  quantityStepIndexFromLabel,
} from '../data/nutrition'
import { getMealSlot, itemsForMode } from '../lib/mealPlans'
import { useMealActions, usePlans } from '../state/useAppData'
import { MEAL_TYPES, type MealMode, type MealType } from '../types'

const MACRO_CARDS = [
  {
    key: 'carbs' as const,
    label: 'Carbs',
    Icon: Wheat,
    card: 'bg-[#fff6e4]',
    iconWrap: 'bg-[#fdeccd] text-[#c4881a]',
    value: 'text-[#8a5a08]',
  },
  {
    key: 'protein' as const,
    label: 'Protein',
    Icon: Dumbbell,
    card: 'bg-[#eaf3fc]',
    iconWrap: 'bg-[#d6e8f8] text-[#2563b8]',
    value: 'text-[#1e4f96]',
  },
  {
    key: 'fats' as const,
    label: 'Fats',
    Icon: Droplet,
    card: 'bg-[#fceee6]',
    iconWrap: 'bg-[#f8ddd0] text-[#c45c1a]',
    value: 'text-[#9a4212]',
  },
  {
    key: 'fiber' as const,
    label: 'Fiber',
    Icon: Leaf,
    card: 'bg-[#eef6e4]',
    iconWrap: 'bg-[#dcecc8] text-[#4c9b50]',
    value: 'text-[#35753a]',
  },
]

function isMealType(v: string | undefined): v is MealType {
  return MEAL_TYPES.includes(v as MealType)
}

function isMealMode(v: string | null): v is MealMode {
  return v === 'planned' || v === 'logged'
}

/** Single food item within a meal — hero art, per-serving nutrition, quantity. */
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
  const { updateItem } = useMealActions()
  const [favorited, setFavorited] = useState(false)

  const item = useMemo(() => {
    if (!date || !isMealType(mealParam) || !itemId) return undefined
    const slot = getMealSlot(plans[date], mealParam)
    return itemsForMode(slot, mode).find((i) => i.id === itemId)
  }, [date, mealParam, itemId, mode, plans])

  const baseNutrition = useMemo(
    () => (item ? getFoodNutrition(item.foodId) : null),
    [item],
  )

  const [qtyIndex, setQtyIndex] = useState(1)

  useEffect(() => {
    if (!item) return
    setQtyIndex(quantityStepIndexFromLabel(itemQuantityLabel(item)))
  }, [item?.id, item?.quantity])

  if (!date || !isMealType(mealParam) || !itemId) {
    return <Navigate to="/" replace />
  }

  const meal = mealParam

  if (!item || !baseNutrition) {
    return <Navigate to={`/meal/${date}/${meal}?mode=${mode}`} replace />
  }

  const name = getFoodDisplayName(item.foodId, item.customName)
  const heroPhoto = getFoodImageUrl(item.foodId)
  const portionLabel = formatPortion(QUANTITY_STEPS[qtyIndex], baseNutrition.portionUnit)
  const perUnit = baseNutrition.portionUnit

  const stepQty = (delta: number) => {
    const next = Math.max(0, Math.min(QUANTITY_STEPS.length - 1, qtyIndex + delta))
    if (next === qtyIndex) return
    setQtyIndex(next)
    updateItem(date, meal, itemId, mode, {
      quantity: formatPortion(QUANTITY_STEPS[next], baseNutrition.portionUnit),
    })
  }

  const toggleFavorite = () => {
    setFavorited((v) => !v)
    showToast(favorited ? 'Removed from favorites' : 'Saved to favorites')
  }

  return (
    <div className="pt-safe h-dvh overflow-hidden bg-cream">
      <div className="mx-auto flex h-full max-w-md flex-col px-5">
        <header className="flex h-14 shrink-0 items-center justify-between">
          <button
            aria-label="Back"
            onClick={() => navigate(`/meal/${date}/${meal}?mode=${mode}`)}
            className="-ml-1 flex h-10 w-10 items-center justify-center rounded-full border border-line-soft bg-paper text-ink shadow-card active:bg-cream-dark"
          >
            <ArrowLeft size={22} strokeWidth={2.2} />
          </button>
          <h1 className="text-[22px] font-extrabold text-brand-deep">{name}</h1>
          <button
            type="button"
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={favorited}
            onClick={toggleFavorite}
            className="flex h-10 w-10 items-center justify-center rounded-full text-brand active:bg-brand-tint"
          >
            <Heart
              size={22}
              strokeWidth={2.2}
              className={favorited ? 'fill-brand text-brand' : undefined}
            />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="relative mx-auto mt-1 w-[92%] max-w-[21rem]">
              <Illustration
                name="item-detail-frame"
                className="block w-full object-contain"
              />
              <div className="absolute inset-[11%] flex items-center justify-center">
                {heroPhoto ? (
                  <img
                    src={heroPhoto}
                    alt=""
                    className="h-full w-full object-contain drop-shadow-sm"
                  />
                ) : (
                  <FoodIcon id={item.iconId} className="h-[76%] w-[76%] object-contain" />
                )}
              </div>
            </div>

            <div className="relative z-10 -mt-4 mx-auto w-fit min-w-[9.5rem] rounded-[1.25rem] bg-brand-tint px-8 py-3 text-center shadow-card">
              <p className="text-[28px] font-extrabold leading-none text-brand-deep">
                {baseNutrition.calories} kcal
              </p>
              <p className="mt-1 text-[13px] font-semibold capitalize text-ink-soft">
                Per {perUnit}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">
              {MACRO_CARDS.map(({ key, label, Icon, card, iconWrap, value }) => (
                <div
                  key={key}
                  className={`flex flex-col items-center rounded-[1.1rem] px-1.5 py-3 ${card}`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${iconWrap}`}
                  >
                    <Icon size={15} strokeWidth={2.3} />
                  </span>
                  <span className={`mt-2 text-[16px] font-extrabold leading-none ${value}`}>
                    {baseNutrition[key]}g
                  </span>
                  <span className="mt-1 text-[11px] font-bold text-ink-soft">{label}</span>
                </div>
              ))}
            </div>

            <section className="mt-5">
              <h2 className="text-[15px] font-extrabold text-ink">Quantity</h2>
              <div className="mt-2.5 flex items-center justify-between rounded-full border border-line-soft bg-paper px-3 py-2.5 shadow-card">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => stepQty(-1)}
                  disabled={qtyIndex === 0}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-cream-dark text-ink disabled:opacity-40"
                >
                  <Minus size={20} strokeWidth={2.4} />
                </button>
                <span className="text-[17px] font-extrabold text-ink">{portionLabel}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => stepQty(1)}
                  disabled={qtyIndex === QUANTITY_STEPS.length - 1}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-tint text-brand disabled:opacity-40"
                >
                  <Plus size={20} strokeWidth={2.6} />
                </button>
              </div>
            </section>

            {item.note && (
              <section className="mt-4 pb-2">
                <h2 className="text-[15px] font-extrabold text-ink">Notes</h2>
                <p className="mt-2 rounded-card border border-line-soft bg-paper px-4 py-3 text-[15px] font-semibold text-ink-soft shadow-card">
                  {item.note}
                </p>
              </section>
            )}
          </div>

          <div className="-mx-5 shrink-0 pb-safe">
            <Illustration
              name="item-detail-footer"
              className="block w-full object-contain object-bottom"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
