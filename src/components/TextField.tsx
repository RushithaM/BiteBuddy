import { useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: ReactNode
}

export function TextField({ icon, className = '', ...props }: TextFieldProps) {
  return (
    <label
      className={`flex h-13 items-center gap-3 rounded-field border border-line bg-paper px-4 shadow-card focus-within:border-brand ${className}`}
    >
      <span className="shrink-0 text-muted">{icon}</span>
      <input
        {...props}
        className="h-full w-full bg-transparent text-[15px] font-semibold text-ink outline-none placeholder:font-semibold placeholder:text-muted"
      />
    </label>
  )
}

export function PasswordField({ icon, ...props }: TextFieldProps) {
  const [visible, setVisible] = useState(false)
  return (
    <label className="flex h-13 items-center gap-3 rounded-field border border-line bg-paper px-4 shadow-card focus-within:border-brand">
      <span className="shrink-0 text-muted">{icon}</span>
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className="h-full w-full bg-transparent text-[15px] font-semibold text-ink outline-none placeholder:font-semibold placeholder:text-muted"
      />
      <button
        type="button"
        aria-label={visible ? 'Hide password' : 'Show password'}
        onClick={() => setVisible((v) => !v)}
        className="shrink-0 text-muted"
      >
        {visible ? <EyeOff size={19} /> : <Eye size={19} />}
      </button>
    </label>
  )
}
