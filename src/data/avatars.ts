import type { AvatarId } from '../types'

export const AVATAR_OPTIONS: { id: AvatarId; label: string; emoji: string }[] = [
  { id: 'avatar-avocado', label: 'Avocado', emoji: '🥑' },
  { id: 'avatar-tomato', label: 'Tomato', emoji: '🍅' },
  { id: 'avatar-carrot', label: 'Carrot', emoji: '🥕' },
  { id: 'avatar-blueberry', label: 'Blueberry', emoji: '🫐' },
  { id: 'avatar-broccoli', label: 'Broccoli', emoji: '🥦' },
  { id: 'avatar-banana', label: 'Banana', emoji: '🍌' },
]

export const DEFAULT_AVATAR: AvatarId = 'avatar-avocado'
