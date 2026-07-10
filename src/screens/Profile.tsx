import { useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronRight,
  CircleAlert,
  HelpCircle,
  Info,
  LogOut,
  Settings,
  ShieldCheck,
  Target,
} from 'lucide-react'
import { Screen } from '../components/Screen'
import { Illustration } from '../components/Illustration'
import { showToast } from '../components/toast'
import { DEFAULT_AVATAR } from '../data/avatars'
import { useUser } from '../state/useAppData'
import { dataService } from '../services/data'

const MENU: {
  label: string
  icon: typeof Bell
  path?: string
}[] = [
  { label: 'Reminders', icon: Bell, path: '/reminders' },
  { label: 'Preferences', icon: Settings, path: '/preferences' },
  { label: 'My Goals', icon: Target, path: '/goals' },
  { label: 'About Nutri', icon: Info },
  { label: 'Help & Support', icon: HelpCircle },
  { label: 'Privacy Policy', icon: ShieldCheck },
]

export function Profile() {
  const user = useUser()
  const navigate = useNavigate()

  const logOut = () => {
    dataService.signOut()
    navigate('/splash', { replace: true })
  }

  return (
    <Screen withNav>
      <h1 className="pt-6 text-[22px] font-extrabold text-ink">Profile</h1>

      <button
        type="button"
        onClick={() => navigate('/profile/edit')}
        className="mt-6 flex w-full flex-col items-center text-center"
      >
        <span className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-brand-tint shadow-card ring-4 ring-paper">
          <Illustration
            name={user?.avatarId ?? DEFAULT_AVATAR}
            className="h-full w-full object-cover"
          />
        </span>
        <span className="mt-3 text-[20px] font-extrabold text-ink">{user?.name ?? 'Guest'}</span>
        <span className="mt-1 text-[14px] font-semibold text-ink-soft">
          Good food, every day!
        </span>
        <span className="mt-2 text-[13px] font-extrabold text-brand">Edit profile</span>
      </button>

      <div className="mt-6 overflow-hidden rounded-card border border-line-soft bg-paper shadow-card">
        {MENU.map(({ label, icon: Icon, path }, i) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              if (path) navigate(path)
              else showToast(`${label} is coming soon`)
            }}
            className={`flex w-full items-center gap-3.5 px-4 py-3.5 text-left active:bg-cream-dark ${
              i > 0 ? 'border-t border-line-soft' : ''
            }`}
          >
            <Icon size={20} strokeWidth={2} className="text-ink-soft" />
            <span className="flex-1 text-[15px] font-bold text-ink">{label}</span>
            <ChevronRight size={18} className="text-muted" />
          </button>
        ))}

        <button
          type="button"
          onClick={logOut}
          className="flex w-full items-center gap-3.5 border-t border-line-soft px-4 py-3.5 text-left active:bg-cream-dark"
        >
          <CircleAlert size={20} strokeWidth={2} className="text-danger" />
          <span className="flex-1 text-[15px] font-bold text-danger">Log Out</span>
          <LogOut size={18} className="text-danger/60" />
        </button>
      </div>
    </Screen>
  )
}
