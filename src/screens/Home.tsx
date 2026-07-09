import { Bell } from 'lucide-react'
import { Screen } from '../components/Screen'
import { MealSceneThumb } from '../components/MealSceneThumb'
import { Illustration } from '../components/Illustration'
import { showToast } from '../components/toast'
import { useUser, usePlans } from '../state/useAppData'
import { MEAL_TYPES, MEAL_LABELS, type MealType } from '../types'
import { MEAL_META } from '../components/meals'
import { getFood } from '../data/foods'
import { getMealSlot, itemsForMode } from '../lib/mealPlans'
import { todayISO, greetingForNow } from '../lib/dates'

export function Home() {
  const user = useUser()
  const plans = usePlans()
  const today = todayISO()
  const todayPlan = plans[today] ?? {}
  const firstName = (user?.name ?? 'there').split(' ')[0]

  return (
    <Screen withNav>
      <header className="flex items-center justify-between pt-4">
        <h1 className="text-[22px] font-extrabold text-ink">
          {greetingForNow()}, {firstName}! 👋
        </h1>
        <button
          aria-label="Notifications"
          onClick={() => showToast('No notifications yet')}
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink active:bg-cream-dark"
        >
          <Bell size={22} strokeWidth={2.2} />
        </button>
      </header>
      <p className="mt-1 text-[15px] font-semibold text-ink-soft">What did you eat today?</p>

      <div className="mt-4 flex flex-col gap-3.5">
        {MEAL_TYPES.map((meal) => (
          <HomeMealCard
            key={meal}
            meal={meal}
            foodIds={itemsForMode(getMealSlot(todayPlan, meal), 'logged').map((i) => i.foodId)}
          />
        ))}
        <TodayDayEnd />
      </div>
    </Screen>
  )
}

function HomeMealCard({ meal, foodIds }: { meal: MealType; foodIds: string[] }) {
  const hasFood = foodIds.length > 0
  const subtitle = hasFood
    ? foodIds.map((id) => getFood(id).name).join(' • ')
    : MEAL_META[meal].emptyHome

  return (
    <div
      className="flex items-center gap-2.5 rounded-card border border-line py-2 pl-2 pr-3 shadow-card"
      style={{ backgroundColor: MEAL_META[meal].cardBg }}
    >
      <MealSceneThumb meal={meal} />
      <div className="min-w-0 flex-1">
        <h2 className="text-[17px] font-extrabold leading-tight text-ink">{MEAL_LABELS[meal]}</h2>
        <p
          className={`mt-0.5 text-[13.5px] font-semibold leading-snug ${hasFood ? 'text-ink-soft' : 'text-muted'}`}
        >
          {subtitle}
        </p>
      </div>
    </div>
  )
}

/** Closing beat below dinner — full-bleed scene that extends the day naturally. */
function TodayDayEnd() {
  return (
    <figure className="-mx-5 mt-1">
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-cream to-transparent"
        />
        <Illustration
          name="today-day-end"
          className="block w-full object-cover object-center"
        />
      </div>
      <figcaption className="px-5 pt-3 pb-1 text-center text-[13.5px] font-bold leading-snug text-muted">
        All logged? Time to unwind.
      </figcaption>
    </figure>
  )
}
