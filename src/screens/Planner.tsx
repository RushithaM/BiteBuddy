import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Screen, SubHeader } from '../components/Screen'
import { MealPlanSection } from '../components/MealPlanSection'
import { DayPlanDateLine } from '../components/DayPlanDateLine'
import { PlanLogToggle } from '../components/PlanLogToggle'
import { TipBanner } from '../components/TipBanner'
import { DatePickerSheet } from '../components/DatePickerSheet'
import { showToast } from '../components/toast'
import { usePlans, useMealActions } from '../state/useAppData'
import { dayHasItems, getMealSlot, itemsForMode } from '../lib/mealPlans'
import { MEAL_TYPES, type MealMode } from '../types'
import { todayISO } from '../lib/dates'

export function Planner() {
  const navigate = useNavigate()
  const plans = usePlans()
  const { removeItem, logPlannedItem } = useMealActions()
  const [selectedDate, setSelectedDate] = useState(todayISO())
  const [viewMode, setViewMode] = useState<MealMode>('planned')
  const [calendarOpen, setCalendarOpen] = useState(false)
  const dayPlan = plans[selectedDate] ?? {}
  const hasVisibleFood = dayHasItems(dayPlan, viewMode)

  const logItem = (meal: (typeof MEAL_TYPES)[number], itemId: string) => {
    logPlannedItem(selectedDate, meal, itemId)
    showToast('Marked as eaten')
  }

  return (
    <Screen withNav>
      <SubHeader
        title="Day Plan"
        onBack={() => navigate('/')}
        right={
          <button
            aria-label="Pick date"
            onClick={() => setCalendarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink active:bg-cream-dark"
          >
            <CalendarDays size={22} strokeWidth={2} />
          </button>
        }
      />

      <DayPlanDateLine date={selectedDate} />

      <div className="mt-3 mb-4">
        <PlanLogToggle value={viewMode} onChange={setViewMode} />
      </div>

      <div className="flex flex-col gap-3">
        {MEAL_TYPES.map((meal) => (
          <MealPlanSection
            key={meal}
            meal={meal}
            mode={viewMode}
            items={itemsForMode(getMealSlot(dayPlan, meal), viewMode)}
            onAdd={() =>
              navigate(`/add?date=${selectedDate}&meal=${meal}&mode=${viewMode}`)
            }
            onRemove={(itemId) => removeItem(selectedDate, meal, itemId, viewMode)}
            onLog={(itemId) => logItem(meal, itemId)}
          />
        ))}
      </div>

      {hasVisibleFood && (
        <div className="mt-4 pb-2">
          <TipBanner large mascot="mascot-avocado">
            {viewMode === 'planned' ? (
              <>
                Looking good!
                <br />
                Mark items as eaten once you&apos;re done. 💚
              </>
            ) : (
              <>
                Great choice!
                <br />
                Keep eating healthy! 💚
              </>
            )}
          </TipBanner>
        </div>
      )}

      <DatePickerSheet
        open={calendarOpen}
        selected={selectedDate}
        onSelect={setSelectedDate}
        onClose={() => setCalendarOpen(false)}
      />
    </Screen>
  )
}
