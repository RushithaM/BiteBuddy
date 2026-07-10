import { Link, useNavigate } from 'react-router-dom'
import { Screen } from '../components/Screen'
import { LogoLockup } from '../components/Logo'
import { PrimaryButton } from '../components/Buttons'
import { Illustration } from '../components/Illustration'

/** Onboarding welcome — logo, hero illustration, Get Started CTA. */
export function Welcome() {
  const navigate = useNavigate()
  return (
    <Screen className="flex min-h-dvh flex-col">
      <div className="flex flex-col items-center pt-10 text-center">
        <LogoLockup compact />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-4">
        <Illustration
          name="welcome-hero"
          className="max-h-[min(52vh,22rem)] w-full max-w-[22rem] object-contain"
        />
      </div>

      <div className="pb-6">
        <PrimaryButton onClick={() => navigate('/signup')}>Get Started</PrimaryButton>
        <p className="mt-5 text-center text-[15px] font-semibold text-ink-soft">
          Already have an account?{' '}
          <Link to="/login" className="font-extrabold text-brand">
            Log in
          </Link>
        </p>
      </div>
    </Screen>
  )
}
