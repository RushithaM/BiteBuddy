import type { FoodIconId } from '../types'
import { getFoodIconMeta } from '../data/food-icons'

const files = import.meta.glob('../assets/food-icons/*.{png,webp,jpg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const registry = new Map<string, string>()
for (const [path, url] of Object.entries(files)) {
  const name = path.split('/').pop()!.replace(/\.\w+$/, '')
  registry.set(name, url)
}

export function getFoodIconUrl(id: FoodIconId): string | undefined {
  return registry.get(id)
}

interface FoodIconProps {
  id: FoodIconId
  className?: string
  emojiClassName?: string
}

/** Predefined food illustration (png in src/assets/food-icons/) with emoji fallback. */
export function FoodIcon({ id, className, emojiClassName = 'text-2xl' }: FoodIconProps) {
  const url = registry.get(id)
  const meta = getFoodIconMeta(id)
  if (url) {
    return <img src={url} alt={meta.label} className={className} />
  }
  return (
    <span role="img" aria-label={meta.label} className={`leading-none ${emojiClassName}`}>
      {meta.emoji}
    </span>
  )
}
