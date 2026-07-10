import type { MealType } from '../types'
import { MEAL_META } from './meals'
import { FoodTile } from './FoodTile'
import { getIllustrationUrl } from './Illustration'

/**
 * Static time-of-day illustration for Home meal cards (meal-<type>.png).
 * Logged food names are shown on the right of the card, not on this thumb.
 */
export function MealSceneThumb({ meal }: { meal: MealType }) {
  const meta = MEAL_META[meal]
  const sceneUrl = getIllustrationUrl(`meal-${meal}`)

  if (sceneUrl) {
    return (
      <span className="block h-[5.25rem] w-[6.75rem] shrink-0" aria-hidden>
        <img src={sceneUrl} alt="" className="h-full w-full object-contain object-left" />
      </span>
    )
  }

  // emoji placeholder scene (no artwork present)
  return (
    <span
      className="relative flex h-[5.25rem] w-[6.75rem] shrink-0 items-center justify-center"
      style={{ backgroundColor: meta.sceneTint }}
      aria-hidden
    >
      <span className="absolute top-2 left-2.5 text-base leading-none">{meta.icon}</span>
      <span className="text-[40px] leading-none opacity-60">🍽️</span>
    </span>
  )
}

/** Small circular dish preview used in Day Plan rows. */
export function DishThumb({ foodId }: { foodId: string }) {
  return <FoodTile foodId={foodId} className="h-11 w-11" emojiClassName="text-2xl" />
}

/** Larger meal scene used on the meal detail screen (same art as home cards). */
export function MealSceneHero({ meal, large = false }: { meal: MealType; large?: boolean }) {
  const meta = MEAL_META[meal]
  const sceneUrl = getIllustrationUrl(`meal-${meal}`)

  if (sceneUrl) {
    return (
      <img
        src={sceneUrl}
        alt=""
        className={
          large
            ? 'h-auto w-full object-cover'
            : 'h-44 w-full max-w-sm object-contain'
        }
        aria-hidden
      />
    )
  }

  return (
    <span
      className={`relative flex w-full items-center justify-center rounded-card ${
        large ? 'aspect-[4/3]' : 'h-44 max-w-sm'
      }`}
      style={{ backgroundColor: meta.sceneTint }}
      aria-hidden
    >
      <span className="absolute top-4 left-5 text-xl leading-none">{meta.icon}</span>
      <span className={`leading-none opacity-60 ${large ? 'text-8xl' : 'text-7xl'}`}>🍽️</span>
    </span>
  )
}
