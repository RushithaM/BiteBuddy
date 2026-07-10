import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, Flame } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Screen } from '../components/Screen'
import { CalendarStrip } from '../components/CalendarStrip'
import { DatePickerSheet } from '../components/DatePickerSheet'
import { PlannerMealCard } from '../components/PlannerMealCard'
import { PlanLogToggle } from '../components/PlanLogToggle'
import { TipBanner } from '../components/TipBanner'
import { usePlans, useMealActions } from '../state/useAppData'
import { getMealSlot, itemsForMode } from '../lib/mealPlans'
import {
  loggedKcalOnDate,
  mealsWithItemsOnDate,
  pendingPlannedCount,
} from '../lib/plannerStats'
import { formatPlannerDateShort, suggestedMealForNow, todayISO, defaultMealModeForDate } from '../lib/dates'
import { buildPlannerRestore, savePlannerRestore, type PlannerRestoreState } from '../lib/plannerRestore'
import { MEAL_TYPES, type MealMode, type MealType } from '../types'

/** Plan tab — week calendar, Planning / Logging toggle, meals for the day. */
export function Planner() {
  const navigate = useNavigate()
  const location = useLocation()
  const plans = usePlans()
  const { removeItem } = useMealActions()
  const [selectedDate, setSelectedDate] = useState(todayISO())
  const [viewMode, setViewMode] = useState<MealMode>(() => defaultMealModeForDate(todayISO()))
  const [expandedMeals, setExpandedMeals] = useState<Partial<Record<MealType, boolean>>>({})
  const [calendarOpen, setCalendarOpen] = useState(false)
  const pendingScroll = useRef<number | null>(null)
  const dayPlan = plans[selectedDate] ?? {}

  useEffect(() => {
    const restore = location.state?.restore as PlannerRestoreState | undefined
    if (!restore) return

    setSelectedDate(restore.date)
    setViewMode(restore.viewMode)
    setExpandedMeals(restore.expandedMeals)
    pendingScroll.current = restore.scrollY
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate])

  useEffect(() => {
    if (pendingScroll.current == null) return
    const scrollY = pendingScroll.current
    pendingScroll.current = null
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollY, left: 0 })
    })
  }, [selectedDate, viewMode, expandedMeals])

  const selectDate = (date: string) => {
    setSelectedDate(date)
    setViewMode(defaultMealModeForDate(date))
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

  const openAddMeal = (meal?: MealType) => {
    const m = meal ?? suggestedMealForNow()
    savePlannerRestore(
      buildPlannerRestore({
        date: selectedDate,
        viewMode,
        expandedMeals,
        openMeal: m,
        scrollY: window.scrollY,
      }),
    )
    navigate(`/add?date=${selectedDate}&meal=${m}&mode=${viewMode}&returnTo=planner`)
  }

  const openItem = (meal: MealType, itemId: string) => {
    const restore = buildPlannerRestore({
      date: selectedDate,
      viewMode,
      expandedMeals,
      openMeal: meal,
      scrollY: window.scrollY,
    })
    navigate(
      `/meal/${selectedDate}/${meal}/item/${itemId}?mode=${viewMode}&returnTo=planner`,
      { state: { plannerRestore: restore } },
    )
  }

  const setMealExpanded = (meal: MealType, open: boolean) => {
    setExpandedMeals((prev) => ({ ...prev, [meal]: open }))
  }

  return (
    <Screen withNav>
      <header className="flex items-start justify-between gap-4 pt-4">
        <div className="min-w-0">
          <h1 className="text-[26px] font-extrabold leading-tight text-ink">Plan</h1>
          <p className="mt-1 text-[14px] font-semibold text-muted">
            Plan ahead. Eat better. Feel great. 🍃
          </p>
        </div>
        <button
          type="button"
          aria-label="Pick a date"
          onClick={() => setCalendarOpen(true)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-paper text-brand shadow-card ring-1 ring-line-soft active:bg-cream-dark"
        >
          <CalendarDays size={22} strokeWidth={2.2} />
        </button>
      </header>

      <DatePickerSheet
        open={calendarOpen}
        selected={selectedDate}
        plans={plans}
        onSelect={selectDate}
        onClose={() => setCalendarOpen(false)}
      />

      <div className="mt-4">
        <CalendarStrip
          selected={selectedDate}
          onSelect={selectDate}
          plans={plans}
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
            expanded={expandedMeals[meal] ?? false}
            onExpandedChange={(open) => setMealExpanded(meal, open)}
            onAdd={() => openAddMeal(meal)}
            onOpenItem={(itemId) => openItem(meal, itemId)}
            onRemove={(itemId) => removeItem(selectedDate, meal, itemId, viewMode)}
          />
        ))}
      </div>

      {viewMode === 'planned' && selectedDate >= todayISO() && (
        <div className="mt-5 pb-2">
          <TipBanner large mascot="mascot-avocado">
            <>
              <span className="font-extrabold">Plan your meals ahead</span>
              <br />
              <span className="font-semibold text-ink-soft">Stay consistent, eat healthy!</span>
            </>
          </TipBanner>
        </div>
      )}
    </Screen>
  )
}
