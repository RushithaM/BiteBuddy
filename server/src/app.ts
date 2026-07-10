import express from 'express'
import cors from 'cors'
import type { ErrorRequestHandler } from 'express'

export const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

// Central error handler — Express 5 forwards rejected async handlers here.
const onError: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal error' })
}
app.use(onError)
