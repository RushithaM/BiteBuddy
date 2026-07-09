import { useNavigate } from 'react-router-dom'
import { Screen } from '../components/Screen'
import { LogoLockup } from '../components/Logo'
import { PrimaryButton } from '../components/Buttons'
import { Illustration } from '../components/Illustration'

export function Welcome() {
  const navigate = useNavigate()
  return (
    <Screen className="flex min-h-dvh flex-col">
      <div className="flex flex-1 flex-col items-center pt-12 text-center">
        <LogoLockup />

        <h1 className="mt-7 text-[27px] leading-snug font-extrabold text-ink">
          Eat simple.
          <br />
          Plan ahead.
          <br />
          Stay healthy.
        </h1>

        <p className="mt-4 max-w-60 text-[15px] leading-snug font-semibold text-ink-soft">
          Add the food you eat each day and plan your week with ease.
        </p>

        <div className="flex flex-1 items-center justify-center py-6">
          <Illustration name="welcome-hero" className="max-h-64 w-full max-w-80 object-contain" />
        </div>
      </div>

      <div className="pb-6">
        <PrimaryButton onClick={() => navigate('/login')}>Get Started</PrimaryButton>
      </div>
    </Screen>
  )
}
