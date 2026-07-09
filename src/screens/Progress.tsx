import { Screen } from '../components/Screen'
import { TipBanner } from '../components/TipBanner'
import { usePlans } from '../state/useAppData'
import { getMealSlot, itemsForMode } from '../lib/mealPlans'
import { MEAL_TYPES } from '../types'
import { todayISO, weekStart, weekDates } from '../lib/dates'

export function Progress() {
  const plans = usePlans()
  const today = todayISO()
  const weekDays = weekDates(weekStart(today))

  const loggedMeals = weekDays.reduce((total, date) => {
    const day = plans[date] ?? {}
    return (
      total +
      MEAL_TYPES.filter((meal) => itemsForMode(getMealSlot(day, meal), 'logged').length > 0).length
    )
  }, 0)

  const totalSlots = weekDays.length * MEAL_TYPES.length
  const percent = totalSlots > 0 ? Math.round((loggedMeals / totalSlots) * 100) : 0

  return (
    <Screen withNav>
      <h1 className="pt-6 text-[22px] font-extrabold text-ink">Progress</h1>
      <p className="mt-1 text-[15px] font-semibold text-ink-soft">Your meal logging this week</p>

      <div className="mt-5 rounded-card bg-paper p-5 shadow-card">
        <p className="text-[13px] font-bold text-muted">This week</p>
        <p className="mt-1 text-[42px] leading-none font-extrabold text-brand">{percent}%</p>
        <p className="mt-2 text-[14px] font-semibold text-ink-soft">
          {loggedMeals} of {totalSlots} meals logged
        </p>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-cream-dark">
          <div
            className="h-full rounded-full bg-brand transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="mt-4">
        <TipBanner mascot="mascot-broccoli">
          Keep logging meals to build healthy habits.
        </TipBanner>
      </div>
    </Screen>
  )
}
