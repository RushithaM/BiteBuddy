import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User } from 'lucide-react'
import { Screen, SubHeader } from '../components/Screen'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import { TextField, PasswordField } from '../components/TextField'
import { Illustration } from '../components/Illustration'
import { GoogleG } from '../components/GoogleG'
import { dataService } from '../services/data'
import { showToast } from '../components/toast'
import { DEFAULT_AVATAR } from '../data/avatars'

/** Mirrors the Login screen's layout for account creation (mock auth). */
export function Signup() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password) {
      showToast('Fill in all the fields to sign up')
      return
    }
    dataService.signIn({ name: name.trim(), email: email.trim(), avatarId: DEFAULT_AVATAR })
    navigate('/setup', { replace: true })
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

        <PrimaryButton type="submit" className="mt-1">
          Sign up
        </PrimaryButton>

        <div className="my-1 flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="text-sm font-semibold text-muted">or</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <SecondaryButton
          type="button"
          onClick={() => {
            dataService.signIn({
              name: 'Jyothish Kumar',
              email: 'jyothish@example.com',
              avatarId: DEFAULT_AVATAR,
            })
            navigate('/setup', { replace: true })
          }}
        >
          <GoogleG className="h-5 w-5" />
          Continue with Google
        </SecondaryButton>
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
