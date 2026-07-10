import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Screen, BackButton } from '../components/Screen'
import { PrimaryButton } from '../components/Buttons'
import { AvatarPickerTile } from '../components/AvatarImage'
import { Illustration } from '../components/Illustration'
import { ToggleSwitch } from '../components/ToggleSwitch'
import { AVATAR_OPTIONS, DEFAULT_AVATAR } from '../data/avatars'
import {
  DEFAULT_REMINDER_TIMES,
  FOOD_PREFERENCE_OPTIONS,
  GOAL_OPTIONS,
  DEFAULT_MOTIVATIONAL_TIME,
  type FoodPreference,
  type GoalId,
} from '../data/setup'
import { MEAL_LABELS, MEAL_TYPES, type AvatarId, type MealReminder, type MealType } from '../types'
import { dataService } from '../services/data'
import { showToast } from '../components/toast'
import { useUser } from '../state/useAppData'

const STEPS = ['goal', 'preference', 'reminders', 'avatar'] as const
type Step = (typeof STEPS)[number]

const STEP_TITLES: Record<Step, string> = {
  goal: 'Choose your goal',
  preference: 'Food preference',
  reminders: 'Meal reminders',
  avatar: 'Choose your avatar',
}

function defaultReminders(): Record<MealType, MealReminder> {
  return MEAL_TYPES.reduce(
    (acc, meal) => {
      acc[meal] = { enabled: true, time: DEFAULT_REMINDER_TIMES[meal] }
      return acc
    },
    {} as Record<MealType, MealReminder>,
  )
}

/** Four-step onboarding after sign-up: goals, diet, reminders, avatar. */
export function Setup() {
  const navigate = useNavigate()
  const user = useUser()
  const [stepIndex, setStepIndex] = useState(0)
  const step = STEPS[stepIndex]

  const [goals, setGoals] = useState<GoalId[]>(['track-meals'])
  const [foodPreference, setFoodPreference] = useState<FoodPreference>('vegetarian')
  const [reminders, setReminders] = useState(defaultReminders)
  const [avatarId, setAvatarId] = useState<AvatarId>(user?.avatarId ?? DEFAULT_AVATAR)

  const toggleGoal = (id: GoalId) => {
    setGoals((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]))
  }

  const updateReminder = (meal: MealType, patch: Partial<MealReminder>) => {
    setReminders((prev) => ({ ...prev, [meal]: { ...prev[meal], ...patch } }))
  }

  const goBack = () => {
    if (stepIndex === 0) {
      dataService.signOut()
      navigate('/welcome', { replace: true })
      return
    }
    setStepIndex((i) => i - 1)
  }

  const continueStep = () => {
    if (step === 'goal' && goals.length === 0) {
      showToast('Pick at least one goal')
      return
    }
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((i) => i + 1)
      return
    }
    dataService.updateUser({
      goals,
      foodPreference,
      mealReminders: reminders,
      avatarId,
      setupComplete: true,
      hydrationReminders: { enabled: true, interval: 'Every 2 hours' },
      motivationalReminders: { enabled: true, time: DEFAULT_MOTIVATIONAL_TIME },
    })
    navigate('/', { replace: true })
  }

  return (
    <Screen className="flex min-h-dvh flex-col">
      <header className="flex h-14 items-center justify-between">
        <BackButton onClick={goBack} className="-ml-1" />
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-6 rounded-full transition-colors ${
                i <= stepIndex ? 'bg-brand' : 'bg-line'
              }`}
            />
          ))}
        </div>
        <span className="w-10" />
      </header>

      <div className="flex flex-col items-center text-center">
        <h1 className="text-[24px] font-extrabold text-ink">{STEP_TITLES[step]}</h1>
        {step === 'goal' && (
          <Illustration
            name="login-mascot"
            className="mt-3 max-h-[7.5rem] w-full max-w-[9rem] object-contain"
          />
        )}
      </div>

      <div className="mt-5 flex flex-1 flex-col gap-2.5">
        {step === 'goal' &&
          GOAL_OPTIONS.map(({ id, label }) => {
            const selected = goals.includes(id)
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleGoal(id)}
                className={`flex items-center gap-3.5 rounded-card border px-4 py-3.5 text-left shadow-card transition-colors ${
                  selected
                    ? 'border-brand bg-brand-tint'
                    : 'border-line-soft bg-paper active:bg-cream-dark'
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                    selected ? 'border-brand bg-brand text-white' : 'border-line bg-paper'
                  }`}
                >
                  {selected && <Check size={14} strokeWidth={3} />}
                </span>
                <span className="text-[15px] font-bold text-ink">{label}</span>
              </button>
            )
          })}

        {step === 'preference' &&
          FOOD_PREFERENCE_OPTIONS.map(({ id, label, emoji }) => {
            const selected = foodPreference === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFoodPreference(id)}
                className={`flex items-center gap-3.5 rounded-card border px-4 py-3.5 text-left shadow-card transition-colors ${
                  selected
                    ? 'border-brand bg-brand-tint'
                    : 'border-line-soft bg-paper active:bg-cream-dark'
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-dark text-xl">
                  {emoji}
                </span>
                <span className="flex-1 text-[15px] font-bold text-ink">{label}</span>
                <span
                  className={`h-5 w-5 shrink-0 rounded-full border-2 ${
                    selected ? 'border-brand bg-brand' : 'border-line bg-paper'
                  }`}
                >
                  {selected && (
                    <span className="mx-auto mt-0.5 block h-2 w-2 rounded-full bg-paper" />
                  )}
                </span>
              </button>
            )
          })}

        {step === 'reminders' &&
          MEAL_TYPES.map((meal) => (
            <div
              key={meal}
              className="flex items-center gap-3 rounded-card border border-line-soft bg-paper px-4 py-3 shadow-card"
            >
              <div className="flex-1 text-left">
                <p className="text-[15px] font-bold text-ink">{MEAL_LABELS[meal]}</p>
                {reminders[meal].enabled && (
                  <input
                    type="time"
                    value={reminders[meal].time}
                    onChange={(e) => updateReminder(meal, { time: e.target.value })}
                    className="mt-0.5 bg-transparent text-[13px] font-semibold text-brand outline-none"
                  />
                )}
              </div>
              <ToggleSwitch
                label={`${MEAL_LABELS[meal]} reminder`}
                checked={reminders[meal].enabled}
                onChange={(enabled) => updateReminder(meal, { enabled })}
              />
            </div>
          ))}

        {step === 'avatar' && (
          <div className="grid grid-cols-4 gap-2.5">
            {AVATAR_OPTIONS.map(({ id, label }) => (
              <AvatarPickerTile
                key={id}
                id={id}
                label={label}
                selected={id === avatarId}
                onSelect={() => setAvatarId(id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="pb-6 pt-6">
        <PrimaryButton type="button" onClick={continueStep}>
          {step === 'avatar' ? 'Finish setup' : 'Continue'}
        </PrimaryButton>
      </div>
    </Screen>
  )
}
