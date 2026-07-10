import { describe, expect, it } from 'vitest'
import type { MealItem, PlanByDate } from '../types'
import { addItemOp, logPlannedOp, makeItem, removeItemOp, updateItemOp, updateMetaOp } from './planOps'

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

  it('updateItemOp patches quantity/note on the matching mode only', () => {
    let plans = addItemOp({}, 'd', 'lunch', 'planned', item('a'))
    plans = addItemOp(plans, 'd', 'lunch', 'logged', item('a'))
    plans = updateItemOp(plans, 'd', 'lunch', 'a', 'logged', { quantity: '2 cups' })
    expect(plans.d.lunch!.logged[0].quantity).toBe('2 cups')
    expect(plans.d.lunch!.planned[0].quantity).toBeUndefined()
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
