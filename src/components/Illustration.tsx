import { HeartMark } from './HeartMark'

/**
 * Named illustration slots. Real artwork dropped into
 * src/assets/illustrations/<name>.(png|webp|svg|jpg) is used automatically;
 * otherwise an emoji placeholder scene is rendered so layout stays true to
 * the reference designs.
 */
const files = import.meta.glob('../assets/illustrations/*.{png,webp,svg,jpg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const registry = new Map<string, string>()
for (const [path, url] of Object.entries(files)) {
  const name = path.split('/').pop()!.replace(/\.\w+$/, '')
  registry.set(name, url)
}

/** URL of a dropped-in illustration file, if present (e.g. "meal-breakfast"). */
export function getIllustrationUrl(name: string): string | undefined {
  return registry.get(name)
}

export type IllustrationName =
  | 'logo-heart'
  | 'welcome-hero'
  | 'login-bowl'
  | 'mascot-avocado'
  | 'mascot-broccoli'
  | 'avatar-user'
  | 'avatar-avocado'
  | 'avatar-tomato'
  | 'avatar-carrot'
  | 'avatar-blueberry'
  | 'avatar-broccoli'
  | 'avatar-banana'
  | 'today-day-end'

const PLACEHOLDERS: Record<IllustrationName, { node: React.ReactNode; label: string }> = {
  'logo-heart': {
    label: 'Nutri heart logo',
    node: <HeartMark className="h-full w-auto" />,
  },
  'welcome-hero': {
    label: 'Veggie bowl with tomato and avocado friends',
    node: (
      <span className="flex items-end justify-center gap-1 leading-none">
        <span className="text-5xl">🍅</span>
        <span className="text-8xl">🥗</span>
        <span className="text-6xl">🥑</span>
      </span>
    ),
  },
  'login-bowl': {
    label: 'Smiling salad bowl',
    node: <span className="text-8xl leading-none">🥗</span>,
  },
  'mascot-avocado': {
    label: 'Avocado mascot',
    node: <span className="text-4xl leading-none">🥑</span>,
  },
  'mascot-broccoli': {
    label: 'Broccoli mascot',
    node: <span className="text-4xl leading-none">🥦</span>,
  },
  'avatar-user': {
    label: 'User avatar',
    node: <span className="text-4xl leading-none">🥑</span>,
  },
  'avatar-avocado': {
    label: 'Avocado avatar',
    node: <span className="text-4xl leading-none">🥑</span>,
  },
  'avatar-tomato': {
    label: 'Tomato avatar',
    node: <span className="text-4xl leading-none">🍅</span>,
  },
  'avatar-carrot': {
    label: 'Carrot avatar',
    node: <span className="text-4xl leading-none">🥕</span>,
  },
  'avatar-blueberry': {
    label: 'Blueberry avatar',
    node: <span className="text-4xl leading-none">🫐</span>,
  },
  'avatar-broccoli': {
    label: 'Broccoli avatar',
    node: <span className="text-4xl leading-none">🥦</span>,
  },
  'avatar-banana': {
    label: 'Banana avatar',
    node: <span className="text-4xl leading-none">🍌</span>,
  },
  'today-day-end': {
    label: 'Avocado relaxing in a hammock at day\'s end',
    node: (
      <span className="flex items-end justify-center gap-2 leading-none">
        <span className="text-5xl">🌳</span>
        <span className="text-7xl">🥑</span>
        <span className="text-5xl">🌳</span>
      </span>
    ),
  },
}

export function Illustration({ name, className }: { name: IllustrationName; className?: string }) {
  const url = registry.get(name)
  const meta = PLACEHOLDERS[name]
  if (url) {
    return <img src={url} alt={meta.label} className={className} />
  }
  return (
    <span role="img" aria-label={meta.label} className={className}>
      {meta.node}
    </span>
  )
}
