import { avatarTileClass, getAvatarLabel, resolveAvatarId, DEFAULT_AVATAR } from '../data/avatars'

const files = import.meta.glob('../assets/avatars/avatar-*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const registry = new Map<string, string>()
for (const [path, url] of Object.entries(files)) {
  const name = path.split('/').pop()!.replace(/\.\w+$/, '')
  registry.set(name, url)
}

function avatarUrl(id: string): string | undefined {
  return registry.get(resolveAvatarId(id)) ?? registry.get(DEFAULT_AVATAR)
}

/** Mascot avatar illustration (PNG only — no emoji fallback). */
export function AvatarImage({ id, className = '' }: { id: string; className?: string }) {
  const resolved = resolveAvatarId(id)
  const url = avatarUrl(id)
  const label = getAvatarLabel(resolved)

  if (!url) return null

  return <img src={url} alt={label} className={`block ${className}`} />
}

export function avatarImageUrl(id: string): string | undefined {
  return avatarUrl(id)
}

/** Avatar picker tile — cream background matches the mascot art. */
export function AvatarPickerTile({
  id,
  label,
  selected,
  onSelect,
}: {
  id: string
  label: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      onClick={onSelect}
      className={avatarTileClass(selected)}
    >
      <AvatarImage id={id} className="h-full w-full object-cover object-center" />
    </button>
  )
}
