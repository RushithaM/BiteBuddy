import { Check, Sparkles } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Screen } from '../components/Screen'
import { PrimaryButton } from '../components/Buttons'
import { ConfettiBurst } from '../components/ConfettiBurst'
import { FoodIcon } from '../components/FoodIcon'
import { getFood } from '../data/foods'
import { MEAL_TAB_LABELS } from '../data/nutrition'
import type { ReturnTo } from '../lib/addFoodParams'
import { isReturnTo } from '../lib/addFoodParams'
import { plannerRestoreAfterAdd } from '../lib/plannerRestore'
import { MEAL_TYPES, type FoodIconId, type MealMode, type MealType } from '../types'

function isMealType(v: string | null): v is MealType {
  return MEAL_TYPES.includes(v as MealType)
}

function isMealMode(v: string | null): v is MealMode {
  return v === 'planned' || v === 'logged'
}

/** Success confirmation after adding a food item to a meal. */
export function MealAdded() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const meal = isMealType(params.get('meal')) ? (params.get('meal') as MealType) : 'breakfast'
  const mode = isMealMode(params.get('mode')) ? (params.get('mode') as MealMode) : 'logged'
  const returnTo = isReturnTo(params.get('returnTo')) ? (params.get('returnTo') as ReturnTo) : 'home'
  const date = params.get('date') ?? ''
  const foodName = params.get('foodName') ?? 'Food'
  const foodId = params.get('foodId')
  const iconId = params.get('iconId')

  const food = foodId ? getFood(foodId) : null
  const resolvedIconId = food?.iconId ?? (iconId as FoodIconId | null)

  const finish = () => {
    if (returnTo === 'meal' && date) {
      navigate(`/meal/${date}/${meal}?mode=${mode}`, { replace: true })
      return
    }
    if (returnTo === 'planner' && date) {
      navigate('/planner', {
        replace: true,
        state: { restore: plannerRestoreAfterAdd(date, meal, mode) },
      })
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <Screen className="flex min-h-dvh items-center justify-center px-4">
      <div className="relative w-full max-w-[340px] overflow-hidden rounded-[1.75rem] border border-line-soft bg-paper px-6 pb-6 pt-8 shadow-card">
        <ConfettiBurst />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="success-pop flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full bg-brand text-white shadow-fab">
            <Check size={36} strokeWidth={3} />
          </div>

          <h1 className="mt-5 text-[1.35rem] font-extrabold leading-snug text-ink">
            {foodName} added to
            <br />
            {MEAL_TAB_LABELS[meal]}
          </h1>

          {resolvedIconId && (
            <div className="relative mt-7 flex h-32 w-full items-center justify-center">
              <Sparkles
                size={22}
                strokeWidth={2}
                className="sparkle-pulse absolute left-[calc(50%-5.5rem)] text-amber-400"
                aria-hidden
              />
              <FoodIcon id={resolvedIconId} className="h-28 w-28 object-contain" />
              <Sparkles
                size={22}
                strokeWidth={2}
                className="sparkle-pulse absolute right-[calc(50%-5.5rem)] text-amber-400"
                style={{ animationDelay: '0.4s' }}
                aria-hidden
              />
            </div>
          )}

          <PrimaryButton type="button" className="mt-8" onClick={finish}>
            Done
          </PrimaryButton>
        </div>
      </div>
    </Screen>
  )
}
