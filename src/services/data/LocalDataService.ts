import type { MealItem, MealType, PlanByDate, User, FoodIconId, MealSlot, MealMode, MealMood, MotivationalReminder } from '../../types'
import type { DataService } from './DataService'
import { DEFAULT_AVATAR } from '../../data/avatars'
import { DEFAULT_MOTIVATIONAL_TIME } from '../../data/setup'
import { getFood } from '../../data/foods'
import { EMPTY_MEAL_SLOT } from '../../lib/mealPlans'
import { todayISO } from '../../lib/dates'
import { buildSeedPlans } from './seed'
import { addItemOp, logPlannedOp, makeItem, removeItemOp, updateItemOp, updateMetaOp } from '../../lib/planOps'

const PLANS_KEY = 'nutri.plans.v2'
const USER_KEY = 'nutri.user.v1'
const PROFILE_KEY = 'nutri.profile.v1'

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

function normalizeMotivationalReminders(
  value: MotivationalReminder | boolean | undefined,
): MotivationalReminder | undefined {
  if (value === undefined) return undefined
  if (typeof value === 'boolean') return { enabled: value, time: DEFAULT_MOTIVATIONAL_TIME }
  return value
}

function normalizeUser(user: User): User {
  return {
    ...user,
    avatarId: user.avatarId ?? DEFAULT_AVATAR,
    setupComplete: user.setupComplete ?? true,
    motivationalReminders: normalizeMotivationalReminders(user.motivationalReminders),
  }
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

/** Expand legacy single-item masala-dosa breakfast into separate foods. */
function migrateLegacyMeals(plans: PlanByDate): PlanByDate {
  const today = todayISO()
  const slot = plans[today]?.breakfast
  const logged = slot?.logged ?? []
  if (logged.length === 1 && logged[0].foodId === 'masala-dosa') {
    const mk = (foodId: string, quantity: string): MealItem => {
      const food = getFood(foodId)
      return {
        id: `mig-${foodId}`,
        foodId,
        iconId: food.iconId,
        quantity,
      }
    }
    return {
      ...plans,
      [today]: {
        ...plans[today],
        breakfast: {
          planned: [],
          logged: [
            mk('dosa', '2 pieces'),
            mk('chutney', '2 tbsp'),
            mk('sambar', '1 bowl'),
          ],
          mood: slot?.mood,
          mealNote: slot?.mealNote,
        },
      },
    }
  }
  return plans
}

function loadPlans(): PlanByDate {
  const v2 = load<PlanByDate>(PLANS_KEY)
  if (v2) {
    const normalized = normalizePlans(v2)
    const migrated = migrateLegacyMeals(normalized)
    if (migrated !== normalized) save(PLANS_KEY, migrated)
    return migrated
  }

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

export class LocalDataService implements DataService {
  private plans: PlanByDate
  private user: User | null
  private listeners = new Set<() => void>()

  constructor() {
    this.plans = loadPlans()
    const storedUser = load<User>(USER_KEY)
    this.user = storedUser ? normalizeUser(storedUser) : null
  }

  private emit() {
    save(PLANS_KEY, this.plans)
    this.listeners.forEach((l) => l())
  }

  private setPlans(next: PlanByDate) {
    this.plans = next
    this.emit()
  }

  getUser() {
    return this.user
  }

  async init() {}

  async signIn(email: string, _password: string) {
    return this.establishSession({ name: 'Jyothish Kumar', email, avatarId: DEFAULT_AVATAR })
  }

  async signUp(name: string, email: string, _password: string) {
    return this.establishSession({ name, email, avatarId: DEFAULT_AVATAR })
  }

  private establishSession(seed: User): User {
    const saved = load<User>(PROFILE_KEY)
    const merged = saved?.email === seed.email ? { ...saved, ...seed } : seed
    this.user = normalizeUser({
      ...merged,
      name: seed.name || merged.name,
      email: seed.email,
      avatarId: seed.avatarId ?? merged.avatarId ?? DEFAULT_AVATAR,
      setupComplete: merged.setupComplete ?? false,
    })
    save(USER_KEY, this.user)
    save(PROFILE_KEY, this.user)
    this.listeners.forEach((l) => l())
    return this.user
  }

  updateUser(patch: Partial<User>) {
    if (!this.user) return
    this.user = { ...this.user, ...patch }
    save(USER_KEY, this.user)
    save(PROFILE_KEY, this.user)
    this.listeners.forEach((l) => l())
  }

  signOut() {
    if (this.user) save(PROFILE_KEY, this.user)
    this.user = null
    localStorage.removeItem(USER_KEY)
    this.listeners.forEach((l) => l())
  }

  getPlans() {
    return this.plans
  }

  addFood(
    date: string,
    meal: MealType,
    foodId: string,
    mode: MealMode,
    iconId?: FoodIconId,
    opts?: { quantity?: string; note?: string },
  ) {
    this.setPlans(addItemOp(this.plans, date, meal, mode, makeItem(foodId, iconId, undefined, opts)))
  }

  addCustomFood(
    date: string,
    meal: MealType,
    name: string,
    iconId: FoodIconId,
    mode: MealMode,
    opts?: { quantity?: string; note?: string },
  ) {
    this.setPlans(addItemOp(this.plans, date, meal, mode, makeItem('custom', iconId, name.trim(), opts)))
  }

  removeItem(date: string, meal: MealType, itemId: string, mode: MealMode) {
    this.setPlans(removeItemOp(this.plans, date, meal, itemId, mode))
  }

  updateItem(
    date: string,
    meal: MealType,
    itemId: string,
    mode: MealMode,
    patch: { quantity?: string; note?: string },
  ) {
    this.setPlans(updateItemOp(this.plans, date, meal, itemId, mode, patch))
  }

  logPlannedItem(date: string, meal: MealType, itemId: string) {
    const next = logPlannedOp(this.plans, date, meal, itemId, new Date().toISOString())
    if (next) this.setPlans(next)
  }

  updateMealMeta(
    date: string,
    meal: MealType,
    patch: { mood?: MealMood; mealNote?: string },
  ) {
    this.setPlans(updateMetaOp(this.plans, date, meal, patch))
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}
