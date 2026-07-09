import {
  Bell,
  ChevronRight,
  CircleAlert,
  HelpCircle,
  Info,
  LogOut,
  Settings,
  ShieldCheck,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Screen } from '../components/Screen'
import { Illustration } from '../components/Illustration'
import { showToast } from '../components/toast'
import { useUser } from '../state/useAppData'
import { dataService } from '../services/data'

const MENU = [
  { label: 'Reminders', icon: Bell },
  { label: 'Preferences', icon: Settings },
  { label: 'About Nutri', icon: Info },
  { label: 'Help & Support', icon: HelpCircle },
  { label: 'Privacy Policy', icon: ShieldCheck },
]

export function Profile() {
  const user = useUser()
  const navigate = useNavigate()

  const logOut = () => {
    dataService.signOut()
    navigate('/welcome', { replace: true })
  }

  return (
    <Screen withNav>
      <h1 className="pt-6 text-[22px] font-extrabold text-ink">Profile</h1>

      {/* Identity card */}
      <button
        onClick={() => showToast('Profile editing is coming soon')}
        className="mt-4 flex w-full items-center gap-3.5 rounded-card bg-cream-dark p-3.5 text-left shadow-card active:bg-line-soft"
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-tint">
          <Illustration name="avatar-user" className="h-full w-full object-cover" />
        </span>
        <span className="flex-1">
          <span className="block text-[17px] font-extrabold text-ink">
            {user?.name ?? 'Guest'}
          </span>
          <span className="block text-[13.5px] font-semibold text-ink-soft">
            Good food, every day! 💚
          </span>
        </span>
        <ChevronRight size={20} className="text-muted" />
      </button>

      {/* Menu */}
      <div className="mt-4 overflow-hidden rounded-card bg-paper shadow-card">
        {MENU.map(({ label, icon: Icon }, i) => (
          <button
            key={label}
            onClick={() => showToast(`${label} is coming soon`)}
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
