import { useMemo, useState } from 'react'
import { CalendarDays, Flame, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Screen } from '../components/Screen'
import { CalendarStrip } from '../components/CalendarStrip'
import { PlannerMealCard } from '../components/PlannerMealCard'
import { PlanLogToggle } from '../components/PlanLogToggle'
import { TipBanner } from '../components/TipBanner'
import { showToast } from '../components/toast'
import { usePlans, useMealActions } from '../state/useAppData'
import { getMealSlot, itemsForMode } from '../lib/mealPlans'
import {
  loggedKcalOnDate,
  mealsWithItemsOnDate,
  pendingPlannedCount,
} from '../lib/plannerStats'
import { formatPlannerDateShort, suggestedMealForNow, todayISO } from '../lib/dates'
import { MEAL_TYPES, type MealMode } from '../types'

/** Plan tab — week calendar, Planning / Logging toggle, meals for the day. */
export function Planner() {
  const navigate = useNavigate()
  const plans = usePlans()
  const { removeItem, logPlannedItem } = useMealActions()
  const [selectedDate, setSelectedDate] = useState(todayISO())
  const [viewMode, setViewMode] = useState<MealMode>('planned')
  const dayPlan = plans[selectedDate] ?? {}
  const today = todayISO()
  const isToday = selectedDate === today

  const logItem = (meal: (typeof MEAL_TYPES)[number], itemId: string) => {
    logPlannedItem(selectedDate, meal, itemId)
    showToast('Marked as eaten')
  }

  const mealsFilled = useMemo(
    () => mealsWithItemsOnDate(plans, selectedDate, viewMode),
    [plans, selectedDate, viewMode],
  )

  const dayKcal = useMemo(
    () => (viewMode === 'logged' ? loggedKcalOnDate(plans, selectedDate) : 0),
    [plans, selectedDate, viewMode],
  )

  const pendingPlan = useMemo(
    () => (viewMode === 'planned' ? pendingPlannedCount(plans, selectedDate) : 0),
    [plans, selectedDate, viewMode],
  )

  const sectionTitle =
    viewMode === 'planned'
      ? `Planned meals for ${formatPlannerDateShort(selectedDate)}`
      : `Logged meals for ${formatPlannerDateShort(selectedDate)}`

  const openAddMeal = (meal?: (typeof MEAL_TYPES)[number]) => {
    const m = meal ?? suggestedMealForNow()
    navigate(`/add?date=${selectedDate}&meal=${m}&mode=${viewMode}&returnTo=planner`)
  }

  const openMeal = (meal: (typeof MEAL_TYPES)[number]) => {
    const items = itemsForMode(getMealSlot(dayPlan, meal), viewMode)
    if (items.length === 0) {
      openAddMeal(meal)
      return
    }
    navigate(`/meal/${selectedDate}/${meal}?mode=${viewMode}`)
  }

  return (
    <Screen withNav>
      <header className="flex items-center justify-between pt-4">
        <span className="w-10" aria-hidden />
        <h1 className="text-[22px] font-extrabold text-ink">Plan</h1>
        <button
          type="button"
          aria-label="Pick a date"
          onClick={() => {
            setSelectedDate(today)
            showToast('Jumped to today')
          }}
          className={`flex h-10 w-10 items-center justify-center rounded-full active:bg-cream-dark ${
            isToday ? 'text-brand' : 'text-ink'
          }`}
        >
          <CalendarDays size={22} strokeWidth={2.2} />
        </button>
      </header>

      {!isToday && (
        <button
          type="button"
          onClick={() => setSelectedDate(today)}
          className="mt-2 w-full rounded-full bg-brand-tint py-2 text-center text-[13px] font-extrabold text-brand active:bg-brand/15"
        >
          Jump to today
        </button>
      )}

      <div className="mt-3">
        <CalendarStrip
          selected={selectedDate}
          onSelect={setSelectedDate}
          plans={plans}
          mode={viewMode}
        />
      </div>

      <div className="mt-4">
        <PlanLogToggle value={viewMode} onChange={setViewMode} />
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <h2 className="text-[15px] font-extrabold leading-snug text-brand">{sectionTitle}</h2>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="rounded-full bg-paper px-2.5 py-1 text-[11px] font-extrabold text-ink-soft shadow-card ring-1 ring-line-soft">
            {mealsFilled}/{MEAL_TYPES.length} meals
          </span>
          {viewMode === 'logged' && dayKcal > 0 && (
            <span className="flex items-center gap-1 text-[12px] font-extrabold text-brand">
              <Flame size={13} className="text-orange-500" fill="currentColor" />
              {dayKcal} kcal
            </span>
          )}
          {viewMode === 'planned' && pendingPlan > 0 && (
            <span className="text-[12px] font-bold text-muted">{pendingPlan} to eat</span>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        {MEAL_TYPES.map((meal) => (
          <PlannerMealCard
            key={meal}
            meal={meal}
            mode={viewMode}
            items={itemsForMode(getMealSlot(dayPlan, meal), viewMode)}
            onAdd={() => openAddMeal(meal)}
            onOpenMeal={() => openMeal(meal)}
            onOpenItem={(itemId) =>
              navigate(`/meal/${selectedDate}/${meal}/item/${itemId}?mode=${viewMode}`)
            }
            onRemove={(itemId) => removeItem(selectedDate, meal, itemId, viewMode)}
            onLog={(itemId) => logItem(meal, itemId)}
          />
        ))}
      </div>

      {viewMode === 'planned' ? (
        <div className="mt-5 pb-2">
          <TipBanner large mascot="mascot-avocado">
            <>
              <span className="font-extrabold">Plan your meals ahead</span>
              <br />
              <span className="font-semibold text-ink-soft">Stay consistent, eat healthy!</span>
            </>
          </TipBanner>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => openAddMeal()}
          className="mt-5 mb-2 flex w-full items-center justify-center gap-2 rounded-full border-2 border-brand bg-paper py-3.5 text-[15px] font-extrabold text-brand shadow-card transition-colors active:bg-brand-tint"
        >
          <Plus size={18} strokeWidth={2.6} />
          Add meal
        </button>
      )}
    </Screen>
  )
}
