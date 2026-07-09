import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useUser } from './state/useAppData'
import { ToastHost } from './components/toast'
import { Welcome } from './screens/Welcome'
import { Login } from './screens/Login'
import { Signup } from './screens/Signup'
import { Home } from './screens/Home'
import { Planner } from './screens/Planner'
import { DayPlan } from './screens/DayPlan'
import { Profile } from './screens/Profile'
import { Progress } from './screens/Progress'
import { AddFood } from './screens/AddFood'

function RequireAuth() {
  const user = useUser()
  return user ? <Outlet /> : <Navigate to="/welcome" replace />
}

function RequireGuest() {
  const user = useUser()
  return user ? <Navigate to="/" replace /> : <Outlet />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RequireGuest />}>
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Home />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/day/:date" element={<DayPlan />} />
          <Route path="/add" element={<AddFood />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastHost />
    </BrowserRouter>
  )
}
