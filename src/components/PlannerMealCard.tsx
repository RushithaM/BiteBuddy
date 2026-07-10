import { ChevronDown, CloudSun, Moon, Pencil, Plus, Sun, Sunset, Trash2 } from 'lucide-react'
import { getFoodImageUrl } from './FoodTile'
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

function MealSummaryLine({ count, kcal }: { count: number; kcal: number }) {
  return (
    <p className="mt-0.5 text-[12.5px] font-semibold">
      <span className="font-bold text-brand">
        {count} item{count !== 1 ? 's' : ''}
      </span>
      <span className="text-muted"> • {kcal} kcal</span>
    </p>
  )
}

function FoodItemThumb({ item }: { item: MealItem }) {
  const photo = getFoodImageUrl(item.foodId)
  const iconId = resolveItemIcon(item.foodId, item.iconId)

  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-cream-dark ring-1 ring-line-soft">
      {photo ? (
        <img src={photo} alt="" className="h-full w-full object-cover" />
      ) : (
        <FoodIcon id={iconId} className="h-9 w-9 object-contain" />
      )}
    </span>
  )
}

function FoodItemRow({
  item,
  done,
  onOpenItem,
  onRemove,
  className = '',
}: {
  item: MealItem
  done?: boolean
  onOpenItem: (itemId: string) => void
  onRemove: (itemId: string) => void
  className?: string
}) {
  const name = getFoodDisplayName(item.foodId, item.customName)
  const kcal = getItemNutrition(item).calories
  const detail = `${itemQuantityLabel(item)} • ${kcal} kcal`

  return (
    <li className={`flex items-center gap-2.5 py-3 ${className}`}>
      <button
        type="button"
        onClick={() => onOpenItem(item.id)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left active:opacity-80"
      >
        <FoodItemThumb item={item} />
        <span className="min-w-0 flex-1">
          <p
            className={`truncate text-[15px] font-bold ${
              done ? 'text-ink-soft line-through' : 'text-ink'
            }`}
          >
            {name}
          </p>
          <p className="mt-0.5 text-[12.5px] font-semibold text-muted">{detail}</p>
        </span>
      </button>
      <button
        type="button"
        aria-label={`Edit ${name}`}
        onClick={() => onOpenItem(item.id)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted active:bg-cream-dark"
      >
        <Pencil size={16} strokeWidth={2.2} />
      </button>
      <button
        type="button"
        aria-label={`Remove ${name}`}
        onClick={() => onRemove(item.id)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-danger active:bg-cream-dark"
      >
        <Trash2 size={16} strokeWidth={2.2} />
      </button>
    </li>
  )
}

function AddLogButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-line bg-paper px-3 py-1.5 text-[13px] font-extrabold text-brand shadow-card active:bg-cream-dark"
    >
      <Plus size={14} strokeWidth={2.6} />
      {label}
    </button>
  )
}

/** Meal card on the Plan screen — planning or logging layout. */
export function PlannerMealCard({
  meal,
  items,
  mode,
  expanded,
  onExpandedChange,
  onAdd,
  onOpenItem,
  onRemove,
}: {
  meal: MealType
  items: MealItem[]
  mode: MealMode
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
  onAdd: () => void
  onOpenItem: (itemId: string) => void
  onRemove: (itemId: string) => void
}) {
  const hasItems = items.length > 0
  const mealKcal = items.reduce((sum, item) => sum + getItemNutrition(item).calories, 0)
  const toggleExpanded = () => onExpandedChange(!expanded)

  if (!hasItems) {
    return (
      <section className="rounded-card border border-line-soft bg-paper px-4 py-4 shadow-card">
        <div className="flex items-center gap-3">
          <MealTypeIcon meal={meal} selected={mode === 'logged'} />
          <div className="min-w-0 flex-1">
            <h3 className="text-[16px] font-extrabold text-ink">{MEAL_LABELS[meal]}</h3>
            <p className="mt-0.5 text-[12.5px] font-semibold text-muted">{emptyMealCopy(mode)}</p>
          </div>
          <AddLogButton label={mode === 'logged' ? 'Log' : 'Add'} onClick={onAdd} />
        </div>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-card border border-line-soft bg-paper shadow-card">
      <div className="flex items-center gap-3 p-4">
        <MealTypeIcon meal={meal} selected={mode === 'logged'} />
        <button
          type="button"
          onClick={toggleExpanded}
          className="min-w-0 flex-1 text-left active:opacity-80"
        >
          <h3 className="text-[16px] font-extrabold text-ink">{MEAL_LABELS[meal]}</h3>
          <MealSummaryLine count={items.length} kcal={mealKcal} />
        </button>
        <button
          type="button"
          aria-label={expanded ? 'Collapse meal' : 'Expand meal'}
          onClick={toggleExpanded}
          className="flex h-10 w-8 shrink-0 items-center justify-center text-muted active:opacity-70"
        >
          <ChevronDown
            size={18}
            strokeWidth={2.4}
            className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {expanded && (
        <>
          <ul className="border-t border-line-soft px-4">
            {items.map((item, i) => (
              <FoodItemRow
                key={item.id}
                item={item}
                done={mode === 'planned' && isPlannedItemLogged(item)}
                onOpenItem={onOpenItem}
                onRemove={onRemove}
                className={i > 0 ? 'border-t border-line-soft' : undefined}
              />
            ))}
          </ul>

          <div className="flex justify-center border-t border-line-soft py-3">
            <AddLogButton
              label={mode === 'logged' ? 'Log more' : 'Add more'}
              onClick={onAdd}
            />
          </div>
        </>
      )}
    </section>
  )
}
