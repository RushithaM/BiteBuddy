import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User } from 'lucide-react'
import { Screen, SubHeader } from '../components/Screen'
import { PrimaryButton } from '../components/Buttons'
import { TextField, PasswordField } from '../components/TextField'
import { Illustration } from '../components/Illustration'
import { dataService } from '../services/data'

export function Signup() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password) {
      setError('Fill in all the fields to sign up')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await dataService.signUp(name.trim(), email.trim(), password)
      navigate('/setup', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign up')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Screen className="flex min-h-dvh flex-col">
      <SubHeader onBack={() => navigate('/login')} />

      <div className="flex flex-col items-center text-center">
        <h1 className="text-[26px] font-extrabold text-ink">Create your account</h1>
        <Illustration
          name="login-mascot"
          className="my-4 max-h-[9.5rem] w-full max-w-[11rem] object-contain"
        />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
        <TextField
          icon={<User size={19} />}
          autoComplete="name"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
          autoComplete="new-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p role="alert" className="text-center text-sm font-bold text-red-600">
            {error}
          </p>
        )}

        <PrimaryButton type="submit" className="mt-1" disabled={busy}>
          Sign up
        </PrimaryButton>
      </form>

      <p className="mt-auto pt-8 pb-6 text-center text-[15px] font-semibold text-ink-soft">
        Already have an account?{' '}
        <Link to="/login" className="font-extrabold text-brand">
          Log in
        </Link>
      </p>
    </Screen>
  )
}
