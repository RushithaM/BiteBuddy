import type { FoodIconId, MealMode, MealMood, MealType, PlanByDate, User } from '../../types'
import type { DataService } from './DataService'
import { api, ApiError, TOKEN_KEY, setOnUnauthorized } from '../api/client'
import type { ApiFood, AuthResponse } from '../api/client'
import { setCatalog } from '../../data/foods'
import { applyCatalogNutrition } from '../../data/nutrition'
import { addItemOp, logPlannedOp, makeItem, removeItemOp, updateMetaOp } from '../../lib/planOps'
import { showToast } from '../../components/toast'

/**
 * API-backed DataService. Keeps an in-memory cache so the synchronous
 * interface (useSyncExternalStore) keeps working: hydrate on init/login,
 * apply writes optimistically, revert + toast when the request fails.
 */
export class ApiDataService implements DataService {
  private plans: PlanByDate = {}
  private user: User | null = null
  private listeners = new Set<() => void>()

  async init() {
    setOnUnauthorized(() => this.clearSession())
    if (!localStorage.getItem(TOKEN_KEY)) return
    try {
      await this.hydrate()
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return
      showToast('Could not load your data — check your connection')
    }
  }

  private async hydrate() {
    const [user, plans, foods] = await Promise.all([
      api<User>('/me'),
      api<PlanByDate>('/plans'),
      api<ApiFood[]>('/foods'),
    ])
    setCatalog(foods)
    applyCatalogNutrition(foods)
    this.user = user
    this.plans = plans
    this.emit()
  }

  private clearSession() {
    localStorage.removeItem(TOKEN_KEY)
    this.user = null
    this.plans = {}
    this.emit()
  }

  private emit() {
    this.listeners.forEach((l) => l())
  }

  private mutate(next: PlanByDate, request: () => Promise<unknown>) {
    const prev = this.plans
    this.plans = next
    this.emit()
    request().catch((e: unknown) => {
      this.plans = prev
      this.emit()
      showToast(e instanceof Error ? e.message : 'Something went wrong')
    })
  }

  getUser() {
    return this.user
  }

  async signIn(email: string, password: string) {
    const { token, user } = await api<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    localStorage.setItem(TOKEN_KEY, token)
    await this.hydrate()
    return user
  }

  async signUp(name: string, email: string, password: string) {
    const { token, user } = await api<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: { name, email, password },
    })
    localStorage.setItem(TOKEN_KEY, token)
    await this.hydrate()
    return user
  }

  updateUser(patch: Partial<User>) {
    if (!this.user) return
    const prev = this.user
    this.user = { ...this.user, ...patch }
    this.emit()
    api<User>('/me', { method: 'PATCH', body: patch }).catch((e: unknown) => {
      this.user = prev
      this.emit()
      showToast(e instanceof Error ? e.message : 'Could not save changes')
    })
  }

  signOut() {
    this.clearSession()
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
    const item = makeItem(foodId, iconId, undefined, opts)
    this.mutate(addItemOp(this.plans, date, meal, mode, item), () =>
      api('/meals', {
        method: 'POST',
        body: { id: item.id, date, meal, mode, foodId, iconId: item.iconId, quantity: opts?.quantity, note: opts?.note },
      }),
    )
  }

  addCustomFood(
    date: string,
    meal: MealType,
    name: string,
    iconId: FoodIconId,
    mode: MealMode,
    opts?: { quantity?: string; note?: string },
  ) {
    const item = makeItem('custom', iconId, name.trim(), opts)
    this.mutate(addItemOp(this.plans, date, meal, mode, item), () =>
      api('/meals', {
        method: 'POST',
        body: {
          id: item.id,
          date,
          meal,
          mode,
          foodId: 'custom',
          customName: item.customName,
          iconId,
          quantity: opts?.quantity,
          note: opts?.note,
        },
      }),
    )
  }

  removeItem(date: string, meal: MealType, itemId: string, mode: MealMode) {
    this.mutate(removeItemOp(this.plans, date, meal, itemId, mode), () =>
      api(`/meals/${encodeURIComponent(itemId)}?mode=${mode}`, { method: 'DELETE' }),
    )
  }

  logPlannedItem(date: string, meal: MealType, itemId: string) {
    const next = logPlannedOp(this.plans, date, meal, itemId, new Date().toISOString())
    if (!next) return
    this.mutate(next, () => api(`/meals/${encodeURIComponent(itemId)}/log`, { method: 'POST' }))
  }

  updateMealMeta(date: string, meal: MealType, patch: { mood?: MealMood; mealNote?: string }) {
    this.mutate(updateMetaOp(this.plans, date, meal, patch), () =>
      api(`/meals/${date}/${meal}/meta`, { method: 'PUT', body: patch }),
    )
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}
