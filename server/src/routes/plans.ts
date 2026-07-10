import { Router } from 'express'
import { prisma } from '../db'
import { requireAuth } from '../auth'

export const plansRouter = Router()

type Slot = {
  planned: Record<string, unknown>[]
  logged: Record<string, unknown>[]
  mood?: number
  mealNote?: string
}

plansRouter.get('/', requireAuth, async (req, res) => {
  const userId = req.userId
  const [items, metas] = await Promise.all([
    prisma.mealItem.findMany({ where: { userId }, orderBy: { dbId: 'asc' } }),
    prisma.mealMeta.findMany({ where: { userId } }),
  ])

  const plans: Record<string, Record<string, Slot>> = {}
  const slotOf = (date: string, meal: string): Slot => {
    const day = (plans[date] ??= {})
    return (day[meal] ??= { planned: [], logged: [] })
  }

  for (const it of items) {
    slotOf(it.date, it.mealType)[it.mode === 'planned' ? 'planned' : 'logged'].push({
      id: it.itemId,
      foodId: it.foodId,
      iconId: it.iconId,
      ...(it.customName ? { customName: it.customName } : {}),
      ...(it.quantity ? { quantity: it.quantity } : {}),
      ...(it.note ? { note: it.note } : {}),
      ...(it.loggedAt ? { loggedAt: it.loggedAt.toISOString() } : {}),
    })
  }
  for (const m of metas) {
    const slot = slotOf(m.date, m.mealType)
    if (m.mood != null) slot.mood = m.mood
    if (m.mealNote != null) slot.mealNote = m.mealNote
  }

  res.json(plans)
})
