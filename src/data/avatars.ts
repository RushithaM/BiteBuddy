import type { AvatarId } from '../types'

export const AVATAR_OPTIONS = [
  { id: 'avatar-apple', label: 'Apple' },
  { id: 'avatar-orange', label: 'Orange' },
  { id: 'avatar-strawberry', label: 'Strawberry' },
  { id: 'avatar-watermelon', label: 'Watermelon' },
  { id: 'avatar-peach', label: 'Peach' },
  { id: 'avatar-grapes', label: 'Grapes' },
  { id: 'avatar-corn', label: 'Corn' },
  { id: 'avatar-broccoli', label: 'Broccoli' },
  { id: 'avatar-lemon', label: 'Lemon' },
  { id: 'avatar-blueberry', label: 'Blueberry' },
  { id: 'avatar-carrot', label: 'Carrot' },
  { id: 'avatar-avocado', label: 'Avocado' },
  { id: 'avatar-banana', label: 'Banana' },
  { id: 'avatar-mushroom', label: 'Mushroom' },
  { id: 'avatar-tomato', label: 'Tomato' },
  { id: 'avatar-pineapple', label: 'Pineapple' },
] as const satisfies readonly { id: AvatarId; label: string }[]

export const DEFAULT_AVATAR: AvatarId = 'avatar-avocado'

const byId = new Map(AVATAR_OPTIONS.map((a) => [a.id, a]))

/** Maps removed / legacy stored ids to a current avatar. */
const LEGACY_ALIASES: Record<string, AvatarId> = {
  'avatar-garlic': 'avatar-mushroom',
  'avatar-pepper': 'avatar-tomato',
  'avatar-onion': 'avatar-tomato',
  'avatar-cucumber': 'avatar-broccoli',
}

export function resolveAvatarId(id: string | undefined | null): AvatarId {
  if (!id) return DEFAULT_AVATAR
  if (id in LEGACY_ALIASES) return LEGACY_ALIASES[id]
  if (byId.has(id as AvatarId)) return id as AvatarId
  return DEFAULT_AVATAR
}

export function getAvatarLabel(id: AvatarId): string {
  return byId.get(id)?.label ?? AVATAR_OPTIONS[0].label
}

/** Shared classes for avatar picker tiles — cream bg matches the mascot art. */
export function avatarTileClass(selected: boolean) {
  return `flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-cream transition-colors ${
    selected
      ? 'ring-2 ring-brand ring-offset-2 ring-offset-cream'
      : 'border border-line-soft/70 active:opacity-90'
  }`
}
