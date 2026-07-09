import { CalendarDays } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Screen, SubHeader } from '../components/Screen'
import { FoodRow } from '../components/FoodRow'
import { InlineAddButton } from '../components/Buttons'
import { TipBanner } from '../components/TipBanner'
import { usePlans, useMealActions } from '../state/useAppData'
import { MEAL_TYPES, MEAL_LABELS, type MealType, type MealItem } from '../types'
import { MEAL_META } from '../components/meals'
import { formatFullDate, todayISO } from '../lib/dates'

export function DayPlan() {
  const navigate = useNavigate()
  const { date = todayISO() } = useParams()
  const plans = usePlans()
  const { removeItem } = useMealActions()
  const dayPlan = plans[date] ?? {}
  const hasAnyFood = MEAL_TYPES.some((m) => (dayPlan[m] ?? []).length > 0)

  return (
    <Screen>
      <SubHeader
        title="Day Plan"
        right={<CalendarDays size={22} strokeWidth={2} className="text-ink" />}
      />

      <div className="flex items-center justify-center gap-1.5 pb-1">
        <CalendarDays size={15} className="text-brand" />
        <span className="text-[13.5px] font-bold text-ink-soft">{formatFullDate(date)}</span>
      </div>

      <div className="mt-3 flex flex-col gap-3.5">
        {MEAL_TYPES.map((meal) => (
          <MealSection
            key={meal}
            meal={meal}
            items={dayPlan[meal] ?? []}
            onAdd={() => navigate(`/add?date=${date}&meal=${meal}`)}
            onRemove={(itemId) => removeItem(date, meal, itemId)}
          />
        ))}
      </div>

      {hasAnyFood && (
        <div className="mt-4 pb-6">
          <TipBanner mascot="mascot-avocado">
            Great choice!
            <br />
            Keep eating healthy! 💚
          </TipBanner>
        </div>
      )}
    </Screen>
  )
}

function MealSection({
  meal,
  items,
  onAdd,
  onRemove,
}: {
  meal: MealType
  items: MealItem[]
  onAdd: () => void
  onRemove: (itemId: string) => void
}) {
  return (
    <section className="rounded-card bg-cream-dark p-3 shadow-card">
      <div className="flex items-center justify-between px-1 pb-2">
        <h2 className="flex items-center gap-2 text-[15px] font-extrabold text-ink">
          <span className="text-base leading-none">{MEAL_META[meal].icon}</span>
          {MEAL_LABELS[meal]}
        </h2>
        <InlineAddButton onClick={onAdd} />
      </div>

      {items.length > 0 ? (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <FoodRow key={item.id} foodId={item.foodId} onRemove={() => onRemove(item.id)} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-paper px-3 py-3.5 text-center text-[13px] font-semibold text-muted">
          Nothing added yet
        </p>
      )}
    </section>
  )
}
