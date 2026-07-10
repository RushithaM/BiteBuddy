import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogoLockup } from '../components/Logo'
import { Illustration } from '../components/Illustration'

const SPLASH_MS = 2500

/** Opening screen — logo, tagline, waving avocado mascot. Auto-advances to Welcome. */
export function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = window.setTimeout(() => navigate('/welcome', { replace: true }), SPLASH_MS)
    return () => window.clearTimeout(timer)
  }, [navigate])

  return (
    <button
      type="button"
      aria-label="Continue to welcome"
      onClick={() => navigate('/welcome', { replace: true })}
      className="pt-safe pb-safe flex min-h-dvh w-full flex-col bg-cream active:bg-cream"
    >
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6">
        <div className="flex flex-col items-center pt-[18vh] text-center">
          <LogoLockup />
          <p className="mt-6 max-w-[15rem] text-[17px] leading-snug font-bold text-ink-soft">
            Eat simple.
            <br />
            Plan ahead.
            <br />
            Stay healthy.
          </p>
        </div>

        <div className="mt-auto flex justify-center pb-4">
          <Illustration
            name="splash-mascot"
            className="max-h-[42vh] w-full max-w-[19rem] object-contain object-bottom"
          />
        </div>
      </div>
    </button>
  )
}
