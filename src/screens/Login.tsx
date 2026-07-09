import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { Screen, SubHeader } from '../components/Screen'
import { LogoLockup } from '../components/Logo'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import { TextField, PasswordField } from '../components/TextField'
import { Illustration } from '../components/Illustration'
import { GoogleG } from '../components/GoogleG'
import { dataService } from '../services/data'
import { showToast } from '../components/toast'
import { DEFAULT_AVATAR } from '../data/avatars'

/** Mock auth: any credentials sign in the demo user. */
export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const signIn = (userEmail: string) => {
    dataService.signIn({ name: 'Jyothish Kumar', email: userEmail, avatarId: DEFAULT_AVATAR })
    navigate('/', { replace: true })
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      showToast('Enter your email and password')
      return
    }
    signIn(email.trim())
  }

  return (
    <Screen className="flex min-h-dvh flex-col">
      <SubHeader onBack={() => navigate('/welcome')} />

      <div className="flex flex-col items-center text-center">
        <LogoLockup compact />
        <p className="mt-1 text-[15px] font-bold text-ink-soft">Welcome back!</p>
        <Illustration name="login-bowl" className="my-5 max-h-36 object-contain" />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
        <TextField
          icon={<Mail size={19} />}
          type="email"
          autoComplete="email"
          placeholder="Email address"
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

        <button
          type="button"
          onClick={() => showToast('Password reset is not available in the demo')}
          className="-mt-1 self-end text-[13px] font-bold text-brand"
        >
          Forgot password?
        </button>

        <PrimaryButton type="submit">Login</PrimaryButton>

        <div className="my-1 flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="text-sm font-semibold text-muted">or</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <SecondaryButton type="button" onClick={() => signIn('jyothish@example.com')}>
          <GoogleG className="h-5 w-5" />
          Continue with Google
        </SecondaryButton>
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
