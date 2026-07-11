import { Illustration } from './Illustration'
import { LogoLockup } from './Logo'

/** Full-screen loader while the first API hydrate runs after login / app open. */
export function BootstrapLoader() {
  return (
    <div
      className="pt-safe pb-safe fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream px-6"
      role="status"
      aria-live="polite"
      aria-label="Loading your data"
    >
      <div className="scale-90 opacity-90">
        <LogoLockup />
      </div>
      <div className="bootstrap-mascot mt-8">
        <Illustration
          name="splash-mascot"
          className="h-32 w-32 object-contain"
        />
      </div>
      <p className="mt-6 text-[15px] font-extrabold text-ink">Getting things ready…</p>
      <div className="mt-3 flex items-center gap-1.5" aria-hidden>
        <span className="bootstrap-dot h-2 w-2 rounded-full bg-brand" />
        <span className="bootstrap-dot bootstrap-dot-delay-1 h-2 w-2 rounded-full bg-brand" />
        <span className="bootstrap-dot bootstrap-dot-delay-2 h-2 w-2 rounded-full bg-brand" />
      </div>
    </div>
  )
}
