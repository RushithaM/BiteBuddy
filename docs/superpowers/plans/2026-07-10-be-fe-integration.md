# BiteBuddy BE + FE Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Express + Prisma + Postgres backend for BiteBuddy and integrate the existing React PWA with it, replacing mock localStorage auth/data with a real API — email/password auth only.

**Architecture:** FE stays at repo root untouched except the `DataService` seam, Login/Signup, and catalog modules. New standalone `server/` package (Express 5 + Prisma + Postgres via Docker). FE gets an `ApiDataService` that keeps an in-memory cache behind the existing synchronous `DataService` interface: hydrate on init, optimistic writes with revert + toast on failure. Online-only (no offline sync).

**Tech Stack:** Express 5, Prisma, PostgreSQL 16 (Docker), zod, bcryptjs, jsonwebtoken (HS256), vitest + supertest (server tests), vitest (FE unit tests), React 19 + Vite (existing).

**Spec:** `docs/superpowers/specs/2026-07-10-be-fe-integration-design.md`

## Global Constraints

- Auth is **email/password only**. No Google OAuth (button gets removed), no magic link, no OTP, no password reset (stays a stub toast).
- Online-only: API failures revert optimistic state and show a toast via `showToast` from `src/components/toast.tsx`. No outbox/sync.
- API JSON shapes MUST match `src/types.ts` exactly (`User`, `PlanByDate`, `MealSlot`, `MealItem`). The FE `User` has NO `id` field — never expose the DB id.
- Client generates meal-item ids (`m-<ts>-<rand>`, as today) and sends them to the server; server enforces `unique(userId, itemId, mode)`. A logged copy shares its `itemId` with its planned original — this is load-bearing for the revert-on-remove behavior.
- `foodId` is a plain string column, NOT a foreign key: custom foods use the sentinel `foodId: 'custom'` (deviation from spec's "FK", required by existing FE behavior — noted here deliberately).
- User profile extras (`goals: string[]`, `foodPreference`, `mealReminders`, `hydrationReminders`, `motivationalReminders`) match FE `User` — `goals` is an ARRAY (spec's `goalId` singular was wrong; FE is source of truth).
- Server is a standalone package in `server/` (own package.json). No npm-workspace conversion. Server runs with `tsx` in dev AND prod-start; `tsc --noEmit` is typecheck only (no build output — deployment is out of scope).
- Postgres dev creds (local only): user `bitebuddy`, password `bitebuddy`, DBs `bitebuddy` + `bitebuddy_test` on port 5432.
- Server: TypeScript strict, ESM (`"type": "module"`). Zod validation on every route body/param. Errors always `{ "error": string }` JSON.
- FE: after every FE task run `npm run build` — it must pass.
- Commit after every task. Commit messages end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- New user accounts start with EMPTY plans. Seeded demo week remains LocalDataService-only behavior.
- Docs discipline: root `CLAUDE.md` ≤ ~30 lines, pointers not content; detail lives in `.claude/docs/*`; `api-contract.md` updated at the end of Tasks 7 and 11.

---

## Phase 1 — Foundation

### Task 1: Docker Postgres

**Files:**
- Create: `docker-compose.yml`
- Create: `docker/postgres-init.sql`

**Interfaces:**
- Produces: Postgres on `localhost:5432` with DBs `bitebuddy` and `bitebuddy_test`, user/password `bitebuddy`/`bitebuddy`. All later server tasks depend on this.

- [ ] **Step 1: Write docker-compose.yml**

```yaml
services:
  db:
    image: postgres:16-alpine
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: bitebuddy
      POSTGRES_PASSWORD: bitebuddy
      POSTGRES_DB: bitebuddy
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./docker/postgres-init.sql:/docker-entrypoint-initdb.d/init.sql
volumes:
  pgdata:
```

- [ ] **Step 2: Write docker/postgres-init.sql**

```sql
CREATE DATABASE bitebuddy_test OWNER bitebuddy;
```

- [ ] **Step 3: Start and verify**

Run: `docker compose up -d && sleep 3 && docker compose exec db psql -U bitebuddy -c '\l' | grep bitebuddy`
Expected: rows for both `bitebuddy` and `bitebuddy_test`.
(If the volume already existed from a previous attempt, init.sql is skipped — run `docker compose down -v` first.)

- [ ] **Step 4: Commit**

```bash
git add docker-compose.yml docker/postgres-init.sql
git commit -m "feat: add Postgres via docker compose"
```

---

### Task 2: Server scaffold + /health

**Files:**
- Create: `server/package.json`, `server/tsconfig.json`, `server/vitest.config.ts`
- Create: `server/.env`, `server/.env.example`
- Create: `server/src/env.ts`, `server/src/app.ts`, `server/src/index.ts`
- Test: `server/test/health.test.ts`
- Modify: `.gitignore` (append server entries)

**Interfaces:**
- Produces: `app` (Express app, exported from `server/src/app.ts` for supertest), `JWT_SECRET`/`PORT` from `server/src/env.ts`. Route modules in later tasks are mounted in `app.ts`.

- [ ] **Step 1: Write server/package.json**

```json
{
  "name": "bitebuddy-server",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "start": "tsx src/index.ts",
    "typecheck": "tsc --noEmit",
    "test": "DATABASE_URL=postgresql://bitebuddy:bitebuddy@localhost:5432/bitebuddy_test JWT_SECRET=test-secret sh -c 'prisma db push --accept-data-loss && vitest run'"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^6.11.0",
    "bcryptjs": "^3.0.2",
    "cors": "^2.8.5",
    "dotenv": "^17.0.0",
    "express": "^5.1.0",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.25.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.3",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/node": "^22.0.0",
    "@types/supertest": "^6.0.3",
    "prisma": "^6.11.0",
    "supertest": "^7.1.1",
    "tsx": "^4.20.0",
    "typescript": "~5.8.3",
    "vitest": "^3.2.0"
  }
}
```

- [ ] **Step 2: Write server/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "types": ["node"],
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src", "test", "prisma"]
}
```

- [ ] **Step 3: Write server/vitest.config.ts**

Tests share one Postgres DB — files must not run in parallel workers.

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    fileParallelism: false,
  },
})
```

- [ ] **Step 4: Write env files**

`server/.env.example` (committed):

```
DATABASE_URL=postgresql://bitebuddy:bitebuddy@localhost:5432/bitebuddy
JWT_SECRET=change-me
PORT=3001
```

`server/.env` (NOT committed): same content but set `JWT_SECRET` to a random value, e.g. output of `openssl rand -hex 32`.

Append to root `.gitignore`:

```
server/node_modules
server/.env
```

- [ ] **Step 5: Write the failing test**

`server/test/health.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'

describe('GET /health', () => {
  it('returns ok without auth', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true })
  })
})
```

- [ ] **Step 6: Run test to verify it fails**

Run: `cd server && npm install && npm test`
Expected: FAIL — cannot resolve `../src/app`. (`prisma db push` step will also fail until Task 3 adds a schema; if it errors on missing schema, temporarily run `npx vitest run` directly for this task.)

- [ ] **Step 7: Write minimal implementation**

`server/src/env.ts`:

```ts
import 'dotenv/config'

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env var ${name}`)
  return value
}

export const JWT_SECRET = required('JWT_SECRET')
export const PORT = Number(process.env.PORT ?? 3001)
```

`server/src/app.ts`:

```ts
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
```

`server/src/index.ts`:

```ts
import { app } from './app'
import { PORT } from './env'

