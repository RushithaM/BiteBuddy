import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Screen } from '../components/Screen'
import { MealSceneThumb } from '../components/MealSceneThumb'
import { AddFoodPill } from '../components/Buttons'
import { showToast } from '../components/toast'
import { useUser, usePlans } from '../state/useAppData'
import { MEAL_TYPES, MEAL_LABELS, type MealType } from '../types'
import { MEAL_META } from '../components/meals'
import { getFood } from '../data/foods'
import { todayISO, greetingForNow } from '../lib/dates'

export function Home() {
  const user = useUser()
  const plans = usePlans()
  const navigate = useNavigate()
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
            foodIds={(todayPlan[meal] ?? []).map((i) => i.foodId)}
            onAdd={() => navigate(`/add?date=${today}&meal=${meal}`)}
          />
        ))}
      </div>
    </Screen>
  )
}

function HomeMealCard({
  meal,
  foodIds,
  onAdd,
}: {
  meal: MealType
  foodIds: string[]
  onAdd: () => void
}) {
  const hasFood = foodIds.length > 0
  const subtitle = hasFood
    ? foodIds.map((id) => getFood(id).name).join(' • ')
    : MEAL_META[meal].emptyHome

  return (
    <div
      className="flex items-center gap-3.5 rounded-card p-2.5 shadow-card"
      style={{ backgroundColor: MEAL_META[meal].cardBg }}
    >
      <MealSceneThumb meal={meal} foodId={foodIds[0]} />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
        <div className="min-w-0">
          <h2 className="text-[17px] font-extrabold text-ink">{MEAL_LABELS[meal]}</h2>
          <p
            className={`mt-0.5 truncate text-[13.5px] font-semibold ${hasFood ? 'text-ink-soft' : 'text-muted'}`}
          >
            {subtitle}
          </p>
        </div>
        <AddFoodPill onClick={onAdd} />
      </div>
    </div>
  )
}
