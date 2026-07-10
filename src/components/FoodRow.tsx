import { Check, Trash2 } from 'lucide-react'
import { getFoodDisplayName } from '../data/foods'
import { FoodIcon } from './FoodIcon'
import type { FoodIconId } from '../types'

export type FoodRowVariant = 'planning-pending' | 'planning-done' | 'logging'

/** Thin-bordered food row inside a Day Plan meal card. */
export function FoodRow({
  foodId,
  iconId,
  customName,
  variant,
  onOpen,
  onLog,
  onRemove,
}: {
  foodId: string
  iconId: FoodIconId
  customName?: string
  variant: FoodRowVariant
  onOpen?: () => void
  onLog?: () => void
  onRemove?: () => void
}) {
  const name = getFoodDisplayName(foodId, customName)
  const done = variant === 'planning-done'

  return (
    <div
      className={`flex items-center gap-3.5 rounded-2xl border px-3 py-3 ${
        done ? 'border-brand/35 bg-brand-tint/50' : 'border-line bg-paper'
      }`}
    >
      <button
        type="button"
        onClick={onOpen}
        disabled={!onOpen}
        className="flex min-w-0 flex-1 items-center gap-3.5 text-left disabled:cursor-default"
      >
        <FoodIcon
          id={iconId}
          className={`h-[3.75rem] w-[3.75rem] shrink-0 object-contain ${done ? 'opacity-55 saturate-50' : ''}`}
        />
        <div className="min-w-0 flex-1">
          <span
            className={`block truncate text-[15px] font-bold ${done ? 'text-ink-soft line-through decoration-brand/40' : 'text-ink'}`}
          >
            {name}
          </span>
          {done && (
            <span className="mt-0.5 block text-[11.5px] font-extrabold text-brand">Logged ✓</span>
          )}
        </div>
      </button>

      {variant === 'planning-pending' && (
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            aria-label={`Mark ${name} as eaten`}
            onClick={onLog}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white active:bg-brand-dark"
          >
            <Check size={17} strokeWidth={2.8} />
          </button>
          <button
            type="button"
            aria-label={`Delete ${name}`}
            onClick={onRemove}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-paper text-danger active:bg-cream-dark"
          >
            <Trash2 size={16} strokeWidth={2.4} />
          </button>
        </div>
      )}

      {variant === 'logging' && (
        <button
          type="button"
          aria-label={`Delete ${name}`}
          onClick={onRemove}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-paper text-danger active:bg-cream-dark"
        >
          <Trash2 size={16} strokeWidth={2.4} />
        </button>
      )}
    </div>
  )
}