app.listen(PORT, () => {
  console.log(`bitebuddy-server listening on http://localhost:${PORT}`)
})
```

- [ ] **Step 8: Run test to verify it passes**

Run: `cd server && npx vitest run`
Expected: PASS (1 test). Also run `npm run typecheck` — clean.

- [ ] **Step 9: Commit**

```bash
git add server .gitignore
git commit -m "feat: scaffold express server with /health"
```

---

### Task 3: Prisma schema, migration, food seed

**Files:**
- Create: `server/prisma/schema.prisma`
- Create: `server/prisma/seed.ts`
- Create: `server/src/db.ts`

**Interfaces:**
- Consumes: FE catalogs `src/data/foods.ts` (`FOODS`) and `src/data/nutrition.ts` (`getFoodNutrition(id)`) — imported directly by the seed script via relative path (pure TS, no React).
- Produces: `prisma` client singleton from `server/src/db.ts`; models `User`, `Food`, `MealItem`, `MealMeta` used by all route tasks.

- [ ] **Step 1: Write server/prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                    String     @id @default(cuid())
  email                 String     @unique
  passwordHash          String
  name                  String
  avatarId              String     @default("avatar-avocado")
  setupComplete         Boolean    @default(false)
  goals                 String[]   @default([])
  foodPreference        String?
  mealReminders         Json?
  hydrationReminders    Json?
  motivationalReminders Json?
  createdAt             DateTime   @default(now())
  updatedAt             DateTime   @updatedAt
  mealItems             MealItem[]
  mealMetas             MealMeta[]
}

model Food {
  id          String @id
  name        String
  emoji       String
  tint        String
  iconId      String
  usualMeal   String
  calories    Int
  carbs       Int
  protein     Int
  fats        Int
  fiber       Int
  portionUnit String
}

model MealItem {
  dbId       Int       @id @default(autoincrement())
  userId     String
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  itemId     String
  date       String
  mealType   String
  mode       String
  foodId     String
  customName String?
  iconId     String
  quantity   String?
  note       String?
  loggedAt   DateTime?

  @@unique([userId, itemId, mode])
  @@index([userId, date])
}

model MealMeta {
  id       Int     @id @default(autoincrement())
  userId   String
  user     User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  date     String
  mealType String
  mood     Int?
  mealNote String?

  @@unique([userId, date, mealType])
}
```

- [ ] **Step 2: Create migration**

Run: `cd server && npx prisma migrate dev --name init`
Expected: migration created under `server/prisma/migrations/`, client generated, exit 0.

- [ ] **Step 3: Write server/src/db.ts**

```ts
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()
```

- [ ] **Step 4: Write server/prisma/seed.ts**

Imports the FE catalog directly — single source of food data, no copy-paste drift.

```ts
import { PrismaClient } from '@prisma/client'
import { FOODS } from '../../src/data/foods'
import { getFoodNutrition } from '../../src/data/nutrition'

const prisma = new PrismaClient()

for (const f of FOODS) {
  const n = getFoodNutrition(f.id)
  const data = {
    name: f.name,
    emoji: f.emoji,
    tint: f.tint,
    iconId: f.iconId,
    usualMeal: f.usualMeal,
    calories: n.calories,
    carbs: n.carbs,
    protein: n.protein,
    fats: n.fats,
    fiber: n.fiber,
    portionUnit: n.portionUnit,
  }
  await prisma.food.upsert({ where: { id: f.id }, create: { id: f.id, ...data }, update: data })
}

console.log(`Seeded ${FOODS.length} foods`)
await prisma.$disconnect()
```

- [ ] **Step 5: Run seed and verify**

Run: `cd server && npx prisma db seed`
Expected: `Seeded 33 foods`.
Run: `docker compose exec db psql -U bitebuddy -c 'SELECT count(*) FROM "Food";'`
Expected: `33`.

- [ ] **Step 6: Verify test DB flow works end-to-end now**

Run: `cd server && npm test`
Expected: schema pushed to `bitebuddy_test`, health test PASSes.

- [ ] **Step 7: Commit**

```bash
git add server/prisma server/src/db.ts
git commit -m "feat: add prisma schema, migration, and food seed from FE catalog"
```

---

### Task 4: Docs skeleton

**Files:**
- Create: `CLAUDE.md`
- Create: `.claude/docs/decisions.md`
- Create: `.claude/docs/api-contract.md`

**Interfaces:**
- Produces: doc files updated by Tasks 7, 11, 15.

- [ ] **Step 1: Write CLAUDE.md (root — keep ≤30 lines, pointers not content)**

```markdown
# BiteBuddy

Mobile-first nutrition tracker PWA. React 19 + Vite + Tailwind 4 frontend at
repo root; Express 5 + Prisma + Postgres backend in `server/`.

## Run

- `docker compose up -d` — Postgres (DBs: bitebuddy, bitebuddy_test)
- `cd server && npm run dev` — API on :3001 (first time: `npx prisma migrate dev && npx prisma db seed`)
- `npm run dev` — FE on :5173. With `VITE_API_URL` set in `.env.local` the FE
  uses the real API; without it, localStorage demo mode.
- Tests: `cd server && npm test` (API), `npm test` (FE unit)

## Layout

- `src/services/data/` — DataService seam; ApiDataService (remote) vs
  LocalDataService (demo). See `.claude/docs/architecture.md`.
- `src/lib/planOps.ts` — pure plan mutations shared by both services.
- `src/data/` — food/avatar catalogs (foods hydrated from API when remote).
- `server/src/routes/` — API routes. Contract: `.claude/docs/api-contract.md`
  (read it BEFORE touching endpoints; update it when they change).

## Rules

- Auth is email/password only. API shapes must match `src/types.ts`.
- Decisions log: `.claude/docs/decisions.md`.
```

- [ ] **Step 2: Write .claude/docs/decisions.md**

```markdown
# Decisions

- 2026-07-10 — Backend: Express + Prisma + PostgreSQL (Docker). Not Supabase.
- 2026-07-10 — Auth: email/password only. bcryptjs + JWT (HS256, 30d) in
  localStorage. No OAuth, no magic link, no password reset.
- 2026-07-10 — Online-only. Optimistic writes with revert + toast. No
  offline outbox.
- 2026-07-10 — Food catalog lives in Postgres, seeded from `src/data/foods.ts`
  + `nutrition.ts` (seed imports FE files — single source). FE hydrates its
  in-memory catalog from `GET /foods`.
- 2026-07-10 — New accounts start with empty plans; seeded demo week is
  LocalDataService-only.
- 2026-07-10 — Client generates meal-item ids; logged copy shares itemId with
  its planned original; server uniqueness is (userId, itemId, mode).
- 2026-07-10 — `foodId` is a plain string (sentinel `'custom'`), not an FK.
- 2026-07-10 — Server has no build step: tsx at runtime, `tsc --noEmit` for
  typecheck. Revisit when deployment becomes a goal.
```

- [ ] **Step 3: Write .claude/docs/api-contract.md (stub)**

```markdown
# API Contract

Base URL: `http://localhost:3001` (FE: `VITE_API_URL`).
All responses JSON. Errors: `{ "error": string }`.
Auth: `Authorization: Bearer <jwt>` on everything except `/health` and `/auth/*`.

## Endpoints

- `GET /health` → `{ ok: true }`

(Sections below are filled in as phases land: Auth — Task 7, Data — Task 11.)
```

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md .claude/docs
git commit -m "docs: add CLAUDE.md and docs skeleton"
```

---

## Phase 2 — Auth API

### Task 5: Auth helpers (hash, JWT, middleware)

**Files:**
- Create: `server/src/auth.ts`
- Test: `server/test/auth-helpers.test.ts`

**Interfaces:**
- Consumes: `JWT_SECRET` from `./env`.
- Produces: `hashPassword(pw): Promise<string>`, `verifyPassword(pw, hash): Promise<boolean>`, `signToken(userId): string`, `requireAuth` (Express middleware setting `req.userId`). Used by Tasks 6–11.

- [ ] **Step 1: Write the failing test**

