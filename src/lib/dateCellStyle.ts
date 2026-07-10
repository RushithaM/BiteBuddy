import { dateHasActivity } from './plannerStats'
import type { PlanByDate } from '../types'

export type DateCellState = 'selected' | 'today' | 'logged' | 'planned' | 'default'

/** Visual state for a calendar date cell (week strip + month picker). */
export function getDateCellState(
  plans: PlanByDate,
  date: string,
  selected: string,
  today: string,
): DateCellState {
  if (date === selected) return 'selected'
  if (date === today) return 'today'
  if (date < today && dateHasActivity(plans, date, 'logged')) return 'logged'
  if (dateHasActivity(plans, date, 'planned')) return 'planned'
  return 'default'
}

export function dateCellNumberClass(state: DateCellState): string {
  switch (state) {
    case 'selected':
      return 'bg-brand text-white'
    case 'today':
      return 'bg-brand-tint text-brand-dark ring-2 ring-brand-dark'
    case 'logged':
      return 'bg-log-tint text-brand-dark'
    case 'planned':
      return 'bg-plan-tint text-ink'
    default:
      return 'text-ink'
  }
}

export function dateCellLabelClass(state: DateCellState): string {
  return state === 'selected' || state === 'today' ? 'text-brand' : 'text-muted'
}
