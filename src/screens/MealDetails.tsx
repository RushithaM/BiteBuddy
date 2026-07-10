import { useEffect, useMemo, useState } from 'react'
import { Leaf, Pencil, Trash2 } from 'lucide-react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Screen, SubHeader } from '../components/Screen'
import { MealSceneHero } from '../components/MealSceneThumb'
import { FoodIcon } from '../components/FoodIcon'
import { getFoodDisplayName } from '../data/foods'
import {
  aggregateMealNutrition,
  getItemNutrition,
  itemQuantityLabel,
} from '../data/nutrition'
import { getMealSlot, itemsForMode } from '../lib/mealPlans'
import { useMealActions, usePlans } from '../state/useAppData'
import { MEAL_LABELS, MEAL_TYPES, type MealMode, type MealMood, type MealType } from '../types'

const MOODS: { value: MealMood; emoji: string; label: string; ring: string }[] = [
  { value: 1, emoji: '😞', label: 'Not great', ring: 'ring-orange-400' },
  { value: 2, emoji: '😐', label: 'Okay', ring: 'ring-amber-400' },
  { value: 3, emoji: '😊', label: 'Loved it', ring: 'ring-brand' },
]

const NUTRIENT_CHIPS = [
  {
    key: 'calories' as const,
    label: 'kcal',
    chip: 'bg-[#fff3e6] text-[#c45c1a]',
    value: (n: number) => String(n),
  },
  {
    key: 'carbs' as const,
    label: 'Carbs',
    chip: 'bg-[#e8f2fc] text-[#2563b8]',
    value: (n: number) => `${n}g`,
  },
  {
    key: 'protein' as const,
    label: 'Protein',
    chip: 'bg-[#e6f5ee] text-[#1f7a55]',
    value: (n: number) => `${n}g`,
  },
  {
    key: 'fats' as const,
    label: 'Fats',
    chip: 'bg-[#fce8e8] text-[#c43c3c]',
    value: (n: number) => `${n}g`,
  },
  {
    key: 'fiber' as const,
    label: 'Fiber',
    chip: 'bg-[#eef4dc] text-ink',
    labelMuted: true,
    value: (n: number) => `${n}g`,
  },
]

function isMealType(v: string | undefined): v is MealType {
  return MEAL_TYPES.includes(v as MealType)
}

function isMealMode(v: string | null): v is MealMode {
  return v === 'planned' || v === 'logged'
}

/**
 * Meal slot overview — hero image, nutrient chips, food list, mood, and notes.
 */
