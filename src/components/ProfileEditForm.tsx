import { useState } from 'react'
import { User } from 'lucide-react'
import { PrimaryButton } from './Buttons'
import { Illustration } from './Illustration'
import { TextField } from './TextField'
import { AVATAR_OPTIONS, DEFAULT_AVATAR } from '../data/avatars'
import { dataService } from '../services/data'
import { showToast } from './toast'
import type { AvatarId, User as AppUser } from '../types'

interface ProfileEditFormProps {
  user: AppUser
  onSaved?: () => void
}

/** Name + avatar picker used on the Edit Profile screen. */
export function ProfileEditForm({ user, onSaved }: ProfileEditFormProps) {
  const [name, setName] = useState(user.name)
  const [avatarId, setAvatarId] = useState<AvatarId>(user.avatarId ?? DEFAULT_AVATAR)

  const save = () => {
    const trimmed = name.trim()
    if (!trimmed) {
      showToast('Please enter your name')
      return
    }
    dataService.updateUser({ name: trimmed, avatarId })
    showToast('Profile updated')
    onSaved?.()
  }

  return (
    <>
      <TextField
        icon={<User size={19} />}
        autoComplete="name"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <p className="mt-6 text-[15px] font-extrabold text-ink">Choose your avatar</p>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {AVATAR_OPTIONS.map(({ id, label }) => {
          const selected = id === avatarId
          return (
            <button
              key={id}
              type="button"
              aria-label={label}
              aria-pressed={selected}
              onClick={() => setAvatarId(id)}
              className={`flex aspect-square items-center justify-center overflow-hidden rounded-card p-1.5 transition-colors ${
                selected
                  ? 'bg-brand-tint ring-2 ring-brand ring-offset-2 ring-offset-cream'
                  : 'bg-paper shadow-card active:bg-cream-dark'
              }`}
            >
              <Illustration name={id} className="h-full w-full rounded-[0.65rem] object-cover" />
            </button>
          )
        })}
      </div>

      <PrimaryButton type="button" onClick={save} className="mt-8">
        Save changes
      </PrimaryButton>
    </>
  )
}
