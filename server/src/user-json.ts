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
