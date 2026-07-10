import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { RequestHandler } from 'express'
import { JWT_SECRET } from './env'

declare global {
  namespace Express {
    interface Request {
      userId: string
    }
  }
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '30d' })
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    if (typeof payload === 'string' || typeof payload.sub !== 'string') throw new Error('bad payload')
    req.userId = payload.sub
    next()
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
  }
}
