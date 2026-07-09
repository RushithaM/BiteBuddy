# Nutri — Food Tracker PWA (BiteBuddy)

Mobile-first food tracking & weekly meal planning PWA, built to match the
green "Nutri" reference designs. Eat simple. Plan ahead. Stay healthy.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build + service worker (dist/)
npm run icons      # regenerate placeholder PWA icons from the heart mark
node scripts/screenshot-walkthrough.mjs   # Playwright walkthrough of all screens
```

## Stack

React 19 · Vite 7 · TypeScript · Tailwind CSS v4 (CSS-first `@theme`) ·
React Router 7 · vite-plugin-pwa · lucide-react · Nunito Variable

## Screens

| Route        | Screen                                              |
| ------------ | --------------------------------------------------- |
| `/welcome`   | Welcome (logo, tagline, hero, Get Started)          |
| `/login`     | Login (email/password, Google, forgot password)     |
| `/signup`    | Sign up                                             |
| `/`          | Home — today's meals with "+ Add food"              |
| `/planner`   | Weekly Planner — 7-day × 4-meal grid                |
| `/day/:date` | Day Plan — per-meal food lists with remove menu     |
| `/add`       | Add Food picker (meal selector + search)            |
| `/profile`   | Profile (identity card, menu, log out)              |

## Architecture notes

- **Mock data only (V1).** Screens talk to the `DataService` interface
  (`src/services/data/`); the shipped `LocalDataService` persists to
  localStorage and seeds the current week to mirror the reference designs.
  A `RemoteDataService` can be swapped in later without touching screens.
- **Auth is mocked.** Any credentials (or the Google button) sign in the
  demo user; state lives in localStorage. Log Out returns to Welcome.
- **Asset placeholders.** Illustrations render as emoji scenes until real
  art is dropped into `src/assets/illustrations/` (see its README for the
  expected filenames); food photos go into `src/assets/foods/<food-id>.png`.
  `public/*.png` app icons are generated placeholders (`npm run icons`).
- **PWA.** Installable (manifest + service worker via vite-plugin-pwa),
  portrait standalone display, safe-area-aware header/nav
  (`viewport-fit=cover` + `env(safe-area-inset-*)`).

## Deliberate V1 gaps

Real backend/API, real auth (password reset, Google OAuth), notifications &
reminders, profile editing, preferences, desktop layout.