export function MealDetails() {
  const navigate = useNavigate()
  const { date, meal: mealParam } = useParams<{ date: string; meal: string }>()
  const [searchParams] = useSearchParams()
  const mode: MealMode = isMealMode(searchParams.get('mode'))
    ? (searchParams.get('mode') as MealMode)
    : 'logged'

  const plans = usePlans()
  const { updateMealMeta, removeItem } = useMealActions()

  if (!date || !isMealType(mealParam)) {
    return <Navigate to="/" replace />
  }
  const meal = mealParam

  const slot = getMealSlot(plans[date], meal)
  const items = itemsForMode(slot, mode)
  const nutrition = useMemo(() => aggregateMealNutrition(items), [items])

  const [note, setNote] = useState(slot.mealNote ?? '')
  const [mood, setMood] = useState<MealMood | undefined>(slot.mood)

  useEffect(() => {
    setNote(slot.mealNote ?? '')
    setMood(slot.mood)
  }, [slot.mealNote, slot.mood])

  const saveMeta = (patch: { mood?: MealMood; mealNote?: string }) => {
    updateMealMeta(date, meal, patch)
  }

  const openAdd = () =>
    navigate(`/add?date=${date}&meal=${meal}&mode=${mode}&returnTo=meal`)

  const openItem = (itemId: string) =>
    navigate(`/meal/${date}/${meal}/item/${itemId}?mode=${mode}`)

  return (
    <Screen className="pb-6">
      <SubHeader
        title={MEAL_LABELS[meal]}
        onBack={() => navigate(mode === 'planned' ? '/planner' : '/')}
        right={
          <span
            aria-hidden
            className="flex h-10 w-10 items-center justify-center rounded-full bg-paper text-brand shadow-card"
          >
            <Leaf size={20} strokeWidth={2.2} />
          </span>
        }
      />

      <div className="-mx-5 relative overflow-hidden">
        <MealSceneHero meal={meal} large />
        <button
          type="button"
          onClick={openAdd}
          className="absolute right-4 bottom-4 flex items-center gap-1.5 rounded-full border border-brand bg-paper px-3.5 py-2 text-[13px] font-extrabold text-brand shadow-card active:bg-brand-tint"
        >
          <Pencil size={14} strokeWidth={2.4} />
          Edit meal
        </button>
      </div>

      {items.length > 0 && (
        <div className="mt-4 flex gap-2">
          {NUTRIENT_CHIPS.map(({ key, label, chip, value, labelMuted }) => (
            <div
              key={key}
              className={`flex flex-1 flex-col items-center justify-center rounded-2xl px-1 py-3 ${chip}`}
            >
              <span className="text-[17px] font-extrabold leading-none">{value(nutrition[key])}</span>
              <span
                className={`mt-1.5 text-[11px] font-semibold leading-none ${
                  labelMuted ? 'text-muted' : 'opacity-90'
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      )}

      <section className="mt-5">
        <h2 className="text-[15px] font-extrabold text-ink">What&apos;s included</h2>

        {items.length === 0 ? (
          <p className="mt-3 rounded-card border border-dashed border-line-soft bg-paper px-4 py-8 text-center text-sm font-semibold text-muted">
            No foods yet — tap Edit meal to add
          </p>
        ) : (
          <ul className="mt-2 overflow-hidden rounded-card border border-line-soft bg-paper shadow-card">
            {items.map((item, i) => {
              const itemNutrition = getItemNutrition(item)
              const name = getFoodDisplayName(item.foodId, item.customName)
              return (
                <li
                  key={item.id}
                  className={`flex items-center gap-1 ${
                    i > 0 ? 'border-t border-line-soft' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => openItem(item.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left active:bg-cream-dark"
                  >
                    <FoodIcon id={item.iconId} className="h-11 w-11 shrink-0 object-contain" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-bold text-ink">{name}</p>
                      <p className="text-[12.5px] font-semibold text-muted">
                        {itemQuantityLabel(item)}
                      </p>
                    </div>
                    <span className="shrink-0 text-[13px] font-bold text-ink-soft">
                      {itemNutrition.calories} kcal
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${name}`}
                    onClick={() => removeItem(date, meal, item.id, mode)}
                    className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-danger active:bg-cream-dark"
                  >
                    <Trash2 size={16} strokeWidth={2.2} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="mt-6">
        <h2 className="text-[15px] font-extrabold text-ink">How was it?</h2>
        <div className="mt-3 flex justify-center gap-5">
          {MOODS.map(({ value, emoji, label, ring }) => {
            const selected = mood === value
            return (
              <button
                key={value}
                type="button"
                aria-label={label}
                aria-pressed={selected}
                onClick={() => {
                  setMood(value)
                  saveMeta({ mood: value })
                }}
                className={`flex h-14 w-14 items-center justify-center rounded-full bg-paper text-3xl shadow-card transition-all ${
                  selected ? `ring-2 ${ring} ring-offset-2 ring-offset-cream` : 'active:bg-cream-dark'
                }`}
              >
                {emoji}
              </button>
            )
          })}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-[15px] font-extrabold text-ink">Notes</h2>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => saveMeta({ mealNote: note.trim() })}
          placeholder="Add a note (optional)..."
          rows={3}
          className="mt-2 w-full resize-none rounded-field border border-line bg-paper px-4 py-3 text-[15px] font-semibold text-ink shadow-card outline-none placeholder:text-muted focus:border-brand"
        />
      </section>
    </Screen>
  )
}
