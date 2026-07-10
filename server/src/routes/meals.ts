import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../db'
import { requireAuth } from '../auth'

export const mealsRouter = Router()
mealsRouter.use(requireAuth)

export const mealTypeEnum = z.enum(['breakfast', 'lunch', 'snack', 'dinner'])
export const modeEnum = z.enum(['planned', 'logged'])
export const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be yyyy-mm-dd')

const createBody = z.object({
  id: z.string().min(1),
  date: dateStr,
  meal: mealTypeEnum,
  mode: modeEnum,
  foodId: z.string().min(1),
  customName: z.string().trim().min(1).optional(),
  iconId: z.string().min(1),
  quantity: z.string().optional(),
  note: z.string().optional(),
})

mealsRouter.post('/', async (req, res) => {
  const parsed = createBody.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }
  const b = parsed.data
  try {
    await prisma.mealItem.create({
      data: {
        userId: req.userId,
        itemId: b.id,
        date: b.date,
        mealType: b.meal,
        mode: b.mode,
        foodId: b.foodId,
        customName: b.customName,
        iconId: b.iconId,
        quantity: b.quantity,
        note: b.note,
      },
    })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      res.status(409).json({ error: 'Item already exists' })
      return
    }
    throw e
  }
  res.status(201).json({ ok: true })
})

mealsRouter.post('/:id/log', async (req, res) => {
  const itemId = req.params.id
  const planned = await prisma.mealItem.findUnique({
    where: { userId_itemId_mode: { userId: req.userId, itemId, mode: 'planned' } },
  })
  if (!planned) {
    res.status(404).json({ error: 'Planned item not found' })
    return
  }
  if (planned.loggedAt) {
    res.json({ ok: true })
    return
  }
  await prisma.$transaction([
    prisma.mealItem.update({ where: { dbId: planned.dbId }, data: { loggedAt: new Date() } }),
    prisma.mealItem.create({
      data: {
        userId: req.userId,
        itemId,
        date: planned.date,
        mealType: planned.mealType,
        mode: 'logged',
        foodId: planned.foodId,
        customName: planned.customName,
        iconId: planned.iconId,
        quantity: planned.quantity,
        note: planned.note,
      },
    }),
  ])
  res.json({ ok: true })
})

const updateBody = z
  .object({
    quantity: z.string(),
    note: z.string(),
  })
  .partial()
  .strict()

mealsRouter.patch('/:id', async (req, res) => {
  const mode = modeEnum.safeParse(req.query.mode)
  if (!mode.success) {
    res.status(400).json({ error: 'mode query param must be planned or logged' })
    return
  }
  const body = updateBody.safeParse(req.body)
  if (!body.success) {
    res.status(400).json({ error: 'Invalid update payload' })
    return
  }
  if (Object.keys(body.data).length === 0) {
    res.status(400).json({ error: 'No fields to update' })
    return
  }
  const { count } = await prisma.mealItem.updateMany({
    where: { userId: req.userId, itemId: req.params.id, mode: mode.data },
    data: body.data,
  })
  if (count === 0) {
    res.status(404).json({ error: 'Item not found' })
    return
  }
  res.json({ ok: true })
})

mealsRouter.delete('/:id', async (req, res) => {
  const mode = modeEnum.safeParse(req.query.mode)
  if (!mode.success) {
    res.status(400).json({ error: 'mode query param must be planned or logged' })
    return
  }
  const { count } = await prisma.mealItem.deleteMany({
    where: { userId: req.userId, itemId: req.params.id, mode: mode.data },
  })
  if (count === 0) {
    res.status(404).json({ error: 'Item not found' })
    return
  }
  if (mode.data === 'logged') {
    await prisma.mealItem.updateMany({
      where: { userId: req.userId, itemId: req.params.id, mode: 'planned' },
      data: { loggedAt: null },
    })
  }
  res.status(204).end()
})

const metaBody = z
  .object({
    mood: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    mealNote: z.string(),
  })
  .partial()
  .strict()

mealsRouter.put('/:date/:meal/meta', async (req, res) => {
  const params = z.object({ date: dateStr, meal: mealTypeEnum }).safeParse(req.params)
  const body = metaBody.safeParse(req.body)
  if (!params.success || !body.success) {
    res.status(400).json({ error: 'Invalid meal meta payload' })
    return
  }
  const { date, meal } = params.data
  await prisma.mealMeta.upsert({
    where: { userId_date_mealType: { userId: req.userId, date, mealType: meal } },
    create: { userId: req.userId, date, mealType: meal, ...body.data },
    update: body.data,
  })
  res.json({ ok: true })
})
