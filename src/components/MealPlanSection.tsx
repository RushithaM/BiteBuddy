import { InlineAddButton } from './Buttons'
import { FoodRow, type FoodRowVariant } from './FoodRow'
import { resolveItemIcon } from '../data/foods'
import { emptyMealCopy, isPlannedItemLogged } from '../lib/mealPlans'
import { MEAL_LABELS, type MealType, type MealItem, type MealMode } from '../types'
import { MEAL_META } from './meals'

function rowVariant(mode: MealMode, item: MealItem): FoodRowVariant {
  if (mode === 'logged') return 'logging'
  return isPlannedItemLogged(item) ? 'planning-done' : 'planning-pending'
}

/** Bordered meal card used on Day Plan / Planner — thin outline, light fill. */
export function MealPlanSection({
  meal,
  items,
  mode,
  onOpen,
  onAdd,
  onRemove,
  onLog,
  onOpenItem,
}: {
  meal: MealType
  items: MealItem[]
  mode: MealMode
  onOpen?: () => void
  onAdd: () => void
  onRemove: (itemId: string) => void
  onLog?: (itemId: string) => void
  onOpenItem?: (itemId: string) => void
}) {
  const meta = MEAL_META[meal]

  return (
    <section className="rounded-card border border-line-soft bg-paper p-3.5 shadow-card">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onOpen}
          className="flex min-w-0 flex-1 items-center gap-2 text-left active:opacity-80"
        >
          <span className="text-lg leading-none">{meta.icon}</span>
          <h2 className="text-[16px] font-extrabold text-ink">{MEAL_LABELS[meal]}</h2>
        </button>
        <InlineAddButton onClick={onAdd} />
      </div>

      {items.length > 0 ? (
        <div className="mt-2.5 flex flex-col gap-2">
          {items.map((item) => {
            const variant = rowVariant(mode, item)
            return (
              <FoodRow
                key={item.id}
                foodId={item.foodId}
                iconId={resolveItemIcon(item.foodId, item.iconId)}
                customName={item.customName}
                variant={variant}
                onOpen={onOpenItem ? () => onOpenItem(item.id) : undefined}
                onLog={
                  variant === 'planning-pending' && onLog ? () => onLog(item.id) : undefined
                }
                onRemove={
                  variant === 'planning-pending' || variant === 'logging'
                    ? () => onRemove(item.id)
                    : undefined
                }
              />
            )
          })}
        </div>
      ) : (
        <p className="mt-2.5 rounded-2xl border border-line px-3 py-3.5 text-center text-[13px] font-semibold text-muted">
          {emptyMealCopy(mode)}
        </p>
      )}
    </section>
  )
}
