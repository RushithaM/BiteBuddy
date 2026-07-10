import { useEffect, useState } from 'react'
import { Screen, SubHeader } from '../components/Screen'
import { ToggleSwitch } from '../components/ToggleSwitch'
import { DEFAULT_MOTIVATIONAL_TIME, DEFAULT_REMINDER_TIMES } from '../data/setup'
import { GOAL_OPTIONS, FOOD_PREFERENCE_OPTIONS } from '../data/setup'
import type { GoalId } from '../data/setup'
import { dataService } from '../services/data'
import { useUser } from '../state/useAppData'
import { MEAL_LABELS, MEAL_TYPES, type MealReminder, type MealType, type MotivationalReminder } from '../types'

function defaultMealReminders(): Record<MealType, MealReminder> {
  return MEAL_TYPES.reduce(
    (acc, meal) => {
      acc[meal] = { enabled: true, time: DEFAULT_REMINDER_TIMES[meal] }
      return acc
    },
    {} as Record<MealType, MealReminder>,
  )
}

function normalizeMotivational(value: MotivationalReminder | boolean | undefined): MotivationalReminder {
  if (typeof value === 'boolean') return { enabled: value, time: DEFAULT_MOTIVATIONAL_TIME }
  return value ?? { enabled: true, time: DEFAULT_MOTIVATIONAL_TIME }
}

