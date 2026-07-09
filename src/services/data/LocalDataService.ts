import type { MealItem, MealType, PlanByDate, User, FoodIconId, MealSlot, MealMode } from '../../types'
import type { DataService } from './DataService'
import { DEFAULT_AVATAR } from '../../data/avatars'
import { getFood } from '../../data/foods'
import { EMPTY_MEAL_SLOT } from '../../lib/mealPlans'
import { todayISO } from '../../lib/dates'
import { buildSeedPlans } from './seed'

const PLANS_KEY = 'nutri.plans.v2'
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

function normalizeItem(item: MealItem): MealItem {
  return {
    ...item,
    iconId: item.iconId ?? getFood(item.foodId).iconId,
  }
}

function normalizeMealSlot(raw: unknown, date: string): MealSlot {
  if (Array.isArray(raw)) {
    const items = raw.map(normalizeItem)
    // Legacy flat lists: today's items were shown on Home as eaten → logged.
    if (date === todayISO()) return { planned: [], logged: items }
    return { planned: items, logged: [] }
  }
  if (raw && typeof raw === 'object') {
    const slot = raw as Partial<MealSlot>
    return {
      planned: (slot.planned ?? []).map(normalizeItem),
      logged: (slot.logged ?? []).map(normalizeItem),
    }
  }
  return EMPTY_MEAL_SLOT
}

/** Migrate v1 flat arrays and backfill iconId on meal items. */
function normalizePlans(plans: Record<string, unknown>): PlanByDate {
  const next: PlanByDate = {}
  for (const [date, day] of Object.entries(plans)) {
    next[date] = {}
    for (const [meal, raw] of Object.entries((day as object) ?? {})) {
      next[date][meal as MealType] = normalizeMealSlot(raw, date)
    }
  }
  return next
}

function loadPlans(): PlanByDate {
  const v2 = load<PlanByDate>(PLANS_KEY)
  if (v2) return normalizePlans(v2)

  const v1 = load<Record<string, unknown>>('nutri.plans.v1')
  if (v1) {
    const migrated = normalizePlans(v1)
    save(PLANS_KEY, migrated)
    return migrated
  }

  const seeded = buildSeedPlans()
  save(PLANS_KEY, seeded)
  return seeded
}

function slotFor(plans: PlanByDate, date: string, meal: MealType): MealSlot {
  return plans[date]?.[meal] ?? EMPTY_MEAL_SLOT
}

function newItem(foodId: string, iconId?: FoodIconId, customName?: string): MealItem {
  const food = getFood(foodId)
  return {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    foodId,
    iconId: iconId ?? food.iconId,
    ...(customName ? { customName } : {}),
  }
}

export class LocalDataService implements DataService {
  private plans: PlanByDate
  private user: User | null
  private listeners = new Set<() => void>()

  constructor() {
    this.plans = loadPlans()
    const storedUser = load<User>(USER_KEY)
    this.user = storedUser
      ? { ...storedUser, avatarId: storedUser.avatarId ?? DEFAULT_AVATAR }
      : null
  }

  private emit() {
    save(PLANS_KEY, this.plans)
    this.listeners.forEach((l) => l())
  }

  private patchSlot(date: string, meal: MealType, slot: MealSlot) {
    this.plans = {
      ...this.plans,
      [date]: { ...this.plans[date], [meal]: slot },
    }
    this.emit()
  }

  getUser() {
    return this.user
  }

  signIn(user: User) {
    this.user = { ...user, avatarId: user.avatarId ?? DEFAULT_AVATAR }
    save(USER_KEY, this.user)
    this.listeners.forEach((l) => l())
  }

  updateUser(patch: Partial<User>) {
    if (!this.user) return
    this.user = { ...this.user, ...patch }
    save(USER_KEY, this.user)
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

  addFood(date: string, meal: MealType, foodId: string, mode: MealMode, iconId?: FoodIconId) {
    const slot = slotFor(this.plans, date, meal)
    const key = mode === 'planned' ? 'planned' : 'logged'
    this.patchSlot(date, meal, {
      ...slot,
      [key]: [...slot[key], newItem(foodId, iconId)],
    })
  }

  addCustomFood(
    date: string,
    meal: MealType,
    name: string,
    iconId: FoodIconId,
    mode: MealMode,
  ) {
    const slot = slotFor(this.plans, date, meal)
    const key = mode === 'planned' ? 'planned' : 'logged'
    this.patchSlot(date, meal, {
      ...slot,
      [key]: [...slot[key], newItem('custom', iconId, name.trim())],
    })
  }

  removeItem(date: string, meal: MealType, itemId: string, mode: MealMode) {
    const slot = slotFor(this.plans, date, meal)
    if (mode === 'planned') {
      this.patchSlot(date, meal, {
        ...slot,
        planned: slot.planned.filter((i) => i.id !== itemId),
      })
      return
    }
    // Removing from logging also reverts the planned item to pending.
    this.patchSlot(date, meal, {
      planned: slot.planned.map((i) =>
        i.id === itemId ? { ...i, loggedAt: undefined } : i,
      ),
      logged: slot.logged.filter((i) => i.id !== itemId),
    })
  }

  logPlannedItem(date: string, meal: MealType, itemId: string) {
    const slot = slotFor(this.plans, date, meal)
    const item = slot.planned.find((i) => i.id === itemId)
    if (!item || item.loggedAt) return
    const { loggedAt: _drop, ...loggedCopy } = item
    this.patchSlot(date, meal, {
      planned: slot.planned.map((i) =>
        i.id === itemId ? { ...i, loggedAt: new Date().toISOString() } : i,
      ),
      logged: [...slot.logged, loggedCopy],
    })
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}
