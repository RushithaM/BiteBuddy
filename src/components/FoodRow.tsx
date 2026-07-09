import { useState } from 'react'
import { MoreVertical, Trash2 } from 'lucide-react'
import { getFood } from '../data/foods'
import { DishThumb } from './MealSceneThumb'

/** White row inside a Day Plan meal card: dish, name, kebab menu. */
export function FoodRow({ foodId, onRemove }: { foodId: string; onRemove: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const food = getFood(foodId)
  return (
    <div className="relative flex items-center gap-3 rounded-2xl bg-paper px-3 py-2.5 shadow-card">
      <DishThumb foodId={foodId} />
      <span className="flex-1 text-[15px] font-bold text-ink">{food.name}</span>
      <button
        aria-label={`Options for ${food.name}`}
        onClick={() => setMenuOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted active:bg-cream-dark"
      >
        <MoreVertical size={18} />
      </button>

      {menuOpen && (
        <>
          <button
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute top-11 right-2 z-20 overflow-hidden rounded-xl border border-line bg-paper shadow-card">
            <button
              onClick={() => {
                setMenuOpen(false)
                onRemove()
              }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-danger active:bg-cream-dark"
            >
              <Trash2 size={15} />
              Remove
            </button>
          </div>
        </>
      )}
    </div>
  )
}
