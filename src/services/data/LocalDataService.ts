import type { MealItem, MealType, PlanByDate, User } from '../../types'
import type { DataService } from './DataService'
import { buildSeedPlans } from './seed'

const PLANS_KEY = 'nutri.plans.v1'
const USER_KEY = 'nutri.user.v1'

function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

export class LocalDataService implements DataService {
  private plans: PlanByDate
  private user: User | null
  private listeners = new Set<() => void>()

  constructor() {
    const stored = load<PlanByDate>(PLANS_KEY)
    if (stored) {
      this.plans = stored
    } else {
      this.plans = buildSeedPlans()
      save(PLANS_KEY, this.plans)
    }
    this.user = load<User>(USER_KEY)
  }

  private emit() {
    save(PLANS_KEY, this.plans)
    this.listeners.forEach((l) => l())
  }

  getUser() {
    return this.user
  }

  signIn(user: User) {
    this.user = user
    save(USER_KEY, user)
    this.listeners.forEach((l) => l())
  }

  signOut() {
    this.user = null
    localStorage.removeItem(USER_KEY)
    this.listeners.forEach((l) => l())
  }

  getPlans() {
    return this.plans
  }

  addFood(date: string, meal: MealType, foodId: string) {
    const items = this.plans[date]?.[meal] ?? []
    const added: MealItem = { id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, foodId }
    this.plans = {
      ...this.plans,
      [date]: { ...this.plans[date], [meal]: [...items, added] },
    }
    this.emit()
  }

  removeItem(date: string, meal: MealType, itemId: string) {
    const items = this.plans[date]?.[meal]
    if (!items) return
    this.plans = {
      ...this.plans,
      [date]: { ...this.plans[date], [meal]: items.filter((i) => i.id !== itemId) },
    }
    this.emit()
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}
