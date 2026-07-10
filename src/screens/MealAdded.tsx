import { Check } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Screen } from '../components/Screen'
import { PrimaryButton } from '../components/Buttons'
import { FoodIcon } from '../components/FoodIcon'
import { getFood } from '../data/foods'
import { addFoodQuery, type ReturnTo } from '../lib/addFoodParams'
import { MEAL_LABELS, MEAL_TYPES, type FoodIconId, type MealMode, type MealType } from '../types'

function isMealType(v: string | null): v is MealType {
  return MEAL_TYPES.includes(v as MealType)
}

function isMealMode(v: string | null): v is MealMode {
  return v === 'planned' || v === 'logged'
}

function isReturnTo(v: string | null): v is ReturnTo {
  return v === 'home' || v === 'meal' || v === 'planner'
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

  const finish = () => {
    if (returnTo === 'meal' && date) {
      navigate(`/meal/${date}/${meal}?mode=${mode}`, { replace: true })
      return
    }
    if (returnTo === 'planner') {
      navigate('/planner', { replace: true })
      return
    }
    navigate('/', { replace: true })
  }

  const addAnother = () => {
    if (!date) {
      finish()
      return
    }
    navigate(`/add?${addFoodQuery({ date, meal, mode, returnTo })}`)
  }

  return (
    <Screen className="flex min-h-dvh flex-col items-center justify-center text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand text-white shadow-fab">
        <Check size={48} strokeWidth={3} />
      </div>

      <h1 className="mt-6 text-[22px] font-extrabold text-ink">
        {foodName} added to {MEAL_LABELS[meal]}
      </h1>

      {(food || iconId) && (
        <FoodIcon
          id={food?.iconId ?? (iconId as FoodIconId)}
          className="mt-8 h-32 w-32 object-contain opacity-90"
        />
      )}

      <div className="mt-auto w-full space-y-3 pb-6 pt-12">
        <PrimaryButton type="button" onClick={finish}>
          Done
        </PrimaryButton>
        <button
          type="button"
          onClick={addAnother}
          className="w-full rounded-full py-3 text-[15px] font-bold text-brand active:bg-brand-tint"
        >
          Add another food
        </button>
      </div>
    </Screen>
  )
}
