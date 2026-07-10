# BiteBuddy BE + FE Integration — Design Spec

Date: 2026-07-10
Status: approved pending user review

## Context

BiteBuddy is currently a frontend-only React 19 + Vite PWA. All 18 screens are
built and route through a single `DataService` interface
(`src/services/data/DataService.ts`) with one implementation,
`LocalDataService`, backed by localStorage. Auth is mock (any credentials
accepted, password never verified). Food catalog and nutrition values are
hardcoded in `src/data/foods.ts` and `src/data/nutrition.ts`. No backend
exists: no server code, no API client, zero network calls.

Goal: build the backend and integrate the frontend with it, phase by phase.

## Decisions (locked)

| Decision | Choice | Date |
|---|---|---|
| Backend stack | Express + Prisma + PostgreSQL (Docker) | 2026-07-10 |
| Auth | Email/password only. No Google OAuth, no magic link, no OTP. | 2026-07-10 |
| Offline behavior | Online-only. API calls need network; failures show toast. No outbox/sync engine. | 2026-07-10 |
| Food catalog | Lives in Postgres, seeded from current `foods.ts` + `nutrition.ts`. FE fetches from API. | 2026-07-10 |
| New accounts | Start with empty plans. Seeded demo week remains dev/local-only behavior. | 2026-07-10 |
| Repo shape | FE stays at root untouched. `server/` is a standalone package (own package.json, no npm-workspace conversion). | 2026-07-10 |
| Shared types | No shared package. Server mirrors the FE contract types in one file; `src/types.ts` remains FE source of truth. | 2026-07-10 |

## Architecture

```
BiteBuddy/
├── src/                  # FE (unchanged layout)
│   └── services/data/    # DataService seam — the only FE integration point
├── server/               # NEW: Express + Prisma API
│   ├── prisma/schema.prisma
│   ├── prisma/seed.ts    # foods from FE catalogs
│   └── src/              # app, routes, middleware, types
├── docker-compose.yml    # NEW: Postgres
└── .claude/docs/         # NEW: on-demand reference docs
```

- Server: Express 5, TypeScript, Prisma, PostgreSQL 16 via Docker Compose.
- Auth: bcrypt password hashing, JWT (HS256) issued on signup/login, sent as
  `Authorization: Bearer`, verified by middleware on all non-auth routes.
  Token stored in localStorage on FE.
- Validation: Zod at every route boundary (trust boundary — not skipped).
- Errors: JSON `{ error: string }` with proper status codes; central Express
  error handler.

## Data model (Prisma)

- **User** — `id`, `email` (unique), `passwordHash`, `name`, `avatarId`,
  `setupComplete`, `goalId`, `foodPreference`, `mealReminders` (string[]),
  `motivationalReminders`, `createdAt`, `updatedAt`.
- **Food** — `id` (string slug matching current FE `foodId` values), `name`,
  `iconId`, `calories`, `protein`, `carbs`, `fat`, `portionLabel`. Seeded
  from `src/data/foods.ts` + `src/data/nutrition.ts`.
- **MealItem** — `id`, `userId` (FK), `date` (ISO date string), `mealType`,
  `mode` (`planned` | `logged`), `foodId?` (FK, null for custom foods),
  `customName?`, `iconId`, `quantity`, `note?`, `loggedAt?`.
- **MealMeta** — unique on (`userId`, `date`, `mealType`); `mood?`,
  `mealNote?`.

`PlanByDate` (the FE shape) is assembled server-side in `GET /plans` from
MealItem + MealMeta rows.

## API contract

```
POST   /auth/signup            {name,email,password} → {token,user}   409 email taken
POST   /auth/login             {email,password}      → {token,user}   401 bad creds
GET    /me                                           → user
PATCH  /me                     partial user           → user          (setup, avatar, goals, reminders)
GET    /foods                                        → Food[]
GET    /plans                                        → PlanByDate
POST   /meals                  {date,meal,mode,foodId|customName,iconId,quantity?,note?} → MealItem
DELETE /meals/:id                                    → 204
POST   /meals/:id/log                                → MealItem       (planned→logged, stamps loggedAt)
PUT    /meals/:date/:meal/meta {mood?,mealNote?}     → MealMeta
GET    /health                                       → {ok:true}     (no auth)
```

All routes except `/auth/*` and `/health` require Bearer token. Every data
route is scoped to the authenticated user's rows.

## FE integration

