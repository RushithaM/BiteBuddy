import { Bell, CalendarDays, Check, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Screen } from '../components/Screen'
import { MealSceneThumb } from '../components/MealSceneThumb'
import { Illustration } from '../components/Illustration'
import { showToast } from '../components/toast'
import { useUser, usePlans } from '../state/useAppData'
import { MEAL_TYPES, MEAL_LABELS, type MealItem, type MealSlot, type MealType } from '../types'
import { getFoodDisplayName } from '../data/foods'
import { getMealSlot, itemsForMode } from '../lib/mealPlans'
import { todayISO, greetingForNow } from '../lib/dates'

const ADD_HINT: Record<MealType, string> = {
  breakfast: 'Add breakfast',
  lunch: 'Add lunch',
  snack: 'Add snack',
  dinner: 'Add dinner',
}

/** Snack is optional — day-end scene shows once these are logged. */
const REQUIRED_MEALS: MealType[] = ['breakfast', 'lunch', 'dinner']

function isMealLogged(plan: Partial<Record<MealType, MealSlot>>, meal: MealType) {
  return itemsForMode(getMealSlot(plan, meal), 'logged').length > 0
}

export function Home() {
  const user = useUser()
  const plans = usePlans()
  const today = todayISO()
  const todayPlan = plans[today] ?? {}
  const firstName = (user?.name ?? 'there').split(' ')[0]

  const loggedMealCount = MEAL_TYPES.filter((meal) => isMealLogged(todayPlan, meal)).length
  const dayComplete = REQUIRED_MEALS.every((meal) => isMealLogged(todayPlan, meal))

  return (
    <Screen withNav>
      <TodayProgress
        greeting={`${greetingForNow()}, ${firstName}!`}
        logged={loggedMealCount}
        total={MEAL_TYPES.length}
      />

      <h2 className="mt-5 text-[15px] font-extrabold text-ink">Today&apos;s meals</h2>

      <div className="mt-2.5 flex flex-col gap-2">
        {MEAL_TYPES.map((meal) => {
          const slot = getMealSlot(todayPlan, meal)
          const logged = itemsForMode(slot, 'logged')
          const planned = itemsForMode(slot, 'planned')
          return (
            <HomeMealCard
              key={meal}
              meal={meal}
              date={today}
              loggedItems={logged}
              plannedItems={planned}
            />
          )
        })}
        <TodayDayEnd show={dayComplete} />
      </div>
    </Screen>
  )
}

function TodayProgress({
  greeting,
  logged,
  total,
}: {
  greeting: string
  logged: number
  total: number
}) {
  const pct = total === 0 ? 0 : Math.round((logged / total) * 100)

  return (
    <section className="relative -mx-5 min-h-[calc(14rem-2cm)] overflow-hidden pt-safe">
      <Illustration
        name="today-progress-scene"
        className="absolute inset-0 h-full w-full scale-[1.1] object-cover object-top"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-20 bg-gradient-to-b from-transparent to-cream"
      />

      <div className="relative z-10 flex items-start justify-between px-5 pt-4">
        <h1 className="max-w-[58%] text-[22px] font-extrabold leading-tight text-ink">
          {greeting} <span aria-hidden>👋</span>
        </h1>
        <button
          aria-label="Notifications"
          onClick={() => showToast('No notifications yet')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink active:bg-paper/60"
        >
          <Bell size={22} strokeWidth={2.2} />
        </button>
      </div>

      <Illustration
        name="mascot-avocado"
        className="pointer-events-none absolute top-[calc(5rem)] right-5 z-20 h-[5.5rem] w-[5.5rem] object-contain"
      />

      <div className="relative z-10 mx-5 mt-[calc(5rem)] rounded-[1rem] bg-paper px-4 py-4 pb-5 shadow-card">
        <p className="text-[15px] font-extrabold text-ink">Today&apos;s progress</p>
        <p className="mt-0.5 text-[13.5px] font-semibold text-ink-soft">
          {logged} of {total} meals logged
        </p>
        <div className="mt-3 flex items-center gap-2.5">
          <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-cream-dark">
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="shrink-0 text-[14px] font-extrabold text-brand">{pct}%</span>
        </div>
      </div>
    </section>
  )
}

function itemLabels(items: MealItem[]) {
  return items.map((item) => getFoodDisplayName(item.foodId, item.customName)).join(' • ')
}

function HomeMealCard({
  meal,
  date,
  loggedItems,
  plannedItems,
}: {
  meal: MealType
  date: string
  loggedItems: MealItem[]
  plannedItems: MealItem[]
}) {
  const navigate = useNavigate()
  const hasLogged = loggedItems.length > 0
  const hasPlanned = plannedItems.length > 0

  const subtitle = hasLogged
    ? itemLabels(loggedItems)
    : hasPlanned
      ? `Planned: ${itemLabels(plannedItems)}`
      : ADD_HINT[meal]

  const openMeal = () => {
    if (hasLogged) {
      navigate(`/meal/${date}/${meal}?mode=logged`)
      return
    }
    if (hasPlanned) {
      navigate(`/meal/${date}/${meal}?mode=planned`)
      return
    }
    navigate(`/add?date=${date}&meal=${meal}&mode=logged&returnTo=home`)
  }

  return (
    <button
      type="button"
      onClick={openMeal}
      className="flex w-full items-center gap-2 rounded-card border border-line-soft bg-paper py-1.5 pl-1.5 pr-2.5 text-left shadow-card active:bg-cream-dark"
    >
      <MealSceneThumb meal={meal} />
      <div className="min-w-0 flex-1">
        <h3 className="text-[16px] font-extrabold leading-tight text-ink">{MEAL_LABELS[meal]}</h3>
        <p
          className={`mt-0.5 text-[13px] font-semibold leading-snug ${
            hasLogged ? 'text-ink-soft' : 'text-brand'
          }`}
        >
          {subtitle}
        </p>
      </div>
      {hasLogged ? (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-white">
          <Check size={15} strokeWidth={3} />
        </span>
      ) : hasPlanned ? (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand">
          <CalendarDays size={14} strokeWidth={2.4} />
        </span>
      ) : (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand">
          <Plus size={16} strokeWidth={2.6} />
        </span>
      )}
    </button>
  )
}

/** Celebratory avocado-in-hammock when required meals (breakfast, lunch, dinner) are logged. */
function TodayDayEnd({ show }: { show: boolean }) {
  if (!show) return null

  return (
    <figure className="-mx-5 mt-3 overflow-hidden">
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-14 bg-gradient-to-b from-cream to-transparent"
        />
        <Illustration
          name="today-day-end"
          className="block w-full object-contain object-center"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-12 bg-gradient-to-b from-transparent to-cream"
        />
      </div>
      <figcaption className="px-5 pt-2 pb-1 text-center text-[13px] font-semibold leading-snug text-ink-soft">
        You&apos;re all set for today — rest peacefully tonight
      </figcaption>
    </figure>
  )
}
