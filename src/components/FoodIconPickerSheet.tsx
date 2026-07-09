import { useEffect, useState } from 'react'
import { X, UtensilsCrossed } from 'lucide-react'
import { PrimaryButton } from './Buttons'
import { FoodIcon } from './FoodIcon'
import { TextField } from './TextField'
import { FOOD_ICON_OPTIONS, DEFAULT_FOOD_ICON } from '../data/food-icons'
import type { FoodIconId } from '../types'

interface FoodIconPickerSheetProps {
  open: boolean
  title: string
  /** Pre-selected icon (e.g. the catalog food's default). */
  initialIconId?: FoodIconId
  /** When set, shows a name field for custom foods. */
  customName?: string
  onCustomNameChange?: (name: string) => void
  confirmLabel?: string
  onConfirm: (iconId: FoodIconId, customName?: string) => void
  onClose: () => void
}

/** Bottom sheet for picking one of the predefined food icons. */
export function FoodIconPickerSheet({
  open,
  title,
  initialIconId = DEFAULT_FOOD_ICON,
  customName,
  onCustomNameChange,
  confirmLabel = 'Add food',
  onConfirm,
  onClose,
}: FoodIconPickerSheetProps) {
  const [iconId, setIconId] = useState<FoodIconId>(initialIconId)
  const isCustom = onCustomNameChange != null

  useEffect(() => {
    if (!open) return
    setIconId(initialIconId)
  }, [open, initialIconId])

  if (!open) return null

  const save = () => {
    if (isCustom && !customName?.trim()) return
    onConfirm(iconId, customName?.trim())
  }

  return (
    <>
      <button
        aria-label="Close icon picker"
        className="fixed inset-0 z-40 bg-ink/30"
        onClick={onClose}
      />
      <div className="pb-safe fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-[1.5rem] bg-paper px-5 pt-4 shadow-sheet">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-ink">{title}</h2>
          <button
            aria-label="Close"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink active:bg-cream-dark"
          >
            <X size={20} />
          </button>
        </div>

        {isCustom && (
          <TextField
            icon={<UtensilsCrossed size={19} />}
            autoFocus
            placeholder="Food name"
            value={customName ?? ''}
            onChange={(e) => onCustomNameChange(e.target.value)}
          />
        )}

        <p className={`${isCustom ? 'mt-5' : ''} mb-3 text-[14px] font-extrabold text-ink`}>
          Choose an icon
        </p>
        <div className="grid max-h-[40vh] grid-cols-4 gap-2.5 overflow-y-auto pb-1">
          {FOOD_ICON_OPTIONS.map(({ id, label }) => {
            const selected = id === iconId
            return (
              <button
                key={id}
                type="button"
                aria-label={label}
                aria-pressed={selected}
                onClick={() => setIconId(id)}
                className={`flex aspect-square items-center justify-center overflow-hidden rounded-2xl p-1.5 transition-colors ${
                  selected
                    ? 'bg-brand-tint ring-2 ring-brand ring-offset-2 ring-offset-paper'
                    : 'bg-cream-dark active:bg-line-soft'
                }`}
              >
                <FoodIcon id={id} className="h-full w-full object-contain" />
              </button>
            )
          })}
        </div>

        <PrimaryButton
          type="button"
          onClick={save}
          disabled={isCustom && !customName?.trim()}
          className="mt-5 mb-4"
        >
          {confirmLabel}
        </PrimaryButton>
      </div>
    </>
  )
}
