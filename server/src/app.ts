import express from 'express'
import cors from 'cors'
import type { ErrorRequestHandler } from 'express'
import { authRouter } from './routes/auth'
import { meRouter } from './routes/me'
import { foodsRouter } from './routes/foods'
import { mealsRouter } from './routes/meals'
import { plansRouter } from './routes/plans'

export const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/auth', authRouter)
app.use('/me', meRouter)
app.use('/foods', foodsRouter)
app.use('/meals', mealsRouter)
app.use('/plans', plansRouter)

const onError: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal error' })
}
app.use(onError)
