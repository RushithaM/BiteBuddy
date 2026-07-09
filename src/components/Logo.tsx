import { Illustration } from './Illustration'

export function LogoLockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <Illustration
        name="logo-heart"
        className={`w-auto object-contain ${compact ? 'h-11' : 'h-16'}`}
      />
      <span
        className={`font-extrabold tracking-tight text-brand-deep ${compact ? 'text-3xl' : 'text-4xl'}`}
      >
        Nutri
      </span>
    </div>
  )
}