Plan/log/progress/profile screens stay untouched; only Login/Signup and
direct `foods.ts` importers change (listed below). The `DataService`
interface is synchronous with a
`subscribe()`/`emit()` pattern consumed via `useSyncExternalStore`, so the new
`ApiDataService` keeps an **in-memory cache**:

- On login/startup with valid token: hydrate cache from `GET /me`, `/plans`,
  `/foods`; show a loading state until hydrated.
- Writes: apply to cache optimistically, `emit()`, fire the API call. On
  failure: revert cache, `emit()`, toast the error.
- 401 from any call: clear token, sign out, redirect to `/splash`.

Concrete FE changes:

1. `src/services/api/client.ts` — small fetch wrapper: base URL from
   `VITE_API_URL`, attaches Bearer token, JSON errors → thrown `ApiError`.
2. `src/services/data/ApiDataService.ts` — implements `DataService` per above.
3. `src/services/data/index.ts` — singleton swap: `ApiDataService` when
   `VITE_API_URL` set, else `LocalDataService` (keeps demo/dev mode working).
4. `Login.tsx` / `Signup.tsx` — call real endpoints; show 401/409 errors
   inline; remove Google button; "forgot password" stays a stub toast.
5. Food catalog: `getFoods()` added to `DataService`; `LocalDataService`
   returns the hardcoded catalog, `ApiDataService` returns fetched foods.
   Screens that import `src/data/foods.ts` directly switch to the service.
6. `DataService` interface additions: `getFoods()`, plus async-aware
   `signIn(email, password)` / `signUp(name, email, password)` replacing the
   current mock `signIn(user)`.

## Error handling

- BE: Zod 400s with field messages; 401 unauthenticated; 403 never needed
  (rows always user-scoped); 404 missing meal item; 409 duplicate email;
  central handler logs and returns 500 `{error:"Internal error"}`.
- FE: auth screens show endpoint errors inline; data writes revert + toast;
  hydration failure shows retry UI; offline = normal fetch failure toast.

## Testing

- BE: supertest smoke tests per phase — one happy path + one auth-rejection
  per route group. No exhaustive suites (YAGNI).
- FE: manual E2E walkthrough of every screen flow against the real backend in
  the final phase (signup → setup → plan → log → mood/notes → progress →
  profile edit → logout → login).

## Documentation structure (built alongside, token-cheap)

```
CLAUDE.md                  # root, ~30 lines max: what app is, layout, run
                           # commands, pointers to .claude/docs/*
server/CLAUDE.md           # BE-only: route list pointer, Prisma workflow, auth mechanism
.claude/docs/
  architecture.md          # DataService seam, ApiDataService cache pattern
  api-contract.md          # endpoint list — source of truth, updated per phase
  decisions.md             # dated decisions (starts with the table above)
```

Rules: root file is pointers not content (>10 lines of detail → move to
`.claude/docs/` + one pointer line). `api-contract.md` updated at the end of
every phase that touches endpoints. No route-by-route prose that rots —
decisions and non-obvious constraints only. (FE lives at repo root, so FE
conventions go in root CLAUDE.md; no `client/CLAUDE.md`. No outbox/dual-mode
doc — online-only was chosen.)

## Phases

Each phase is shippable and verifiable on its own.

1. **Foundation** — `server/` scaffold (Express + TS + Prisma), root
   `docker-compose.yml` (Postgres 16), Prisma schema + first migration, food
   seed script, `GET /health`. Docs: root `CLAUDE.md`, `.claude/docs/`
   skeleton with `decisions.md`.
2. **Auth API** — `POST /auth/signup`, `POST /auth/login` (bcrypt + JWT),
   auth middleware, `GET/PATCH /me`. Supertest smoke tests. Docs:
   `server/CLAUDE.md`, `api-contract.md` auth section.
3. **Data API** — `GET /foods`, `GET /plans`, `POST /meals`,
   `DELETE /meals/:id`, `POST /meals/:id/log`, `PUT /meals/:date/:meal/meta`.
   Smoke tests. Docs: `api-contract.md` completed.
4. **FE integration** — fetch wrapper, `ApiDataService`, singleton swap via
   `VITE_API_URL`, real Login/Signup, hydration loading state, error
   toasts/reverts, foods via service. Docs: `architecture.md`.
5. **E2E verify** — full manual walkthrough of every flow against real BE;
   fix fallout; confirm new accounts start empty; confirm local demo mode
   (no `VITE_API_URL`) still works.

## Out of scope (explicit)

Password reset, Google OAuth, offline sync/outbox, hydration/water tracking,
notifications, food filters, npm-workspace conversion, deployment/hosting.
