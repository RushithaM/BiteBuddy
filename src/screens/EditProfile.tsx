import { useNavigate } from 'react-router-dom'
import { Screen, SubHeader } from '../components/Screen'
import { ProfileEditForm } from '../components/ProfileEditForm'
import { useUser } from '../state/useAppData'

/** Full-screen edit profile — name and avatar picker. */
export function EditProfile() {
  const user = useUser()
  const navigate = useNavigate()

  if (!user) return null

  return (
    <Screen className="flex min-h-dvh flex-col">
      <SubHeader title="Edit profile" onBack={() => navigate('/profile')} />
      <div className="flex flex-1 flex-col pt-2">
        <ProfileEditForm user={user} onSaved={() => navigate('/profile')} />
      </div>
    </Screen>
  )
}