`server/test/auth-helpers.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import express from 'express'
import request from 'supertest'
import { hashPassword, verifyPassword, signToken, requireAuth } from '../src/auth'

describe('password hashing', () => {
  it('verifies a correct password and rejects a wrong one', async () => {
    const hash = await hashPassword('hunter2hunter2')
    expect(hash).not.toContain('hunter2')
    expect(await verifyPassword('hunter2hunter2', hash)).toBe(true)
    expect(await verifyPassword('wrong-password', hash)).toBe(false)
  })
})

describe('requireAuth', () => {
  const app = express()
  app.get('/secret', requireAuth, (req, res) => {
    res.json({ userId: req.userId })
  })

  it('rejects missing token', async () => {
    const res = await request(app).get('/secret')
    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: 'Unauthorized' })
  })

  it('rejects a garbage token', async () => {
    const res = await request(app).get('/secret').set('Authorization', 'Bearer nope')
    expect(res.status).toBe(401)
  })

  it('accepts a signed token and exposes userId', async () => {
    const token = signToken('user-123')
    const res = await request(app).get('/secret').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ userId: 'user-123' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && npm test`
Expected: FAIL — cannot resolve `../src/auth`.

- [ ] **Step 3: Write implementation**

`server/src/auth.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd server && npm test`
Expected: PASS (health + 4 new tests). `npm run typecheck` clean.

- [ ] **Step 5: Commit**

```bash
git add server/src/auth.ts server/test/auth-helpers.test.ts
git commit -m "feat: add password hashing, jwt signing, and requireAuth middleware"
```

---

### Task 6: POST /auth/signup and /auth/login

**Files:**
- Create: `server/src/user-json.ts`
- Create: `server/src/routes/auth.ts`
- Create: `server/test/helpers.ts`
- Modify: `server/src/app.ts` (mount router)
- Test: `server/test/auth-routes.test.ts`

**Interfaces:**
- Consumes: `hashPassword`, `verifyPassword`, `signToken` from `../auth`; `prisma` from `../db`.
- Produces: `toUserJson(user)` from `server/src/user-json.ts` (User row → FE `User` shape, NO id/passwordHash); `authRouter`. Test helper `signupUser(email?)` returning `{ token, email }` used by later route tests. Response shape `{ token: string, user: UserJson }`.

- [ ] **Step 1: Write test helpers**

`server/test/helpers.ts`:

```ts
import request from 'supertest'
import { app } from '../src/app'
import { prisma } from '../src/db'

export async function resetDb() {
  await prisma.mealItem.deleteMany()
  await prisma.mealMeta.deleteMany()
  await prisma.user.deleteMany()
}

let counter = 0

export async function signupUser(email?: string) {
  const addr = email ?? `user-${Date.now()}-${counter++}@test.dev`
  const res = await request(app)
    .post('/auth/signup')
    .send({ name: 'Test User', email: addr, password: 'password123' })
  if (res.status !== 201) throw new Error(`signup failed: ${res.status} ${JSON.stringify(res.body)}`)
  return { token: res.body.token as string, email: addr }
}
```

- [ ] **Step 2: Write the failing tests**

`server/test/auth-routes.test.ts`:

```ts
import { beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { resetDb } from './helpers'

beforeAll(resetDb)

describe('POST /auth/signup', () => {
  it('creates an account and returns token + FE-shaped user', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({ name: 'Asha', email: 'Asha@Example.com', password: 'password123' })
    expect(res.status).toBe(201)
    expect(typeof res.body.token).toBe('string')
    expect(res.body.user).toEqual({
      name: 'Asha',
      email: 'asha@example.com',
      avatarId: 'avatar-avocado',
      setupComplete: false,
      goals: [],
    })
    expect(res.body.user.id).toBeUndefined()
  })

  it('rejects a duplicate email with 409', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({ name: 'Asha 2', email: 'asha@example.com', password: 'password123' })
    expect(res.status).toBe(409)
  })

  it('rejects a short password with 400', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({ name: 'B', email: 'b@example.com', password: 'short' })
    expect(res.status).toBe(400)
  })
})

describe('POST /auth/login', () => {
  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'asha@example.com', password: 'password123' })
    expect(res.status).toBe(200)
    expect(typeof res.body.token).toBe('string')
    expect(res.body.user.name).toBe('Asha')
  })

  it('rejects a wrong password with 401', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'asha@example.com', password: 'wrong-password' })
    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: 'Incorrect email or password' })
  })

  it('rejects an unknown email with the same 401', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' })
    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: 'Incorrect email or password' })
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd server && npm test`
Expected: FAIL — 404s (router not mounted / files missing).

- [ ] **Step 4: Write implementation**

`server/src/user-json.ts`:

```ts
import type { User } from '@prisma/client'

/** FE User shape from src/types.ts — never leaks id or passwordHash. */
export function toUserJson(u: User) {
  return {
    name: u.name,
    email: u.email,
    avatarId: u.avatarId,
    setupComplete: u.setupComplete,
    goals: u.goals,
    ...(u.foodPreference ? { foodPreference: u.foodPreference } : {}),
    ...(u.mealReminders !== null ? { mealReminders: u.mealReminders } : {}),
    ...(u.hydrationReminders !== null ? { hydrationReminders: u.hydrationReminders } : {}),
    ...(u.motivationalReminders !== null ? { motivationalReminders: u.motivationalReminders } : {}),
  }
}
```

`server/src/routes/auth.ts`:

```ts
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
```

In `server/src/app.ts`, after the `/health` route add:

```ts
import { authRouter } from './routes/auth'
// ...
app.use('/auth', authRouter)
```

