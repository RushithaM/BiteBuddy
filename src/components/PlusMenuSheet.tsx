import { CalendarDays, ChevronRight, Droplets, Sparkles } from 'lucide-react'
import { Illustration } from './Illustration'

export type PlusMenuAction = 'log-meal' | 'plan-meal' | 'add-water' | 'custom-food'

function LogMealIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 11c0-3.5 2.5-6 6-6s6 2.5 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M5 11h14v2c0 3-2.5 5-7 5s-7-2-7-5v-2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M9 5c.5-1 1.2-1.5 2-1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 3.5V2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15 5c-.5-1-1.2-1.5-2-1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function CustomFoodIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8.5 8.5c1.8-2.2 5.2-2.2 7 0 1.4 1.7 1.4 4.1 0 5.8-1.8 2.2-5.2 2.2-7 0-1.4-1.7-1.4-4.1 0-5.8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M10 10.5c.8-.8 2.2-.8 3 0 .6.6.6 1.6 0 2.2-.8.8-2.2.8-3 0-.6-.6-.6-1.6 0-2.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const OPTIONS: {
  id: PlusMenuAction
  label: string
  hint: string
  iconBg: string
  iconColor: string
  icon: React.ReactNode
}[] = [
  {
    id: 'log-meal',
    label: 'Log a meal',
    hint: 'Record what you ate',
    iconBg: 'bg-[#e6f4ea]',
    iconColor: 'text-[#3a8f45]',
    icon: <LogMealIcon />,
  },
  {
    id: 'plan-meal',
    label: 'Plan a meal',
    hint: 'Schedule ahead',
    iconBg: 'bg-[#fff0e6]',
    iconColor: 'text-[#e85d4c]',
    icon: <CalendarDays size={22} strokeWidth={2.2} />,
  },
  {
    id: 'add-water',
    label: 'Add water',
    hint: 'Track hydration',
    iconBg: 'bg-[#e8f4fc]',
    iconColor: 'text-[#4a9fd8]',
    icon: <Droplets size={22} strokeWidth={2.2} />,
  },
  {
    id: 'custom-food',
    label: 'Create custom food',
    hint: 'Add your own item',
    iconBg: 'bg-[#f0e8f8]',
    iconColor: 'text-[#8b5cf6]',
    icon: <CustomFoodIcon />,
  },
]

/** Bottom sheet quick-actions menu from the center + FAB. */
export function PlusMenuSheet({
  open,
  onClose,
  onAction,
}: {
  open: boolean
  onClose: () => void
  onAction: (action: PlusMenuAction) => void
}) {
  if (!open) return null

  return (
    <>
      <button
        aria-label="Close menu"
        className="fixed inset-0 z-40 bg-ink/40"
        onClick={onClose}
      />
      <div className="pb-safe fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md">
        <div className="overflow-hidden rounded-t-[1.75rem] bg-[#fdfbf7] shadow-sheet">
          <div className="flex justify-center pt-3">
            <span className="h-1 w-10 rounded-full bg-line" aria-hidden />
          </div>

          <div className="relative px-5 pt-4 pb-1">
            <h2 className="text-center text-[18px] font-extrabold text-ink">
              What would you like to do?
            </h2>
            <span className="absolute top-3.5 right-8 flex gap-0.5" aria-hidden>
              <Sparkles size={14} className="text-amber-400" fill="currentColor" />
              <Sparkles size={10} className="mt-1 text-amber-300" fill="currentColor" />
            </span>
          </div>

          <ul className="mx-4 mt-3 overflow-hidden rounded-[1.125rem] border border-line-soft bg-white shadow-card">
            {OPTIONS.map(({ id, label, hint, iconBg, iconColor, icon }, i) => (
              <li key={id} className={i > 0 ? 'border-t border-line-soft' : ''}>
                <button
                  type="button"
                  onClick={() => onAction(id)}
                  className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left active:bg-cream-dark/40"
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconBg} ${iconColor}`}
                  >
                    {icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-bold text-ink">{label}</span>
                    <span className="mt-0.5 block text-[13px] font-medium text-muted">{hint}</span>
                  </span>
                  <ChevronRight size={18} className="shrink-0 text-line" strokeWidth={2.2} />
                </button>
              </li>
            ))}
          </ul>

          <div className="overflow-hidden bg-white">
            <Illustration
              name="plus-menu-scene"
              className="block w-full h-[6.75rem] object-cover object-bottom"
            />
          </div>
        </div>
      </div>
    </>
  )
}
