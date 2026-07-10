import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { ArrowRight, Plus } from 'lucide-react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

/** Full-width pill CTA (Get Started, Login, …). */
export function PrimaryButton({ className = '', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`h-13 w-full rounded-full bg-brand text-lg font-bold text-white shadow-card transition-colors active:bg-brand-dark ${className}`}
    />
  )
}

/** Green pill with label + white circle arrow — "Add to Breakfast", etc. */
export function AddToMealButton({
  children,
  className = '',
  type = 'button',
  ...props
}: ButtonProps & { children: ReactNode }) {
  return (
    <button
      type={type}
      {...props}
      className={`relative flex h-[3.25rem] w-full items-center justify-center rounded-full bg-brand px-14 text-lg font-bold text-white shadow-card transition-colors active:bg-brand-dark disabled:opacity-50 ${className}`}
    >
      <span>{children}</span>
      <span
        aria-hidden
        className="absolute right-1.5 flex h-10 w-10 items-center justify-center rounded-full bg-paper text-brand"
      >
        <ArrowRight size={20} strokeWidth={2.4} />
      </span>
    </button>
  )
}

/** White pill with an icon slot (Continue with Google). */
export function SecondaryButton({ className = '', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`flex h-13 w-full items-center justify-center gap-2.5 rounded-full border border-line bg-paper text-lg font-bold text-ink shadow-card transition-colors active:bg-cream-dark ${className}`}
    />
  )
}

/** Small "+ Add food" pill used on the Home meal cards. */
export function AddFoodPill(props: ButtonProps) {
  return (
    <button
      {...props}
      className="inline-flex items-center gap-1.5 rounded-full bg-brand-tint px-4 py-2 text-sm font-extrabold text-brand-dark active:bg-brand/20"
    >
      <Plus size={16} strokeWidth={2.8} className="text-brand" />
      Add food
    </button>
  )
}

/** Inline green "+ Add" text button (Day Plan section headers). */
export function InlineAddButton(props: ButtonProps) {
  return (
    <button
      {...props}
      className="inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-sm font-extrabold text-brand active:bg-brand-tint"
    >
      <Plus size={15} strokeWidth={3} />
      Add
    </button>
  )
}
