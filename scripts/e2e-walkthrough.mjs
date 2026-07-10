/**
 * Task 16 — E2E walkthrough via Playwright.
 * Run: node scripts/e2e-walkthrough.mjs
 */
import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const email = `e2e-${Date.now()}@test.dev`
const password = 'password123'
const name = 'E2E Walker'

const results = []
function pass(step) {
  results.push({ step, ok: true })
  console.log(`✓ ${step}`)
}
function fail(step, err) {
  results.push({ step, ok: false, err: String(err) })
  console.error(`✗ ${step}: ${err}`)
}

async function clearStorage(page) {
  await page.goto(BASE)
  await page.evaluate(() => localStorage.clear())
}

async function fillLogin(page, addr, pw) {
  await page.locator('input[autocomplete="email"]').fill(addr)
  await page.locator('input[autocomplete="current-password"]').fill(pw)
}

async function main() {
  const browser = await chromium.launch({ headless: true })

  try {
    // --- Main flow ---
    const context = await browser.newContext()
    const page = await context.newPage()
    await clearStorage(page)

    await page.goto(`${BASE}/welcome`)
    await page.getByRole('button', { name: 'Get Started' }).click()
    await page.getByPlaceholder('Full name').fill(name)
    await page.getByPlaceholder('Email').fill(email)
    await page.getByPlaceholder('Password').fill(password)
    await page.getByRole('button', { name: 'Sign up' }).click()
    await page.waitForURL('**/setup')
    pass('1. Signup → /setup')

    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Tomato' }).click()
    await page.getByRole('button', { name: 'Finish setup' }).click()
    await page.waitForURL(`${BASE}/`)
    pass('2. Setup completes → home')

    await page.getByText('0 of 4 meals logged').waitFor()
    pass('3. New account home is empty')

    await page.getByRole('button', { name: /Dinner/i }).click()
    await page.getByRole('heading', { name: 'Add meal' }).waitFor()
    await page.getByRole('button', { name: /Dal Tadka/i }).click()
    await page.getByRole('button', { name: 'Add to Dinner' }).click()
    await page.getByRole('button', { name: 'Done' }).click()
    await page.getByText(/Dal Tadka|Dal/).waitFor()
    pass('4. Add food — dinner logged')

    await page.getByRole('link', { name: 'Plan' }).click()
    await page.getByRole('button', { name: 'Add', exact: true }).first().click()
    await page.getByRole('button', { name: /Dosa/i }).click()
    await page.getByRole('button', { name: /Add to/ }).click()
    await page.getByRole('button', { name: 'Done' }).click()
    await page.getByRole('button', { name: /Mark .+ as eaten/ }).first().click()
    await page.getByText('Marked as eaten').waitFor({ timeout: 5000 })
    pass('5. Planner — planned item marked eaten')

    await page.getByRole('link', { name: 'Today' }).click()
    await page.getByRole('button', { name: /Dinner/i }).click()
    await page.getByRole('button', { name: /Loved it/i }).click()
    const note = page.getByPlaceholder('Add a note (optional)...')
    await note.fill('light and tasty')
    await note.blur()
    pass('6. Meal details — mood + note')

    await page.reload()
    await page.getByText(/Dal Tadka|Dal/).waitFor()
    pass('7. Reload persists data')

    await page.goto(`${BASE}/profile`)
    await page.getByText('Edit profile').click()
    await page.getByPlaceholder('Your name').fill('E2E Updated')
    await page.getByRole('button', { name: 'Save changes' }).click()
    await page.getByText('E2E Updated').waitFor()
    pass('8. Profile updated')

    await page.getByRole('button', { name: 'Log Out' }).click()
    await page.waitForURL('**/splash')
    pass('9. Logout → splash')

    await page.goto(`${BASE}/login`)
    await fillLogin(page, email, 'wrong-password')
    await page.getByRole('button', { name: 'Login' }).click()
    await page.getByRole('alert').waitFor()
    const err = await page.getByRole('alert').textContent()
    if (!err?.includes('Incorrect')) throw new Error(`Expected 401, got: ${err}`)
    pass('10. Wrong password inline error')

    await fillLogin(page, email, password)
    await page.getByRole('button', { name: 'Login' }).click()
    await page.waitForURL(`${BASE}/`)
    await page.goto(`${BASE}/profile`)
    await page.getByText('E2E Updated').waitFor()
    await page.getByRole('link', { name: 'Today' }).click()
    await page.getByText(/Dal Tadka|Dal/).waitFor()
    pass('11. Login restores data')

    const health = await page.evaluate(async () => (await fetch('http://localhost:3001/health')).ok)
    if (!health) throw new Error('API down')
    pass('12. API health OK')

    await context.close()

    // --- Duplicate signup (separate context) ---
    const ctx2 = await browser.newContext()
    const page2 = await ctx2.newPage()
    await page2.goto(`${BASE}/welcome`)
    await page2.getByRole('button', { name: 'Get Started' }).click()
    await page2.getByPlaceholder('Full name').fill('Dup')
    await page2.getByPlaceholder('Email').fill(email)
    await page2.getByPlaceholder('Password').fill(password)
    await page2.getByRole('button', { name: 'Sign up' }).click()
    await page2.getByRole('alert').waitFor()
    const dup = await page2.getByRole('alert').textContent()
    if (!dup?.includes('already exists')) throw new Error(`Expected 409, got: ${dup}`)
    pass('13. Duplicate signup shows 409')

    await ctx2.close()

  } catch (e) {
    fail('UNHANDLED', e)
  } finally {
    await browser.close()
  }

  const failed = results.filter((r) => !r.ok)
  console.log(`\n--- ${results.filter((r) => r.ok).length}/${results.length} passed ---`)
  if (failed.length) {
    console.error(failed)
    process.exit(1)
  }
}

main()
