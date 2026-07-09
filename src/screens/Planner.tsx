import { useState } from 'react'
import { ArrowLeft, CalendarDays, MoreHorizontal, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Screen } from '../components/Screen'
import { FoodRow } from '../components/FoodRow'
import { InlineAddButton } from '../components/Buttons'
import { DatePickerSheet } from '../components/DatePickerSheet'
import { showToast } from '../components/toast'
import { usePlans, useMealActions } from '../state/useAppData'
import { MEAL_TYPES, MEAL_LABELS, type MealType, type MealItem } from '../types'
import { MEAL_META } from '../components/meals'
import { formatPlannerDate, todayISO } from '../lib/dates'

export function Planner() {
  const navigate = useNavigate()
  const plans = usePlans()
  const { removeItem } = useMealActions()
  const [selectedDate, setSelectedDate] = useState(todayISO())
  const [calendarOpen, setCalendarOpen] = useState(false)
  const dayPlan = plans[selectedDate] ?? {}

  return (
    <Screen withNav>
      <header className="relative flex h-14 items-center justify-center pt-2">
        <button
          aria-label="Back to today"
          onClick={() => navigate('/')}
          className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full text-ink active:bg-cream-dark"
        >
          <ArrowLeft size={24} strokeWidth={2.2} />
        </button>

        <h1 className="text-[17px] font-extrabold text-ink">{formatPlannerDate(selectedDate)}</h1>

        <div className="absolute right-0 flex items-center gap-0.5">
          <button
            aria-label="Pick date"
            onClick={() => setCalendarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-brand active:bg-cream-dark"
          >
            <CalendarDays size={22} strokeWidth={2} />
          </button>
          <button
            aria-label="More options"
            onClick={() => showToast('More options coming soon')}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink active:bg-cream-dark"
          >
            <MoreHorizontal size={22} strokeWidth={2} />
          </button>
        </div>
      </header>

      <div className="mt-2 flex flex-col gap-3.5">
        {MEAL_TYPES.map((meal) => (
          <PlannerMealCard
            key={meal}
            meal={meal}
            items={dayPlan[meal] ?? []}
            onAdd={() => navigate(`/add?date=${selectedDate}&meal=${meal}`)}
            onRemove={(itemId) => removeItem(selectedDate, meal, itemId)}
          />
        ))}
      </div>

      <DatePickerSheet
        open={calendarOpen}
        selected={selectedDate}
        onSelect={setSelectedDate}
        onClose={() => setCalendarOpen(false)}
      />
    </Screen>
  )
}

function PlannerMealCard({
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
  const meta = MEAL_META[meal]

  return (
    <section className="rounded-card bg-paper p-3.5 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-ink">
          <span className="text-lg leading-none">{meta.icon}</span>
          {MEAL_LABELS[meal]}
        </h2>
        <InlineAddButton onClick={onAdd} />
      </div>

      {items.length > 0 ? (
        <div className="mt-2.5 flex flex-col gap-2">
          {items.map((item) => (
            <FoodRow key={item.id} foodId={item.foodId} onRemove={() => onRemove(item.id)} />
          ))}
        </div>
      ) : (
        <div className="relative mt-2.5 rounded-2xl border-2 border-dashed border-line px-4 py-8 text-center">
          <p className="text-[14px] font-extrabold text-ink-soft">{meta.emptyPlannerTitle}</p>
          <p className="mt-1 text-[12.5px] font-semibold text-muted">{meta.emptyPlannerHint}</p>
          <button
            onClick={onAdd}
            aria-label={`Add ${MEAL_LABELS[meal]}`}
            className="absolute right-4 bottom-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-fab active:bg-brand-dark"
          >
            <Plus size={24} strokeWidth={2.6} />
          </button>
        </div>
      )}
    </section>
  )
}
