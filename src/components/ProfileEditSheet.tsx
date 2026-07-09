import { useEffect, useState } from 'react'
import { User, X } from 'lucide-react'
import { PrimaryButton } from './Buttons'
import { Illustration } from './Illustration'
import { TextField } from './TextField'
import { AVATAR_OPTIONS, DEFAULT_AVATAR } from '../data/avatars'
import { dataService } from '../services/data'
import { showToast } from './toast'
import type { AvatarId, User as AppUser } from '../types'

interface ProfileEditSheetProps {
  open: boolean
  user: AppUser
  onClose: () => void
}

/** Bottom sheet for editing profile name and avatar. */
export function ProfileEditSheet({ open, user, onClose }: ProfileEditSheetProps) {
  const [name, setName] = useState(user.name)
  const [avatarId, setAvatarId] = useState<AvatarId>(user.avatarId ?? DEFAULT_AVATAR)

  useEffect(() => {
    if (!open) return
    setName(user.name)
    setAvatarId(user.avatarId ?? DEFAULT_AVATAR)
  }, [open, user.name, user.avatarId])

  if (!open) return null

  const save = () => {
    const trimmed = name.trim()
    if (!trimmed) {
      showToast('Please enter your name')
      return
    }
    dataService.updateUser({ name: trimmed, avatarId })
    showToast('Profile updated')
    onClose()
  }

  return (
    <>
      <button
        aria-label="Close profile editor"
        className="fixed inset-0 z-40 bg-ink/30"
        onClick={onClose}
      />
      <div className="pb-safe fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-[1.5rem] bg-paper px-5 pt-4 shadow-sheet">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-ink">Edit profile</h2>
          <button
            aria-label="Close"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink active:bg-cream-dark"
          >
            <X size={20} />
          </button>
        </div>

        <TextField
          icon={<User size={19} />}
          autoComplete="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <p className="mt-5 mb-3 text-[14px] font-extrabold text-ink">Choose your avatar</p>
        <div className="grid grid-cols-3 gap-3">
          {AVATAR_OPTIONS.map(({ id, label }) => {
            const selected = id === avatarId
            return (
              <button
                key={id}
                type="button"
                aria-label={label}
                aria-pressed={selected}
                onClick={() => setAvatarId(id)}
                className={`flex aspect-square items-center justify-center overflow-hidden rounded-card p-1 transition-colors ${
                  selected
                    ? 'bg-brand-tint ring-2 ring-brand ring-offset-2 ring-offset-paper'
                    : 'bg-cream-dark active:bg-line-soft'
                }`}
              >
                <Illustration name={id} className="h-full w-full rounded-[0.65rem] object-cover" />
              </button>
            )
          })}
        </div>

        <PrimaryButton type="button" onClick={save} className="mt-5 mb-4">
          Save changes
        </PrimaryButton>
      </div>
    </>
  )
}
