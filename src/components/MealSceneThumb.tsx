import type { MealType } from '../types'
import { MEAL_META } from './meals'
import { getFood } from '../data/foods'
import { FoodTile, getFoodImageUrl } from './FoodTile'
import { getIllustrationUrl } from './Illustration'

/**
 * Home meal-card thumbnail. The time-of-day scene (meal-<type>.png) is the
 * BACKGROUND only; whatever dish the user selected is layered on top at
 * runtime — as its illustration when one exists in src/assets/foods/,
 * otherwise as its emoji. Falls back to an emoji scene without the art.
 */
export function MealSceneThumb({ meal, foodId }: { meal: MealType; foodId?: string }) {
  const meta = MEAL_META[meal]
  const sceneUrl = getIllustrationUrl(`meal-${meal}`)

  if (sceneUrl) {
    const dishUrl = foodId ? getFoodImageUrl(foodId) : undefined
    return (
      <span className="relative block h-28 w-28 shrink-0" aria-hidden>
        <img src={sceneUrl} alt="" className="absolute inset-0 h-full w-full object-contain" />
        {foodId &&
          (dishUrl ? (
            <img
              src={dishUrl}
              alt=""
              className="absolute"
              style={{ width: '88%', left: '50%', top: '63%', transform: 'translate(-50%, -50%)' }}
            />
          ) : (
            <span
              className="absolute text-[44px] leading-none drop-shadow-sm"
              style={{ left: '50%', top: '63%', transform: 'translate(-50%, -50%)' }}
            >
              {getFood(foodId).emoji}
            </span>
          ))}
      </span>
    )
  }

  // emoji placeholder scene (no artwork present)
  return (
    <span
      className="relative flex h-17 w-17 shrink-0 items-center justify-center rounded-2xl"
      style={{ backgroundColor: meta.sceneTint }}
    >
      <span className="absolute top-1 left-1.5 text-sm leading-none" aria-hidden>
        {meta.icon}
      </span>
      <span className="mt-1 text-[34px] leading-none" aria-hidden>
        {foodId ? getFood(foodId).emoji : '🍽️'}
      </span>
    </span>
  )
}

/** Small circular dish preview used in Day Plan rows. */
export function DishThumb({ foodId }: { foodId: string }) {
  return <FoodTile foodId={foodId} className="h-11 w-11" emojiClassName="text-2xl" />
}
