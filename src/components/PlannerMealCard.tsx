import { Check, CloudSun, Moon, Pencil, Plus, Sun, Sunset, Trash2 } from 'lucide-react'
import { MEAL_META } from './meals'
import { getFoodDisplayName, resolveItemIcon } from '../data/foods'
import { getItemNutrition, itemQuantityLabel } from '../data/nutrition'
import { emptyMealCopy, isPlannedItemLogged } from '../lib/mealPlans'
import { MEAL_LABELS, type MealItem, type MealMode, type MealType } from '../types'
import { FoodIcon } from './FoodIcon'

const MEAL_TAB_ICONS = {
  breakfast: Sun,
  lunch: CloudSun,
  snack: Sunset,
  dinner: Moon,
} as const

function MealTypeIcon({
  meal,
  selected,
}: {
  meal: MealType
  selected?: boolean
}) {
  const Icon = MEAL_TAB_ICONS[meal]
  const tint = MEAL_META[meal].sceneTint
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: tint }}
    >
      <Icon
        size={20}
        strokeWidth={2}
        className={selected ? 'text-brand' : 'text-ink-soft'}
      />
    </span>
  )
}

/** Meal card on the Plan screen — planning or logging layout. */
export function PlannerMealCard({
  meal,
  items,
  mode,
  onAdd,
  onOpenMeal,
  onOpenItem,
  onLog,
  onRemove,
}: {
  meal: MealType
  items: MealItem[]
  mode: MealMode
  onAdd: () => void
  onOpenMeal?: () => void
  onOpenItem: (itemId: string) => void
  onLog?: (itemId: string) => void
  onRemove: (itemId: string) => void
}) {
  const hasItems = items.length > 0
  const mealKcal = items.reduce((sum, item) => sum + getItemNutrition(item).calories, 0)

  if (mode === 'planned') {
    return (
      <section className="overflow-hidden rounded-card border border-line-soft bg-paper shadow-card">
        <div className="flex items-start justify-between gap-3 p-4 pb-3">
          <button
            type="button"
            onClick={hasItems ? onOpenMeal : undefined}
            disabled={!hasItems}
            className="flex min-w-0 flex-1 items-start gap-3 text-left disabled:cursor-default"
          >
            <MealTypeIcon meal={meal} />
            <div className="min-w-0 pt-0.5">
              <h3 className="text-[16px] font-extrabold text-ink">{MEAL_LABELS[meal]}</h3>
              {!hasItems ? (
                <p className="mt-0.5 text-[13px] font-semibold text-muted">
                  {emptyMealCopy('planned')}
                </p>
              ) : (
                <p className="mt-0.5 text-[12px] font-bold text-brand">
                  {items.length} item{items.length !== 1 ? 's' : ''} planned
                </p>
              )}
            </div>
          </button>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-brand-tint px-2.5 py-1.5 text-[13px] font-extrabold text-brand active:bg-brand/15"
          >
            <Plus size={15} strokeWidth={2.8} />
            Add
          </button>
        </div>

        {hasItems && (
          <ul className="border-t border-line-soft px-3 py-2">
            {items.map((item, i) => {
              const done = isPlannedItemLogged(item)
              const name = getFoodDisplayName(item.foodId, item.customName)
              const kcal = getItemNutrition(item).calories
              return (
                <li
                  key={item.id}
                  className={`flex items-center gap-3 py-2.5 ${
                    i > 0 ? 'border-t border-line-soft' : ''
                  }`}
                >
                  <FoodIcon
                    id={resolveItemIcon(item.foodId, item.iconId)}
                    className={`h-10 w-10 shrink-0 object-contain ${done ? 'opacity-55' : ''}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-[14px] font-bold ${
                        done ? 'text-ink-soft line-through' : 'text-ink'
                      }`}
                    >
                      {name}
                    </p>
                    <p className="text-[12px] font-semibold text-muted">{kcal} kcal</p>
                  </div>
                  {done ? (
                    <span className="shrink-0 text-[11px] font-extrabold text-brand">Logged</span>
                  ) : (
                    <div className="flex shrink-0 items-center gap-1">
                      {onLog && (
                        <button
                          type="button"
                          aria-label={`Mark ${name} as eaten`}
                          onClick={() => onLog(item.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white shadow-card active:bg-brand-dark"
                        >
                          <Check size={15} strokeWidth={2.8} />
                        </button>
                      )}
                      <button
                        type="button"
                        aria-label={`Remove ${name}`}
                        onClick={() => onRemove(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-danger/80 active:bg-cream-dark"
                      >
                        <Trash2 size={15} strokeWidth={2.2} />
                      </button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        {hasItems && (
          <div className="flex items-center justify-between border-t border-line-soft bg-cream/40 px-4 py-2">
            <span className="text-[12px] font-bold text-muted">Meal total</span>
            <span className="text-[13px] font-extrabold text-brand">{mealKcal} kcal</span>
          </div>
        )}
      </section>
    )
  }

  if (!hasItems) {
    return (
      <section className="rounded-card border border-dashed border-line bg-paper/80 px-4 py-3.5 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <MealTypeIcon meal={meal} />
            <div>
              <h3 className="text-[15px] font-extrabold text-ink">{MEAL_LABELS[meal]}</h3>
              <p className="text-[12.5px] font-semibold text-muted">{emptyMealCopy('logged')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="text-[13px] font-extrabold text-brand active:opacity-70"
          >
            + Log
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-card border border-line-soft bg-paper shadow-card">
      <button
        type="button"
        onClick={onOpenMeal}
        className="flex w-full items-center gap-3 p-4 text-left active:bg-cream-dark/50"
      >
        <MealTypeIcon meal={meal} selected />
        <div className="min-w-0 flex-1">
          <h3 className="text-[16px] font-extrabold text-ink">{MEAL_LABELS[meal]}</h3>
          <p className="text-[12px] font-bold text-brand">{mealKcal} kcal total</p>
        </div>
      </button>

      <ul className="border-t border-line-soft px-3 py-1">
        {items.map((item, i) => {
          const name = getFoodDisplayName(item.foodId, item.customName)
          const nutrition = getItemNutrition(item)
          const detail = `${itemQuantityLabel(item)} • ${nutrition.calories} kcal`
          return (
            <li
              key={item.id}
              className={`flex items-center gap-3 py-3 ${
                i > 0 ? 'border-t border-line-soft' : ''
              }`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cream-dark ring-2 ring-line-soft">
                <FoodIcon
                  id={resolveItemIcon(item.foodId, item.iconId)}
                  className="h-full w-full object-contain p-0.5"
                />
              </span>
              <button
                type="button"
                onClick={() => onOpenItem(item.id)}
                className="min-w-0 flex-1 text-left active:opacity-80"
              >
                <p className="truncate text-[15px] font-bold text-ink">{name}</p>
                <p className="mt-0.5 text-[12.5px] font-semibold text-muted">{detail}</p>
              </button>
              <button
                type="button"
                aria-label={`Edit ${name}`}
                onClick={() => onOpenItem(item.id)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line-soft bg-paper text-muted shadow-card active:bg-cream-dark"
              >
                <Pencil size={15} strokeWidth={2.2} />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
