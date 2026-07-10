import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { Screen, SubHeader } from '../components/Screen'
import { PrimaryButton } from '../components/Buttons'
import { TextField, PasswordField } from '../components/TextField'
import { Illustration } from '../components/Illustration'
import { dataService } from '../services/data'
import { showToast } from '../components/toast'

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Enter your email and password')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const user = await dataService.signIn(email.trim(), password)
      navigate(user.setupComplete ? '/' : '/setup', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not log in')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Screen className="flex min-h-dvh flex-col">
      <SubHeader onBack={() => navigate('/welcome')} />

      <div className="flex flex-col items-center text-center">
        <h1 className="text-[26px] font-extrabold text-ink">Welcome back!</h1>
        <Illustration
          name="login-mascot"
          className="my-4 max-h-[9.5rem] w-full max-w-[11rem] object-contain"
        />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
        <TextField
          icon={<Mail size={19} />}
          type="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordField
          icon={<Lock size={19} />}
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p role="alert" className="text-center text-sm font-bold text-red-600">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => showToast('Password reset is not available in the demo')}
          className="-mt-1 self-end text-[13px] font-bold text-brand"
        >
          Forgot password?
        </button>

        <PrimaryButton type="submit" disabled={busy}>
          Login
        </PrimaryButton>
      </form>

      <p className="mt-auto pt-8 pb-6 text-center text-[15px] font-semibold text-ink-soft">
        Don&rsquo;t have an account?{' '}
        <Link to="/signup" className="font-extrabold text-brand">
          Sign up
        </Link>
      </p>
    </Screen>
  )
}
