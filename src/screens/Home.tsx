import { Bell, CalendarDays, Check, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Screen } from '../components/Screen'
import { MealSceneThumb } from '../components/MealSceneThumb'
import { Illustration } from '../components/Illustration'
import { showToast } from '../components/toast'
import { useUser, usePlans } from '../state/useAppData'
import { MEAL_TYPES, MEAL_LABELS, type MealItem, type MealType } from '../types'
import { getFoodDisplayName } from '../data/foods'
import { getMealSlot, itemsForMode } from '../lib/mealPlans'
import { todayISO, greetingForNow } from '../lib/dates'

const ADD_HINT: Record<MealType, string> = {
  breakfast: 'Add breakfast',
  lunch: 'Add lunch',
  snack: 'Add snack',
  dinner: 'Add dinner',
}

export function Home() {
  const user = useUser()
  const plans = usePlans()
  const today = todayISO()
  const todayPlan = plans[today] ?? {}
  const firstName = (user?.name ?? 'there').split(' ')[0]

  const loggedMealCount = MEAL_TYPES.filter(
    (meal) => itemsForMode(getMealSlot(todayPlan, meal), 'logged').length > 0,
  ).length

  return (
    <Screen withNav>
      <header className="flex items-start justify-between pt-4">
        <div>
          <h1 className="text-[22px] font-extrabold text-ink">
            {greetingForNow()}, {firstName}!
          </h1>
        </div>
        <button
          aria-label="Notifications"
          onClick={() => showToast('No notifications yet')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink active:bg-cream-dark"
        >
          <Bell size={22} strokeWidth={2.2} />
        </button>
      </header>

      <TodayProgress logged={loggedMealCount} total={MEAL_TYPES.length} />

      <h2 className="mt-5 text-[15px] font-extrabold text-ink">Today&apos;s meals</h2>

      <div className="mt-3 flex flex-col gap-3">
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
        <TodayDayEnd />
      </div>
    </Screen>
  )
}

function TodayProgress({ logged, total }: { logged: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((logged / total) * 100)

  return (
    <div className="mt-4 flex items-center gap-4 rounded-card border border-line-soft bg-paper p-5 shadow-card">
      <div className="min-w-0 flex-1">
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
      <Illustration
        name="mascot-avocado"
        className="h-20 w-20 shrink-0 object-contain"
      />
    </div>
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
      className="flex w-full items-center gap-2.5 rounded-card border border-line-soft bg-paper py-2 pl-2 pr-3 text-left shadow-card active:bg-cream-dark"
    >
      <MealSceneThumb meal={meal} />
      <div className="min-w-0 flex-1">
        <h3 className="text-[17px] font-extrabold leading-tight text-ink">{MEAL_LABELS[meal]}</h3>
        <p
          className={`mt-0.5 text-[13.5px] font-semibold leading-snug ${
            hasLogged ? 'text-ink-soft' : hasPlanned ? 'text-brand' : 'text-brand'
          }`}
        >
          {subtitle}
        </p>
      </div>
      {hasLogged ? (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-white">
          <Check size={18} strokeWidth={3} />
        </span>
      ) : hasPlanned ? (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand">
          <CalendarDays size={17} strokeWidth={2.4} />
        </span>
      ) : (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand">
          <Plus size={20} strokeWidth={2.8} />
        </span>
      )}
    </button>
  )
}

/** Decorative avocado-in-hammock scene below the meal list. */
function TodayDayEnd() {
  return (
    <figure className="-mx-5 mt-2">
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
    </figure>
  )
}
