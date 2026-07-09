import { getFood } from '../data/foods'

/** Real food art dropped into src/assets/foods/<id>.png replaces the emoji tiles. */
const files = import.meta.glob('../assets/foods/*.{png,webp,jpg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const images = new Map<string, string>()
for (const [path, url] of Object.entries(files)) {
  images.set(path.split('/').pop()!.replace(/\.\w+$/, ''), url)
}

/** URL of the food's illustration, if one has been provided. */
export function getFoodImageUrl(foodId: string): string | undefined {
  return images.get(foodId)
}

interface FoodTileProps {
  foodId: string
  /** tailwind sizing classes for the tile */
  className?: string
  emojiClassName?: string
  round?: boolean
}

export function FoodTile({
  foodId,
  className = 'h-12 w-12',
  emojiClassName = 'text-2xl',
  round = true,
}: FoodTileProps) {
  const food = getFood(foodId)
  const img = images.get(foodId)
  const shape = round ? 'rounded-full' : 'rounded-xl'
  return (
    <span
      role="img"
      aria-label={food.name}
      className={`flex items-center justify-center overflow-hidden ${shape} ${className}`}
      style={{ backgroundColor: food.tint }}
    >
      {img ? (
        <img src={img} alt="" className="h-full w-full object-contain p-1" />
      ) : (
        <span className={`leading-none ${emojiClassName}`}>{food.emoji}</span>
      )}
    </span>
  )
}
