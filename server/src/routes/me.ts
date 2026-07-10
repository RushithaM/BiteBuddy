import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db'
import { requireAuth } from '../auth'
import { toUserJson } from '../user-json'

export const meRouter = Router()
meRouter.use(requireAuth)

const reminder = z.object({ enabled: z.boolean(), time: z.string() })

const userPatch = z
  .object({
    name: z.string().trim().min(1),
    avatarId: z.string().min(1),
    setupComplete: z.boolean(),
    goals: z.array(z.string()),
    foodPreference: z.string().min(1),
    mealReminders: z.record(z.enum(['breakfast', 'lunch', 'snack', 'dinner']), reminder),
    hydrationReminders: z.object({ enabled: z.boolean(), interval: z.string() }),
    motivationalReminders: z.union([z.boolean(), reminder]),
  })
  .partial()
  .strict()

meRouter.get('/', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  res.json(toUserJson(user))
})

meRouter.patch('/', async (req, res) => {
  const parsed = userPatch.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }
  const user = await prisma.user.update({ where: { id: req.userId }, data: parsed.data })
  res.json(toUserJson(user))
})
