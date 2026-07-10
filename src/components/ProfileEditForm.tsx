import { useState } from 'react'
import { User } from 'lucide-react'
import { PrimaryButton } from './Buttons'
import { AvatarPickerTile } from './AvatarImage'
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
      <div className="mt-3 grid grid-cols-4 gap-2.5">
        {AVATAR_OPTIONS.map(({ id, label }) => (
          <AvatarPickerTile
            key={id}
            id={id}
            label={label}
            selected={id === avatarId}
            onSelect={() => setAvatarId(id)}
          />
        ))}
      </div>

      <PrimaryButton type="button" onClick={save} className="mt-8">
        Save changes
      </PrimaryButton>
    </>
  )
}
