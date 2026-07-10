import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronRight,
  CircleAlert,
  Flame,
  HelpCircle,
  Info,
  LogOut,
  Pencil,
  Settings,
  ShieldCheck,
  Target,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Screen } from '../components/Screen'
import { Illustration } from '../components/Illustration'
import { showToast } from '../components/toast'
import { DEFAULT_AVATAR } from '../data/avatars'
import { todayISO, weekDates, weekStart } from '../lib/dates'
import { computeStreaks, loggedMealsInRange } from '../lib/progressStats'
import { usePlans, useUser } from '../state/useAppData'
import { dataService } from '../services/data'

type MenuItem = {
  label: string
  icon: LucideIcon
  path?: string
  iconBg: string
  iconColor: string
}

const MENU_GROUPS: MenuItem[][] = [
  [
    {
      label: 'Reminders',
      icon: Bell,
      path: '/reminders',
      iconBg: 'bg-[#fef3e2]',
      iconColor: 'text-[#e08a20]',
    },
    {
      label: 'Preferences',
      icon: Settings,
      path: '/preferences',
      iconBg: 'bg-[#eaf3fc]',
      iconColor: 'text-[#2563b8]',
    },
    {
      label: 'My Goals',
      icon: Target,
      path: '/goals',
      iconBg: 'bg-brand-tint',
      iconColor: 'text-brand-dark',
    },
  ],
  [
    {
      label: 'About Nutri',
      icon: Info,
      iconBg: 'bg-[#f0ebfc]',
      iconColor: 'text-[#7c5cbf]',
    },
    {
      label: 'Help & Support',
      icon: HelpCircle,
      iconBg: 'bg-[#e6f5f0]',
      iconColor: 'text-[#1f7a55]',
    },
    {
      label: 'Privacy Policy',
      icon: ShieldCheck,
      iconBg: 'bg-[#eef6e4]',
      iconColor: 'text-brand',
    },
  ],
]

function MenuCard({
  items,
  onSelect,
}: {
  items: MenuItem[]
  onSelect: (item: MenuItem) => void
}) {
  return (
    <div className="overflow-hidden rounded-card border border-line-soft bg-paper shadow-card">
      {items.map(({ label, icon: Icon, path, iconBg, iconColor }, i) => (
        <button
          key={label}
          type="button"
          onClick={() => onSelect({ label, icon: Icon, path, iconBg, iconColor })}
          className={`flex w-full items-center gap-3.5 px-4 py-3.5 text-left active:bg-cream-dark ${
            i > 0 ? 'border-t border-line-soft' : ''
          }`}
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconBg}`}
          >
            <Icon size={18} strokeWidth={2.2} className={iconColor} />
          </span>
          <span className="flex-1 text-[15px] font-bold text-ink">{label}</span>
          <ChevronRight size={18} className="text-muted" />
        </button>
      ))}
    </div>
  )
}

export function Profile() {
  const user = useUser()
  const plans = usePlans()
  const navigate = useNavigate()
  const today = todayISO()

  const { streak, weekMeals } = useMemo(() => {
    const week = weekDates(weekStart(today))
    return {
      streak: computeStreaks(plans, today).current,
      weekMeals: loggedMealsInRange(plans, week),
    }
  }, [plans, today])

  const logOut = () => {
    dataService.signOut()
    navigate('/splash', { replace: true })
  }

  const openEdit = () => navigate('/profile/edit')

  const onMenuSelect = (item: MenuItem) => {
    if (item.path) navigate(item.path)
    else showToast(`${item.label} is coming soon`)
  }

  return (
    <Screen withNav>
      <section className="relative -mx-4 min-h-[26rem] overflow-hidden bg-cream">
        <Illustration
          name="profile-scene"
          className="pointer-events-none absolute inset-x-0 top-0 h-full w-full object-cover object-top"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-10 bg-gradient-to-b from-transparent to-cream"
        />

        <div className="relative z-10 px-5 pt-1">
          <div className="flex items-center justify-between">
            <h1 className="text-[22px] font-extrabold text-ink">Profile</h1>
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => showToast('No notifications yet')}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink active:bg-paper/60"
            >
              <Bell size={22} strokeWidth={2.2} />
            </button>
          </div>

          <div className="mt-10 flex flex-col items-center text-center">
            <div className="relative">
              <span className="flex h-[7.75rem] w-[7.75rem] items-center justify-center overflow-hidden rounded-full bg-brand-tint shadow-card ring-[5px] ring-paper">
                <Illustration
                  name={user?.avatarId ?? DEFAULT_AVATAR}
                  className="h-full w-full object-cover"
                />
              </span>
              <button
                type="button"
                aria-label="Edit profile"
                onClick={openEdit}
                className="absolute right-0 bottom-0 flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white shadow-card active:bg-brand-dark"
              >
                <Pencil size={16} strokeWidth={2.4} />
              </button>
            </div>

            <h2 className="mt-4 text-[20px] font-extrabold text-ink">{user?.name ?? 'Guest'}</h2>
            <p className="mt-1 text-[14px] font-semibold text-ink-soft">Good food, every day!</p>

            <div className="mt-4 flex items-center gap-2 rounded-full border border-line-soft bg-paper px-4 py-2.5 text-[14px] font-bold text-ink shadow-card">
              <Flame size={16} className="shrink-0 text-[#e08a20]" fill="#e08a20" />
              <span>
                <span className="font-extrabold">{streak}</span> day streak
              </span>
              <span aria-hidden className="text-muted">
                •
              </span>
              <span>
                <span className="font-extrabold">{weekMeals}</span> meals this week
              </span>
            </div>

            <button
              type="button"
              onClick={openEdit}
              className="mt-3 pb-1 text-[14px] font-extrabold text-brand active:opacity-70"
            >
              Edit profile
            </button>
          </div>
        </div>
      </section>

      <div className="mt-1 flex flex-col gap-3">
        {MENU_GROUPS.map((group) => (
          <MenuCard key={group[0].label} items={group} onSelect={onMenuSelect} />
        ))}

        <div className="overflow-hidden rounded-card border border-line-soft bg-paper shadow-card">
          <button
            type="button"
            onClick={logOut}
            className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left active:bg-cream-dark"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fce8e8]">
              <CircleAlert size={18} strokeWidth={2.2} className="text-danger" />
            </span>
            <span className="flex-1 text-[15px] font-bold text-danger">Log Out</span>
            <LogOut size={18} className="text-danger/70" />
          </button>
        </div>
      </div>
    </Screen>
  )
}
