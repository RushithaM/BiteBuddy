import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db'
import { hashPassword, verifyPassword, signToken } from '../auth'
import { toUserJson } from '../user-json'

export const authRouter = Router()

const email = z.string().trim().toLowerCase().email()

const signupBody = z.object({
  name: z.string().trim().min(1),
  email,
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const loginBody = z.object({ email, password: z.string().min(1) })

authRouter.post('/signup', async (req, res) => {
  const parsed = signupBody.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }
  const { name, email: addr, password } = parsed.data
  const existing = await prisma.user.findUnique({ where: { email: addr } })
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists' })
    return
  }
  const user = await prisma.user.create({
    data: { name, email: addr, passwordHash: await hashPassword(password) },
  })
  res.status(201).json({ token: signToken(user.id), user: toUserJson(user) })
})

authRouter.post('/login', async (req, res) => {
  const parsed = loginBody.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message })
    return
  }
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    res.status(401).json({ error: 'Incorrect email or password' })
    return
  }
  res.json({ token: signToken(user.id), user: toUserJson(user) })
})
