import { Router } from 'express'
import { prisma } from '../db'
import { requireAuth } from '../auth'

export const foodsRouter = Router()

foodsRouter.get('/', requireAuth, async (_req, res) => {
  res.json(await prisma.food.findMany({ orderBy: { name: 'asc' } }))
})
