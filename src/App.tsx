import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useUser } from './state/useAppData'
import { ToastHost } from './components/toast'
import { Splash } from './screens/Splash'
import { Welcome } from './screens/Welcome'
import { Login } from './screens/Login'
import { Signup } from './screens/Signup'
import { Setup } from './screens/Setup'
import { Home } from './screens/Home'
import { Planner } from './screens/Planner'
import { DayPlan } from './screens/DayPlan'
import { Profile } from './screens/Profile'
import { EditProfile } from './screens/EditProfile'
import { Reminders, Preferences, MyGoals } from './screens/ProfileSettings'
import { Progress } from './screens/Progress'
import { AddFood } from './screens/AddFood'
import { AddFoodQuantity } from './screens/AddFoodQuantity'
import { MealAdded } from './screens/MealAdded'
import { MealDetails } from './screens/MealDetails'
import { MealItemDetail } from './screens/MealItemDetail'

function RequireAuth() {
  const user = useUser()
  return user ? <Outlet /> : <Navigate to="/splash" replace />
}

function RequireSetupComplete() {
  const user = useUser()
  if (!user?.setupComplete) return <Navigate to="/setup" replace />
  return <Outlet />
}

function SetupOnly() {
  const user = useUser()
  if (user?.setupComplete) return <Navigate to="/" replace />
  return <Outlet />
}

function RequireGuest() {
  const user = useUser()
  if (!user) return <Outlet />
  if (!user.setupComplete) return <Navigate to="/setup" replace />
  return <Navigate to="/" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RequireGuest />}>
          <Route path="/splash" element={<Splash />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route element={<SetupOnly />}>
            <Route path="/setup" element={<Setup />} />
          </Route>
          <Route element={<RequireSetupComplete />}>
            <Route path="/" element={<Home />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/day/:date" element={<DayPlan />} />
            <Route path="/meal/:date/:meal/item/:itemId" element={<MealItemDetail />} />
            <Route path="/meal/:date/:meal" element={<MealDetails />} />
            <Route path="/add" element={<AddFood />} />
            <Route path="/add/success" element={<MealAdded />} />
            <Route path="/add/:foodId/quantity" element={<AddFoodQuantity />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/preferences" element={<Preferences />} />
            <Route path="/goals" element={<MyGoals />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastHost />
    </BrowserRouter>
  )
}
