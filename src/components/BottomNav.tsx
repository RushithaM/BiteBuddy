import { CalendarDays, Home, Plus, TrendingUp, User } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'

/**
 * Fixed bottom navigation: Today · Plan · Add (FAB) · Progress · Profile.
 */
export function BottomNav() {
  const navigate = useNavigate()

  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-20 border-t border-line-soft bg-paper/95 backdrop-blur">
      <div className="mx-auto grid h-16 max-w-md grid-cols-5 items-center px-1">
        <Tab to="/" label="Today" icon={<Home size={20} strokeWidth={2.2} />} />
        <Tab to="/planner" label="Plan" icon={<CalendarDays size={20} strokeWidth={2.2} />} />

        <button
          onClick={() => navigate('/add')}
          aria-label="Add food"
          className="flex flex-col items-center gap-0.5"
        >
          <span className="-mt-7 flex h-13 w-13 items-center justify-center rounded-full bg-brand text-white shadow-fab ring-4 ring-cream">
            <Plus size={26} strokeWidth={2.6} />
          </span>
        </button>

        <Tab to="/progress" label="Progress" icon={<TrendingUp size={20} strokeWidth={2.2} />} />
        <Tab to="/profile" label="Profile" icon={<User size={20} strokeWidth={2.2} />} />
      </div>
    </nav>
  )
}

function Tab({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 ${isActive ? 'text-brand' : 'text-muted'}`
      }
    >
      {icon}
      <span className="text-[10px] font-bold">{label}</span>
    </NavLink>
  )
}