(keep the error handler `app.use(onError)` LAST).

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd server && npm test`
Expected: PASS (all files). `npm run typecheck` clean.

- [ ] **Step 6: Commit**

```bash
git add server/src server/test
git commit -m "feat: add email/password signup and login endpoints"
```

---

### Task 7: GET/PATCH /me + auth docs

**Files:**
- Create: `server/src/routes/me.ts`
- Modify: `server/src/app.ts` (mount)
- Modify: `.claude/docs/api-contract.md` (Auth + Me sections)
- Create: `server/CLAUDE.md`
- Test: `server/test/me.test.ts`

**Interfaces:**
- Consumes: `requireAuth`, `prisma`, `toUserJson`, test helper `signupUser`.
- Produces: `meRouter`. PATCH accepts FE `Partial<User>` (minus email — email is immutable in v1).

- [ ] **Step 1: Write the failing tests**

`server/test/me.test.ts`:

```ts
import { beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { resetDb, signupUser } from './helpers'

beforeAll(resetDb)

describe('/me', () => {
  it('401s without a token', async () => {
    expect((await request(app).get('/me')).status).toBe(401)
    expect((await request(app).patch('/me').send({ name: 'X' })).status).toBe(401)
  })

  it('returns the current user', async () => {
    const { token, email } = await signupUser()
    const res = await request(app).get('/me').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.email).toBe(email)
    expect(res.body.setupComplete).toBe(false)
  })

  it('patches setup fields and persists them', async () => {
    const { token } = await signupUser()
    const patch = {
      setupComplete: true,
      avatarId: 'avatar-tomato',
      goals: ['track-meals', 'eat-healthier'],
      foodPreference: 'vegetarian',
      mealReminders: { breakfast: { enabled: true, time: '08:00' } },
      motivationalReminders: { enabled: true, time: '09:00' },
    }
    const res = await request(app).patch('/me').set('Authorization', `Bearer ${token}`).send(patch)
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject(patch)

    const again = await request(app).get('/me').set('Authorization', `Bearer ${token}`)
    expect(again.body).toMatchObject(patch)
  })

  it('rejects unknown fields with 400', async () => {
    const { token } = await signupUser()
    const res = await request(app)
      .patch('/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'evil@example.com' })
    expect(res.status).toBe(400)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && npm test`
Expected: FAIL — `/me` 404.

- [ ] **Step 3: Write implementation**

`server/src/routes/me.ts`:

```ts
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
```

Mount in `server/src/app.ts`: `app.use('/me', meRouter)`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd server && npm test`
Expected: PASS. Typecheck clean.

- [ ] **Step 5: Update docs**

Append to `.claude/docs/api-contract.md`:

```markdown
## Auth

- `POST /auth/signup` — body `{ name, email, password (min 8) }` →
  `201 { token, user }`. `409` duplicate email. Email is lowercased.
- `POST /auth/login` — body `{ email, password }` → `200 { token, user }`.
  `401 { error: "Incorrect email or password" }` for both unknown email and
  wrong password (no account enumeration).
- JWT: HS256, `sub` = user id, 30-day expiry. FE stores it in localStorage
  key `nutri.token.v1`.

## Me

- `GET /me` → FE `User` shape (`src/types.ts` — no id, no passwordHash).
- `PATCH /me` — body: strict partial of User minus `email` (immutable in v1)
  → updated user. Unknown fields → 400.
```

Write `server/CLAUDE.md`:

```markdown
# BiteBuddy server

Express 5 + Prisma + Postgres. ESM, strict TS, no build step (tsx runtime;
`npm run typecheck` for types).

- Routes in `src/routes/*`, mounted in `src/app.ts`; error handler stays last.
- Contract lives in `/.claude/docs/api-contract.md` — update it when routes change.
- Every route: zod-validate input, respond `{ error }` JSON on failure.
- Auth: `requireAuth` middleware sets `req.userId`. Data queries MUST filter
  by `req.userId` — there is no other tenancy boundary.
- Prisma: `npx prisma migrate dev` after schema edits; seed with
  `npx prisma db seed` (imports FE food catalog — don't duplicate data here).
- Tests: `npm test` (uses bitebuddy_test DB, needs docker compose up).
```

- [ ] **Step 6: Commit**

```bash
git add server .claude/docs/api-contract.md
git commit -m "feat: add GET/PATCH /me and auth docs"
```

---

## Phase 3 — Data API

### Task 8: GET /foods

**Files:**
- Create: `server/src/routes/foods.ts`
- Modify: `server/src/app.ts` (mount)
- Test: `server/test/foods.test.ts`

**Interfaces:**
- Produces: `GET /foods` → array of Food rows `{ id, name, emoji, tint, iconId, usualMeal, calories, carbs, protein, fats, fiber, portionUnit }`. Consumed by FE Task 14 (`ApiFood`).

- [ ] **Step 1: Write the failing test**

`server/test/foods.test.ts`:

```ts
import { beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { prisma } from '../src/db'
import { resetDb, signupUser } from './helpers'

beforeAll(async () => {
  await resetDb()
  await prisma.food.upsert({
    where: { id: 'dosa' },
    create: {
      id: 'dosa', name: 'Dosa', emoji: '🌯', tint: '#fdeccd', iconId: 'icon-sandwich',
      usualMeal: 'breakfast', calories: 180, carbs: 28, protein: 4, fats: 6, fiber: 2,
      portionUnit: 'piece',
    },
    update: {},
  })
})

describe('GET /foods', () => {
  it('401s without a token', async () => {
    expect((await request(app).get('/foods')).status).toBe(401)
  })

  it('returns the catalog with nutrition fields', async () => {
    const { token } = await signupUser()
    const res = await request(app).get('/foods').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    const dosa = res.body.find((f: { id: string }) => f.id === 'dosa')
    expect(dosa).toMatchObject({ name: 'Dosa', iconId: 'icon-sandwich', calories: 180, portionUnit: 'piece' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && npm test`
Expected: FAIL — 404.

- [ ] **Step 3: Write implementation**

`server/src/routes/foods.ts`:

```ts
import { Router } from 'express'
import { prisma } from '../db'
import { requireAuth } from '../auth'

export const foodsRouter = Router()

foodsRouter.get('/', requireAuth, async (_req, res) => {
  res.json(await prisma.food.findMany({ orderBy: { name: 'asc' } }))
})
```

Mount: `app.use('/foods', foodsRouter)`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd server && npm test` — PASS.

- [ ] **Step 5: Commit**

```bash
git add server/src/routes/foods.ts server/src/app.ts server/test/foods.test.ts
git commit -m "feat: add GET /foods catalog endpoint"
```

---

### Task 9: POST /meals + GET /plans

**Files:**
- Create: `server/src/routes/meals.ts` (create endpoint; extended in Tasks 10–11)
- Create: `server/src/routes/plans.ts`
- Modify: `server/src/app.ts` (mount both)
- Test: `server/test/meals.test.ts`

**Interfaces:**
- Consumes: `requireAuth`, `prisma`, `signupUser`.
- Produces: `POST /meals` body `{ id, date (yyyy-mm-dd), meal, mode, foodId, customName?, iconId, quantity?, note? }` → `201 { ok: true }`, `409` on duplicate `(userId,itemId,mode)`. `GET /plans` → `PlanByDate` exactly as FE `src/types.ts` (items in insertion order; empty object for a fresh account). Shared zod pieces `mealTypeEnum`, `modeEnum`, `dateStr` exported from `meals.ts` for Task 11.

- [ ] **Step 1: Write the failing tests**

`server/test/meals.test.ts`:

```ts
import { beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { resetDb, signupUser } from './helpers'

beforeAll(resetDb)

const auth = (token: string) => ({ Authorization: `Bearer ${token}` })

describe('POST /meals + GET /plans', () => {
  it('401s without a token', async () => {
    expect((await request(app).post('/meals').send({})).status).toBe(401)
    expect((await request(app).get('/plans')).status).toBe(401)
  })

  it('fresh account has empty plans', async () => {
    const { token } = await signupUser()
    const res = await request(app).get('/plans').set(auth(token))
    expect(res.status).toBe(200)
    expect(res.body).toEqual({})
  })

  it('creates planned and logged items and returns them grouped', async () => {
    const { token } = await signupUser()
    const item = (id: string, mode: string, extra = {}) => ({
      id, date: '2026-07-10', meal: 'breakfast', mode, foodId: 'dosa',
      iconId: 'icon-sandwich', ...extra,
    })
    expect((await request(app).post('/meals').set(auth(token)).send(item('m-1', 'planned', { quantity: '2 pieces' }))).status).toBe(201)
    expect((await request(app).post('/meals').set(auth(token)).send(item('m-2', 'logged', { note: 'crispy' }))).status).toBe(201)
    expect(
      (await request(app).post('/meals').set(auth(token)).send({
        id: 'm-3', date: '2026-07-10', meal: 'lunch', mode: 'planned',
        foodId: 'custom', customName: 'Ragi Mudde', iconId: 'icon-oatmeal-bowl',
      })).status,
    ).toBe(201)

    const res = await request(app).get('/plans').set(auth(token))
    expect(res.body).toEqual({
      '2026-07-10': {
        breakfast: {
          planned: [{ id: 'm-1', foodId: 'dosa', iconId: 'icon-sandwich', quantity: '2 pieces' }],
          logged: [{ id: 'm-2', foodId: 'dosa', iconId: 'icon-sandwich', note: 'crispy' }],
        },
        lunch: {
          planned: [{ id: 'm-3', foodId: 'custom', iconId: 'icon-oatmeal-bowl', customName: 'Ragi Mudde' }],
          logged: [],
        },
      },
    })
  })

  it('409s on duplicate (itemId, mode)', async () => {
    const { token } = await signupUser()
    const body = { id: 'dup-1', date: '2026-07-10', meal: 'dinner', mode: 'planned', foodId: 'rice', iconId: 'icon-avocado-bowl' }
    expect((await request(app).post('/meals').set(auth(token)).send(body)).status).toBe(201)
    expect((await request(app).post('/meals').set(auth(token)).send(body)).status).toBe(409)
  })

  it('400s on bad date or meal', async () => {
    const { token } = await signupUser()
    const bad = { id: 'x', date: '10-07-2026', meal: 'brunch', mode: 'planned', foodId: 'rice', iconId: 'icon-avocado-bowl' }
    expect((await request(app).post('/meals').set(auth(token)).send(bad)).status).toBe(400)
  })

  it('does not leak items across users', async () => {
    const a = await signupUser()
    const b = await signupUser()
    await request(app).post('/meals').set(auth(a.token)).send({
      id: 'mine', date: '2026-07-11', meal: 'snack', mode: 'planned', foodId: 'chai', iconId: 'icon-milk',
    })
    const res = await request(app).get('/plans').set(auth(b.token))
    expect(res.body).toEqual({})
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && npm test` — FAIL (404s).

- [ ] **Step 3: Write implementation**

`server/src/routes/meals.ts`:

```ts
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
```

`server/src/routes/plans.ts`:

```ts
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
```

Mount in `app.ts`: `app.use('/meals', mealsRouter)` and `app.use('/plans', plansRouter)`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd server && npm test` — PASS. Typecheck clean.

- [ ] **Step 5: Commit**

```bash
git add server/src server/test/meals.test.ts
git commit -m "feat: add POST /meals and GET /plans"
```

---

### Task 10: POST /meals/:id/log + DELETE /meals/:id

**Files:**
- Modify: `server/src/routes/meals.ts`
- Test: `server/test/meal-log.test.ts`

**Interfaces:**
- Consumes: existing `mealsRouter`.
- Produces: `POST /meals/:id/log` → stamps `loggedAt` on the planned row and inserts a logged copy with the SAME `itemId` (no `loggedAt` on the copy); idempotent if already logged; 404 if no planned row. `DELETE /meals/:id?mode=planned|logged` → 204; deleting a logged item ALSO clears `loggedAt` on the planned row with the same `itemId` (revert-to-pending, mirrors `LocalDataService.removeItem`).

- [ ] **Step 1: Write the failing tests**

`server/test/meal-log.test.ts`:

```ts
import { beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { resetDb, signupUser } from './helpers'

beforeAll(resetDb)

const auth = (token: string) => ({ Authorization: `Bearer ${token}` })

async function plant(token: string, id: string) {
  const res = await request(app).post('/meals').set(auth(token)).send({
    id, date: '2026-07-10', meal: 'lunch', mode: 'planned', foodId: 'dal', iconId: 'icon-soup', quantity: '1 bowl',
  })
  expect(res.status).toBe(201)
}

describe('POST /meals/:id/log', () => {
  it('marks planned as logged and adds a logged copy with the same id', async () => {
    const { token } = await signupUser()
    await plant(token, 'p-1')
    expect((await request(app).post('/meals/p-1/log').set(auth(token))).status).toBe(200)

    const plans = (await request(app).get('/plans').set(auth(token))).body
    const slot = plans['2026-07-10'].lunch
    expect(slot.planned).toHaveLength(1)
    expect(typeof slot.planned[0].loggedAt).toBe('string')
    expect(slot.logged).toEqual([
      { id: 'p-1', foodId: 'dal', iconId: 'icon-soup', quantity: '1 bowl' },
    ])
  })

  it('is a no-op when already logged', async () => {
    const { token } = await signupUser()
    await plant(token, 'p-2')
    await request(app).post('/meals/p-2/log').set(auth(token))
    expect((await request(app).post('/meals/p-2/log').set(auth(token))).status).toBe(200)
    const slot = (await request(app).get('/plans').set(auth(token))).body['2026-07-10'].lunch
    expect(slot.logged).toHaveLength(1)
  })

  it('404s for a missing planned item', async () => {
    const { token } = await signupUser()
    expect((await request(app).post('/meals/nope/log').set(auth(token))).status).toBe(404)
  })
})

describe('DELETE /meals/:id', () => {
  it('deletes a planned item', async () => {
    const { token } = await signupUser()
    await plant(token, 'd-1')
    expect((await request(app).delete('/meals/d-1?mode=planned').set(auth(token))).status).toBe(204)
    expect((await request(app).get('/plans').set(auth(token))).body).toEqual({
      '2026-07-10': { lunch: { planned: [], logged: [] } },
    })
  })

  it('deleting a logged item reverts the planned original to pending', async () => {
    const { token } = await signupUser()
    await plant(token, 'd-2')
    await request(app).post('/meals/d-2/log').set(auth(token))
    expect((await request(app).delete('/meals/d-2?mode=logged').set(auth(token))).status).toBe(204)
    const slot = (await request(app).get('/plans').set(auth(token))).body['2026-07-10'].lunch
    expect(slot.logged).toEqual([])
    expect(slot.planned).toHaveLength(1)
    expect(slot.planned[0].loggedAt).toBeUndefined()
  })

  it('400s without mode and 404s for a missing item', async () => {
    const { token } = await signupUser()
    expect((await request(app).delete('/meals/x').set(auth(token))).status).toBe(400)
    expect((await request(app).delete('/meals/x?mode=planned').set(auth(token))).status).toBe(404)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && npm test` — FAIL (404s on new routes).

- [ ] **Step 3: Add routes to server/src/routes/meals.ts**

```ts
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
    // Removing from logging reverts the planned item to pending (FE parity).
    await prisma.mealItem.updateMany({
      where: { userId: req.userId, itemId: req.params.id, mode: 'planned' },
      data: { loggedAt: null },
    })
  }
  res.status(204).end()
})
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd server && npm test` — PASS.

- [ ] **Step 5: Commit**

```bash
git add server/src/routes/meals.ts server/test/meal-log.test.ts
git commit -m "feat: add meal log and delete endpoints with planned-revert semantics"
```

---

### Task 11: PUT meal meta + complete API contract doc

**Files:**
- Modify: `server/src/routes/meals.ts`
- Modify: `.claude/docs/api-contract.md` (Data section — finish the file)
- Test: `server/test/meal-meta.test.ts`

**Interfaces:**
- Produces: `PUT /meals/:date/:meal/meta` body `{ mood?: 1|2|3, mealNote?: string }` → upserts `MealMeta`, merge semantics (omitted field keeps old value). Meta appears in `GET /plans` slots.

- [ ] **Step 1: Write the failing tests**

`server/test/meal-meta.test.ts`:

```ts
import { beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { resetDb, signupUser } from './helpers'

beforeAll(resetDb)

const auth = (token: string) => ({ Authorization: `Bearer ${token}` })

describe('PUT /meals/:date/:meal/meta', () => {
  it('upserts mood and note, merging patches', async () => {
    const { token } = await signupUser()
    expect(
      (await request(app).put('/meals/2026-07-10/dinner/meta').set(auth(token)).send({ mood: 3 })).status,
    ).toBe(200)
    expect(
      (await request(app).put('/meals/2026-07-10/dinner/meta').set(auth(token)).send({ mealNote: 'light and tasty' })).status,
    ).toBe(200)

    const slot = (await request(app).get('/plans').set(auth(token))).body['2026-07-10'].dinner
    expect(slot.mood).toBe(3)
    expect(slot.mealNote).toBe('light and tasty')
  })

  it('400s on a bad mood or meal type', async () => {
    const { token } = await signupUser()
    expect((await request(app).put('/meals/2026-07-10/dinner/meta').set(auth(token)).send({ mood: 5 })).status).toBe(400)
    expect((await request(app).put('/meals/2026-07-10/brunch/meta').set(auth(token)).send({ mood: 2 })).status).toBe(400)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && npm test` — FAIL (404).

- [ ] **Step 3: Add route to server/src/routes/meals.ts**

```ts
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
```

NOTE: this route must be registered BEFORE any conflict — Express matches `/:date/:meal/meta` and `/:id/log` by segment count, so no clash with `DELETE /:id`. Keep registration order: `post /`, `post /:id/log`, `delete /:id`, `put /:date/:meal/meta`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd server && npm test` — PASS. Typecheck clean.

- [ ] **Step 5: Finish .claude/docs/api-contract.md — append**

```markdown
## Data

All require Bearer token; all rows are scoped to the token's user.

- `GET /foods` → `Food[]`:
  `{ id, name, emoji, tint, iconId, usualMeal, calories, carbs, protein, fats, fiber, portionUnit }`.
  FE hydrates its in-memory catalog + nutrition map from this.
- `GET /plans` → `PlanByDate` (see `src/types.ts`): `{ [yyyy-mm-dd]: { [meal]:
  { planned: MealItem[], logged: MealItem[], mood?, mealNote? } } }`. Fresh
  account → `{}`.
- `POST /meals` — body `{ id, date, meal, mode, foodId, customName?, iconId,
  quantity?, note? }` → `201`. Client GENERATES the id. `409` on duplicate
  `(itemId, mode)`. Custom foods: `foodId: "custom"` + `customName`.
- `POST /meals/:id/log` → stamps `loggedAt` on the planned row AND inserts a
  logged copy with the SAME id (copy has no `loggedAt`). Idempotent. `404` if
  no planned row.
- `DELETE /meals/:id?mode=planned|logged` → `204`. Deleting a logged item also
  clears `loggedAt` on the planned row with the same id (revert-to-pending).
- `PUT /meals/:date/:meal/meta` — body `{ mood? (1|2|3), mealNote? }` →
  upsert with merge semantics.

## Invariants

- Logged copy shares its `id` with its planned original — the FE relies on
  this for revert-on-remove. Do not "fix" it into separate ids.
- Never return the DB user id or `passwordHash`; the FE `User` has no id.
```

- [ ] **Step 6: Commit**

```bash
git add server .claude/docs/api-contract.md
git commit -m "feat: add meal meta endpoint and complete api contract doc"
```

---

## Phase 4 — FE Integration

### Task 12: Extract pure plan ops + FE vitest

**Files:**
- Create: `src/lib/planOps.ts`
- Modify: `src/services/data/LocalDataService.ts` (use the ops; behavior unchanged)
- Modify: `package.json` (add vitest + test script)
- Test: `src/lib/planOps.test.ts`

**Interfaces:**
- Consumes: types from `src/types.ts`, `EMPTY_MEAL_SLOT` from `src/lib/mealPlans.ts`, `getFood` from `src/data/foods.ts`.
- Produces (used by LocalDataService now and ApiDataService in Task 14):
  - `slotFor(plans, date, meal): MealSlot`
  - `withSlot(plans, date, meal, slot): PlanByDate`
  - `makeItem(foodId, iconId?, customName?, opts?): MealItem` (id format `m-<ts>-<rand>`)
  - `addItemOp(plans, date, meal, mode, item): PlanByDate`
  - `removeItemOp(plans, date, meal, itemId, mode): PlanByDate`
  - `logPlannedOp(plans, date, meal, itemId, loggedAt): PlanByDate | null` (null = no-op)
  - `updateMetaOp(plans, date, meal, patch): PlanByDate`

- [ ] **Step 1: Add vitest to the root package**

Run: `npm install -D vitest`
Add to root `package.json` scripts: `"test": "vitest run"`.

- [ ] **Step 2: Write the failing tests**

`src/lib/planOps.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import type { MealItem, PlanByDate } from '../types'
import { addItemOp, logPlannedOp, makeItem, removeItemOp, updateMetaOp } from './planOps'

const item = (id: string): MealItem => ({ id, foodId: 'dal', iconId: 'icon-soup' })

describe('planOps', () => {
  it('addItemOp appends to the right mode without mutating input', () => {
    const before: PlanByDate = {}
    const after = addItemOp(before, '2026-07-10', 'lunch', 'planned', item('a'))
    expect(before).toEqual({})
    expect(after['2026-07-10'].lunch).toEqual({ planned: [item('a')], logged: [] })
  })

  it('logPlannedOp stamps loggedAt on planned and appends a copy without loggedAt', () => {
    let plans = addItemOp({}, 'd', 'lunch', 'planned', item('a'))
    plans = logPlannedOp(plans, 'd', 'lunch', 'a', '2026-07-10T12:00:00.000Z')!
    const slot = plans.d.lunch!
    expect(slot.planned[0].loggedAt).toBe('2026-07-10T12:00:00.000Z')
    expect(slot.logged).toEqual([item('a')])
  })

  it('logPlannedOp returns null for missing or already-logged items', () => {
    let plans = addItemOp({}, 'd', 'lunch', 'planned', item('a'))
    expect(logPlannedOp(plans, 'd', 'lunch', 'nope', 'now')).toBeNull()
    plans = logPlannedOp(plans, 'd', 'lunch', 'a', 'now')!
    expect(logPlannedOp(plans, 'd', 'lunch', 'a', 'again')).toBeNull()
  })

  it('removeItemOp(logged) removes the copy and reverts planned loggedAt', () => {
    let plans = addItemOp({}, 'd', 'lunch', 'planned', item('a'))
    plans = logPlannedOp(plans, 'd', 'lunch', 'a', 'now')!
    plans = removeItemOp(plans, 'd', 'lunch', 'a', 'logged')
    const slot = plans.d.lunch!
    expect(slot.logged).toEqual([])
    expect(slot.planned[0].loggedAt).toBeUndefined()
  })

  it('removeItemOp(planned) only removes the planned item', () => {
    let plans = addItemOp({}, 'd', 'lunch', 'planned', item('a'))
    plans = addItemOp(plans, 'd', 'lunch', 'logged', item('b'))
    plans = removeItemOp(plans, 'd', 'lunch', 'a', 'planned')
    expect(plans.d.lunch).toEqual({ planned: [], logged: [item('b')] })
  })

  it('updateMetaOp merges mood and note onto the slot', () => {
    let plans = updateMetaOp({}, 'd', 'dinner', { mood: 3 })
    plans = updateMetaOp(plans, 'd', 'dinner', { mealNote: 'nice' })
    expect(plans.d.dinner).toMatchObject({ mood: 3, mealNote: 'nice' })
  })

  it('makeItem generates an id and defaults the icon from the catalog', () => {
    const it1 = makeItem('dal')
    expect(it1.id).toMatch(/^m-/)
    expect(it1.iconId).toBe('icon-soup')
    const it2 = makeItem('custom', 'icon-pizza', 'My Snack', { quantity: '1 cup' })
    expect(it2).toMatchObject({ foodId: 'custom', iconId: 'icon-pizza', customName: 'My Snack', quantity: '1 cup' })
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `./planOps` not found.

- [ ] **Step 4: Write src/lib/planOps.ts**

Logic is MOVED verbatim from `LocalDataService` (`slotFor`, `newItem`, and the bodies of `addFood`/`removeItem`/`logPlannedItem`/`updateMealMeta`) into pure functions:

```ts
import type { FoodIconId, MealItem, MealMode, MealMood, MealSlot, MealType, PlanByDate } from '../types'
import { getFood } from '../data/foods'
import { EMPTY_MEAL_SLOT } from './mealPlans'

export function slotFor(plans: PlanByDate, date: string, meal: MealType): MealSlot {
  return plans[date]?.[meal] ?? EMPTY_MEAL_SLOT
}

export function withSlot(plans: PlanByDate, date: string, meal: MealType, slot: MealSlot): PlanByDate {
  return { ...plans, [date]: { ...plans[date], [meal]: slot } }
}

export function makeItem(
  foodId: string,
  iconId?: FoodIconId,
  customName?: string,
  opts?: { quantity?: string; note?: string },
): MealItem {
  return {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    foodId,
    iconId: iconId ?? getFood(foodId).iconId,
    ...(customName ? { customName } : {}),
    ...(opts?.quantity ? { quantity: opts.quantity } : {}),
    ...(opts?.note ? { note: opts.note } : {}),
  }
}

export function addItemOp(
  plans: PlanByDate,
  date: string,
  meal: MealType,
  mode: MealMode,
  item: MealItem,
): PlanByDate {
  const slot = slotFor(plans, date, meal)
  const key = mode === 'planned' ? 'planned' : 'logged'
  return withSlot(plans, date, meal, { ...slot, [key]: [...slot[key], item] })
}

export function removeItemOp(
  plans: PlanByDate,
  date: string,
  meal: MealType,
  itemId: string,
  mode: MealMode,
): PlanByDate {
  const slot = slotFor(plans, date, meal)
  if (mode === 'planned') {
    return withSlot(plans, date, meal, { ...slot, planned: slot.planned.filter((i) => i.id !== itemId) })
  }
  // Removing from logging also reverts the planned item to pending.
  return withSlot(plans, date, meal, {
    ...slot,
    planned: slot.planned.map((i) => (i.id === itemId ? { ...i, loggedAt: undefined } : i)),
    logged: slot.logged.filter((i) => i.id !== itemId),
  })
}

/** Returns null when the item is missing or already logged (no-op). */
export function logPlannedOp(
  plans: PlanByDate,
  date: string,
  meal: MealType,
  itemId: string,
  loggedAt: string,
): PlanByDate | null {
  const slot = slotFor(plans, date, meal)
  const item = slot.planned.find((i) => i.id === itemId)
  if (!item || item.loggedAt) return null
  const { loggedAt: _drop, ...loggedCopy } = item
  return withSlot(plans, date, meal, {
    ...slot,
    planned: slot.planned.map((i) => (i.id === itemId ? { ...i, loggedAt } : i)),
    logged: [...slot.logged, loggedCopy],
  })
}

export function updateMetaOp(
  plans: PlanByDate,
  date: string,
  meal: MealType,
  patch: { mood?: MealMood; mealNote?: string },
): PlanByDate {
  return withSlot(plans, date, meal, { ...slotFor(plans, date, meal), ...patch })
}
```

- [ ] **Step 5: Refactor LocalDataService to use the ops**

In `src/services/data/LocalDataService.ts`: delete local `slotFor`, `newItem`, and `patchSlot`'s callers' inline logic; import from `../../lib/planOps`; each mutator becomes:

```ts
import { addItemOp, logPlannedOp, makeItem, removeItemOp, updateMetaOp } from '../../lib/planOps'
// ...
  private setPlans(next: PlanByDate) {
    this.plans = next
    this.emit()
  }

  addFood(date, meal, foodId, mode, iconId?, opts?) {
    this.setPlans(addItemOp(this.plans, date, meal, mode, makeItem(foodId, iconId, undefined, opts)))
  }

  addCustomFood(date, meal, name, iconId, mode, opts?) {
    this.setPlans(addItemOp(this.plans, date, meal, mode, makeItem('custom', iconId, name.trim(), opts)))
  }

  removeItem(date, meal, itemId, mode) {
    this.setPlans(removeItemOp(this.plans, date, meal, itemId, mode))
  }

  logPlannedItem(date, meal, itemId) {
    const next = logPlannedOp(this.plans, date, meal, itemId, new Date().toISOString())
    if (next) this.setPlans(next)
  }

  updateMealMeta(date, meal, patch) {
    this.setPlans(updateMetaOp(this.plans, date, meal, patch))
  }
```

(keep full TypeScript signatures identical to the current file; `emit()` still saves to localStorage first — keep that behavior inside `emit`).

- [ ] **Step 6: Run tests + build to verify**

Run: `npm test` — PASS (7 tests).
Run: `npm run build` — clean.

- [ ] **Step 7: Commit**

```bash
git add src/lib/planOps.ts src/lib/planOps.test.ts src/services/data/LocalDataService.ts package.json package-lock.json
git commit -m "refactor: extract pure plan ops shared by local and api data services"
```

---

### Task 13: DataService v2 — real auth interface, init gate, Login/Signup screens

**Files:**
- Modify: `src/services/data/DataService.ts`
- Modify: `src/services/data/LocalDataService.ts`
- Modify: `src/screens/Login.tsx`, `src/screens/Signup.tsx`
- Modify: `src/main.tsx`

**Interfaces:**
- Produces (final `DataService` — ApiDataService in Task 14 implements the same):

```ts
export interface DataService {
  /** Resolves when any persisted session/data is loaded. Render app after. */
  init(): Promise<void>
  getUser(): User | null
  signIn(email: string, password: string): Promise<User>
  signUp(name: string, email: string, password: string): Promise<User>
  updateUser(patch: Partial<User>): void
  signOut(): void
  getPlans(): PlanByDate
  addFood(date: string, meal: MealType, foodId: string, mode: MealMode, iconId?: FoodIconId, opts?: { quantity?: string; note?: string }): void
  addCustomFood(date: string, meal: MealType, name: string, iconId: FoodIconId, mode: MealMode, opts?: { quantity?: string; note?: string }): void
  removeItem(date: string, meal: MealType, itemId: string, mode: MealMode): void
  logPlannedItem(date: string, meal: MealType, itemId: string): void
  updateMealMeta(date: string, meal: MealType, patch: { mood?: MealMood; mealNote?: string }): void
  subscribe(listener: () => void): () => void
}
```

- [ ] **Step 1: Update DataService.ts to the interface above**

(replace `signIn(user: User): void` with the three new methods; keep the doc comment about swapping implementations.)

- [ ] **Step 2: Update LocalDataService**

Replace the old `signIn(user: User)` with:

```ts
  async init() {}

  async signIn(email: string, _password: string) {
    // Demo mode: any credentials work; restores the stored profile if the
    // email matches, else signs in the demo user.
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
```

(`establishSession` is the old `signIn` body renamed; demo `name` beats stored name only on signup, matching old behavior closely enough for demo mode.)

- [ ] **Step 3: Update Login.tsx**

Replace the mock handler + remove the Google section entirely (delete the `GoogleG` import, the divider, and the `SecondaryButton`; `SecondaryButton` import too if now unused):

```tsx
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Enter your email and password')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const user = await dataService.signIn(email.trim(), password)
      navigate(user.setupComplete ? '/' : '/setup', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not log in')
    } finally {
      setBusy(false)
    }
  }
```

Below the `PasswordField` (before the forgot-password button) render the inline error:

```tsx
        {error && (
          <p role="alert" className="text-center text-sm font-bold text-red-600">
            {error}
          </p>
        )}
```

Set `disabled={busy}` on the `PrimaryButton`. Keep the forgot-password stub toast. Remove the now-unused `showToast`/`DEFAULT_AVATAR` imports if nothing else uses them.

- [ ] **Step 4: Update Signup.tsx**

Same pattern: remove Google section, add `error`/`busy` state, inline error element, and:

```tsx
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password) {
      setError('Fill in all the fields to sign up')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await dataService.signUp(name.trim(), email.trim(), password)
      navigate('/setup', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign up')
    } finally {
      setBusy(false)
    }
  }
```

- [ ] **Step 5: Gate render on init in src/main.tsx**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { dataService } from './services/data'

const root = createRoot(document.getElementById('root')!)
dataService.init().finally(() => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
```

- [ ] **Step 6: Verify demo mode still works**

Run: `npm run build` — clean.
Run: `npm run dev`, open the app: signup with any values lands on `/setup`; complete setup; add a food; logout; login with the same email restores the profile. (Manual or via Playwright browser tools.)

- [ ] **Step 7: Commit**

```bash
git add src/services/data/DataService.ts src/services/data/LocalDataService.ts src/screens/Login.tsx src/screens/Signup.tsx src/main.tsx
git commit -m "feat: real auth data-service interface, init gate, email/password-only screens"
```

---

### Task 14: API client, catalog hydration, ApiDataService, singleton swap

**Files:**
- Create: `src/services/api/client.ts`
- Create: `src/services/data/ApiDataService.ts`
- Modify: `src/data/foods.ts` (add `setCatalog`)
- Modify: `src/data/nutrition.ts` (add `applyCatalogNutrition`)
- Modify: `src/services/data/index.ts` (swap on `VITE_API_URL`)
- Create: `.env.local` (NOT committed — Vite ignores it via `*.local` in .gitignore)

**Interfaces:**
- Consumes: planOps (Task 12), DataService v2 (Task 13), server endpoints (Tasks 6–11), `showToast`.
- Produces: `api<T>(path, opts)`, `ApiError`, `TOKEN_KEY = 'nutri.token.v1'`, `API_URL`, `setOnUnauthorized(fn)`, `ApiFood`; `setCatalog(rows)`, `applyCatalogNutrition(rows)`; `ApiDataService`.

- [ ] **Step 1: Write src/services/api/client.ts**

```ts
import type { User } from '../../types'

export const API_URL = import.meta.env.VITE_API_URL as string | undefined
export const TOKEN_KEY = 'nutri.token.v1'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

let onUnauthorized: (() => void) | null = null
/** Called on any 401 outside /auth — the service clears the session. */
export function setOnUnauthorized(handler: () => void) {
  onUnauthorized = handler
}

export async function api<T>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY)
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: opts.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    })
  } catch {
    throw new ApiError(0, 'You appear to be offline')
  }
  if (res.status === 401 && !path.startsWith('/auth/')) {
    onUnauthorized?.()
    throw new ApiError(401, 'Session expired — please log in again')
  }
  if (!res.ok) {
    let message = 'Something went wrong'
    try {
      message = ((await res.json()) as { error?: string }).error ?? message
    } catch {
      // non-JSON error body — keep the generic message
    }
    throw new ApiError(res.status, message)
  }
  return (res.status === 204 ? undefined : await res.json()) as T
}

export interface ApiFood {
  id: string
  name: string
  emoji: string
  tint: string
  iconId: string
  usualMeal: string
  calories: number
  carbs: number
  protein: number
  fats: number
  fiber: number
  portionUnit: string
}

export interface AuthResponse {
  token: string
  user: User
}
```

- [ ] **Step 2: Add setCatalog to src/data/foods.ts**

Append (FOODS/byId stay `const`; contents are replaced in place so every existing importer sees the server catalog):

```ts
export interface CatalogFood {
  id: string
  name: string
  emoji: string
  tint: string
  iconId: string
  usualMeal: string
}

/** Replace the hardcoded catalog with server rows (remote mode hydration). */
export function setCatalog(rows: CatalogFood[]) {
  FOODS.length = 0
  for (const r of rows) {
    FOODS.push({
      id: r.id,
      name: r.name,
      emoji: r.emoji,
      tint: r.tint,
      iconId: r.iconId as FoodIconId,
      usualMeal: r.usualMeal as MealType,
    })
  }
  byId.clear()
  for (const f of FOODS) byId.set(f.id, f)
}
```

(add `MealType` to the type import at the top of the file.)

- [ ] **Step 3: Add applyCatalogNutrition to src/data/nutrition.ts**

```ts
/** Overlay per-food nutrition fetched from the API onto the local table. */
export function applyCatalogNutrition(
  rows: { id: string; calories: number; carbs: number; protein: number; fats: number; fiber: number; portionUnit: string }[],
) {
  for (const r of rows) {
    NUTRITION[r.id] = {
      calories: r.calories,
      carbs: r.carbs,
      protein: r.protein,
      fats: r.fats,
      fiber: r.fiber,
      portionUnit: r.portionUnit,
    }
  }
}
```

- [ ] **Step 4: Write src/services/data/ApiDataService.ts**

```ts
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
      if (e instanceof ApiError && e.status === 401) return // handler cleared it
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
```

- [ ] **Step 5: Swap the singleton in src/services/data/index.ts**

```ts
import type { DataService } from './DataService'
import { LocalDataService } from './LocalDataService'
import { ApiDataService } from './ApiDataService'
import { API_URL } from '../api/client'

export type { DataService }

/** API-backed when VITE_API_URL is set; localStorage demo mode otherwise. */
export const dataService: DataService = API_URL ? new ApiDataService() : new LocalDataService()
```

- [ ] **Step 6: Create .env.local**

```
VITE_API_URL=http://localhost:3001
```

- [ ] **Step 7: Verify against the real backend**

Run: `npm run build` and `npm test` — both clean.
Run: `docker compose up -d`, `cd server && npm run dev`, and in another shell `npm run dev`. In the app: sign up a NEW email → lands on `/setup` → home is EMPTY (no seeded week) → add a planned food → toggle to Logging → mark it eaten → refresh the page → everything persists (came from Postgres, not localStorage). Login with a wrong password shows the inline "Incorrect email or password".

- [ ] **Step 8: Commit**

```bash
git add src/services src/data/foods.ts src/data/nutrition.ts
git commit -m "feat: add api client and ApiDataService with optimistic cache"
```

---

### Task 15: Architecture doc + CLAUDE.md pointer check

**Files:**
- Create: `.claude/docs/architecture.md`

- [ ] **Step 1: Write .claude/docs/architecture.md**

```markdown
# Architecture — DataService seam

Screens never fetch. They read via `useSyncExternalStore` hooks
(`src/state/useAppData.ts`) over the `dataService` singleton
(`src/services/data/index.ts`), selected at startup:

- `VITE_API_URL` set → `ApiDataService` (real backend)
- unset → `LocalDataService` (localStorage demo mode, seeded week)

Both implement `DataService` (`src/services/data/DataService.ts`) and share
pure plan mutations from `src/lib/planOps.ts` — fix plan logic THERE, once.

## ApiDataService pattern (online-only)

- `init()` (awaited in `main.tsx` before first render): if a token exists in
  `nutri.token.v1`, hydrate in parallel from `GET /me` + `/plans` + `/foods`.
  Foods hydration overwrites the hardcoded catalog via `setCatalog` +
  `applyCatalogNutrition`, so `getFood()`/nutrition stay synchronous.
- Writes: apply planOps result to the in-memory cache, emit, fire the API
  call. On failure: revert to the previous cache, emit, `showToast`.
- Any 401 outside `/auth/*` clears the session (token + cache) — route guards
  then bounce to `/splash`.

## Invariants (also in api-contract.md)

- Client generates meal-item ids; a logged copy shares its id with its
  planned original; deleting a logged item reverts the planned one.
- FE `User` has no id — never add one.
```

- [ ] **Step 2: Verify root CLAUDE.md pointers still accurate; fix if drifted. Commit**

```bash
git add .claude/docs/architecture.md CLAUDE.md
git commit -m "docs: add architecture doc for the data-service seam"
```

---

## Phase 5 — E2E Verification

### Task 16: Full walkthrough against the real backend

**Files:**
- Modify: whatever the walkthrough breaks (fix root causes; keep diffs minimal)

- [ ] **Step 1: Boot everything**

```bash
docker compose up -d
cd server && npx prisma migrate dev && npx prisma db seed && npm run dev &
npm run dev
```

- [ ] **Step 2: Walk every flow (browser — Playwright tools or manual), in order**

1. Fresh browser profile (clear localStorage). `/splash` → `/welcome` → Sign up with a NEW email + password ≥ 8 chars → lands on `/setup`.
2. Signup with the SAME email again → inline 409 error shown.
3. Complete all 4 setup steps (goal, preference, reminders, avatar) → home. Reload → still setup-complete (PATCH /me persisted).
4. Home is EMPTY for the new account (no demo week).
5. Add flow: `/add` → pick food → quantity + note → success screen. Item appears on Home/Planner.
6. Planner: add a planned item for tomorrow; toggle Planning/Logging; mark the planned item eaten (log). Meal details: set mood + note. Reload → all persisted.
7. Remove the logged item → planned item back to pending (revert semantics).
8. Custom food end to end (name + icon + quantity).
9. Progress screen renders with the logged data.
10. Profile: edit name + avatar → reload → persisted. Reminders/Preferences/Goals screens save.
11. Logout → login with wrong password → inline 401 error. Login correctly → data intact.
12. Kill the server process; try adding a food → optimistic item appears, then reverts with an offline toast. Restart server.
13. Demo mode regression: comment out `VITE_API_URL` in `.env.local`, restart Vite → seeded demo week appears, mock login works. Restore `.env.local`.

- [ ] **Step 3: Fix anything broken** — root cause, smallest diff; add/adjust a server test if the bug was server-side.

- [ ] **Step 4: Final checks**

Run: `npm run build && npm test && cd server && npm test && npm run typecheck`
Expected: all pass.

- [ ] **Step 5: Commit fixes**

```bash
git add -A
git commit -m "fix: e2e walkthrough fallout for backend integration"
```
