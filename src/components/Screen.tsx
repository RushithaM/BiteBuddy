import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BottomNav } from './BottomNav'

/**
 * Page shell: cream background, safe-area padding, centered mobile column.
 * `withNav` reserves space for (and renders) the bottom navigation.
 */
export function Screen({
  children,
  withNav = false,
  className = '',
}: {
  children: ReactNode
  withNav?: boolean
  className?: string
}) {
  return (
    <div className="pt-safe min-h-dvh">
      <div className={`mx-auto max-w-md px-5 ${withNav ? 'pb-28' : 'pb-safe'} ${className}`}>
        {children}
      </div>
      {withNav && <BottomNav />}
    </div>
  )
}

/** Sub-screen header: back arrow, centered title, optional right slot. */
export function SubHeader({
  title,
  right,
  onBack,
}: {
  title?: string
  right?: ReactNode
  onBack?: () => void
}) {
  const navigate = useNavigate()
  return (
    <header className="flex h-14 items-center justify-between">
      <button
        aria-label="Back"
        onClick={onBack ?? (() => navigate(-1))}
        className="-ml-1 flex h-10 w-10 items-center justify-center rounded-full text-ink active:bg-cream-dark"
      >
        <ArrowLeft size={24} strokeWidth={2.2} />
      </button>
      {title && <h1 className="text-xl font-extrabold text-ink">{title}</h1>}
      <span className="flex h-10 w-10 items-center justify-end">{right}</span>
    </header>
  )
}
