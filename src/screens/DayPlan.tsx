import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Screen, SubHeader } from '../components/Screen'
import { MealPlanSection } from '../components/MealPlanSection'
import { DayPlanDateLine } from '../components/DayPlanDateLine'
import { PlanLogToggle } from '../components/PlanLogToggle'
import { TipBanner } from '../components/TipBanner'
import { showToast } from '../components/toast'
import { usePlans, useMealActions } from '../state/useAppData'
import { dayHasItems, getMealSlot, itemsForMode } from '../lib/mealPlans'
import { MEAL_TYPES, type MealMode } from '../types'
import { todayISO } from '../lib/dates'

export function DayPlan() {
  const navigate = useNavigate()
  const { date = todayISO() } = useParams()
  const plans = usePlans()
  const { removeItem, logPlannedItem } = useMealActions()
  const [viewMode, setViewMode] = useState<MealMode>('planned')
  const dayPlan = plans[date] ?? {}
  const hasVisibleFood = dayHasItems(dayPlan, viewMode)

  const logItem = (meal: (typeof MEAL_TYPES)[number], itemId: string) => {
    logPlannedItem(date, meal, itemId)
    showToast('Marked as eaten')
  }

  return (
    <Screen>
      <SubHeader
        title="Day Plan"
        right={<CalendarDays size={22} strokeWidth={2} className="text-ink" />}
      />

      <DayPlanDateLine date={date} />

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
            onAdd={() => navigate(`/add?date=${date}&meal=${meal}&mode=${viewMode}`)}
            onRemove={(itemId) => removeItem(date, meal, itemId, viewMode)}
            onLog={(itemId) => logItem(meal, itemId)}
          />
        ))}
      </div>

      {hasVisibleFood && (
        <div className="mt-4 pb-6">
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
    </Screen>
  )
}