/** Reminder settings — meal, hydration, and motivational toggles. */
export function Reminders() {
  const user = useUser()
  const base = defaultMealReminders()
  const stored = user?.mealReminders ?? {}

  const [mealReminders, setMealReminders] = useState<Record<MealType, MealReminder>>({
    ...base,
    ...stored,
  })
  const [hydrationEnabled, setHydrationEnabled] = useState(
    user?.hydrationReminders?.enabled ?? true,
  )
  const [motivational, setMotivational] = useState(() => normalizeMotivational(user?.motivationalReminders))

  useEffect(() => {
    setMealReminders({ ...base, ...(user?.mealReminders ?? {}) })
    setHydrationEnabled(user?.hydrationReminders?.enabled ?? true)
    setMotivational(normalizeMotivational(user?.motivationalReminders))
  }, [user])

  const persist = (patch: Parameters<typeof dataService.updateUser>[0]) => {
    dataService.updateUser(patch)
  }

  const updateMeal = (meal: MealType, patch: Partial<MealReminder>) => {
    const next = { ...mealReminders, [meal]: { ...mealReminders[meal], ...patch } }
    setMealReminders(next)
    persist({ mealReminders: next })
  }

  return (
    <Screen>
      <SubHeader title="Reminders" />

      <section>
        <h2 className="text-[15px] font-extrabold text-ink">Meal reminders</h2>
        <ul className="mt-2 flex flex-col gap-2">
          {MEAL_TYPES.map((meal) => (
            <li
              key={meal}
              className="flex items-center gap-3 rounded-card border border-line-soft bg-paper px-4 py-3 shadow-card"
            >
              <div className="flex-1 text-left">
                <p className="text-[15px] font-bold text-ink">{MEAL_LABELS[meal]}</p>
                {mealReminders[meal].enabled && (
                  <input
                    type="time"
                    value={mealReminders[meal].time}
                    onChange={(e) => updateMeal(meal, { time: e.target.value })}
                    className="mt-0.5 bg-transparent text-[13px] font-semibold text-brand outline-none"
                  />
                )}
              </div>
              <ToggleSwitch
                label={`${MEAL_LABELS[meal]} reminder`}
                checked={mealReminders[meal].enabled}
                onChange={(enabled) => updateMeal(meal, { enabled })}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-[15px] font-extrabold text-ink">Hydration reminders</h2>
        <div className="mt-2 flex items-center gap-3 rounded-card border border-line-soft bg-paper px-4 py-3 shadow-card">
          <div className="flex-1">
            <p className="text-[15px] font-bold text-ink">Drink water</p>
            <p className="text-[13px] font-semibold text-muted">Every 2 hours</p>
          </div>
          <ToggleSwitch
            label="Hydration reminders"
            checked={hydrationEnabled}
            onChange={(enabled) => {
              setHydrationEnabled(enabled)
              persist({ hydrationReminders: { enabled, interval: 'Every 2 hours' } })
            }}
          />
        </div>
      </section>

      <section className="mt-6 pb-4">
        <h2 className="text-[15px] font-extrabold text-ink">Motivational reminders</h2>
        <div className="mt-2 flex items-center gap-3 rounded-card border border-line-soft bg-paper px-4 py-3 shadow-card">
          <div className="flex-1">
            <p className="text-[15px] font-bold text-ink">Daily encouragement</p>
            {motivational.enabled && (
              <input
                type="time"
                value={motivational.time}
                onChange={(e) => {
                  const next = { ...motivational, time: e.target.value }
                  setMotivational(next)
                  persist({ motivationalReminders: next })
                }}
                className="mt-0.5 bg-transparent text-[13px] font-semibold text-brand outline-none"
              />
            )}
            {!motivational.enabled && (
              <p className="text-[13px] font-semibold text-muted">Gentle nudges to stay on track</p>
            )}
          </div>
          <ToggleSwitch
            label="Motivational reminders"
            checked={motivational.enabled}
            onChange={(enabled) => {
              const next = { ...motivational, enabled }
              setMotivational(next)
              persist({ motivationalReminders: next })
            }}
          />
        </div>
      </section>
    </Screen>
  )
}

/** Food preference — editable after onboarding. */
export function Preferences() {
  const user = useUser()
  const [foodPreference, setFoodPreference] = useState(user?.foodPreference ?? 'vegetarian')

  useEffect(() => {
    if (user?.foodPreference) setFoodPreference(user.foodPreference)
  }, [user?.foodPreference])

  const select = (id: (typeof FOOD_PREFERENCE_OPTIONS)[number]['id']) => {
    setFoodPreference(id)
    dataService.updateUser({ foodPreference: id })
  }

  return (
    <Screen>
      <SubHeader title="Preferences" />

      <p className="text-[15px] font-extrabold text-ink">Food preference</p>
      <ul className="mt-2 flex flex-col gap-2">
        {FOOD_PREFERENCE_OPTIONS.map(({ id, label, emoji }) => {
          const selected = foodPreference === id
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => select(id)}
                className={`flex w-full items-center gap-3 rounded-card border px-4 py-3.5 text-left shadow-card ${
                  selected
                    ? 'border-brand bg-brand-tint'
                    : 'border-line-soft bg-paper active:bg-cream-dark'
                }`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-cream-dark text-xl">
                  {emoji}
                </span>
                <span className="flex-1 text-[15px] font-bold text-ink">{label}</span>
                <span
                  className={`h-5 w-5 rounded-full border-2 ${
                    selected ? 'border-brand bg-brand' : 'border-line bg-paper'
                  }`}
                />
              </button>
            </li>
          )
        })}
      </ul>
    </Screen>
  )
}

/** Goals — editable after onboarding. */
export function MyGoals() {
  const user = useUser()
  const [goals, setGoals] = useState<GoalId[]>(user?.goals ?? [])

  useEffect(() => {
    setGoals(user?.goals ?? [])
  }, [user?.goals])

  const toggle = (id: GoalId) => {
    const next = goals.includes(id) ? goals.filter((g) => g !== id) : [...goals, id]
    if (next.length === 0) return
    setGoals(next)
    dataService.updateUser({ goals: next })
  }

  return (
    <Screen>
      <SubHeader title="My Goals" />

      <ul className="flex flex-col gap-2 pb-4">
        {GOAL_OPTIONS.map(({ id, label }) => {
          const active = goals.includes(id)
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => toggle(id)}
                className={`flex w-full items-center rounded-card border px-4 py-3.5 text-left shadow-card ${
                  active
                    ? 'border-brand bg-brand-tint'
                    : 'border-line-soft bg-paper active:bg-cream-dark'
                }`}
              >
                <span className="text-[15px] font-bold text-ink">{label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </Screen>
  )
}
