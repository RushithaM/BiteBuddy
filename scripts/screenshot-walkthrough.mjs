import { chromium } from 'playwright'

const OUT = process.argv[2] ?? '/private/tmp/claude-501/-Users-vcomply-projects-BiteBuddy/8c590354-5e59-4ba3-a27a-5e8b67a5e519/scratchpad/shots'
const BASE = process.env.BASE_URL ?? 'http://localhost:5173'

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
})
const page = await ctx.newPage()
const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('pageerror', (e) => errors.push(String(e)))

const shot = async (name) => {
  await page.waitForTimeout(350)
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log('✓', name)
}

// fresh state
await page.goto(BASE + '/welcome')
await page.evaluate(() => localStorage.clear())

await page.goto(BASE + '/welcome')
await shot('1-welcome')

await page.getByRole('button', { name: 'Get Started' }).click()
await shot('2-login')

// login with credentials
await page.getByPlaceholder('Email address').fill('jyothish@example.com')
await page.getByPlaceholder('Password').fill('secret123')
await page.getByRole('button', { name: 'Login', exact: true }).click()
await shot('3-home')

// planner
await page.getByRole('link', { name: 'Planner' }).click()
await shot('4-planner')

// day plan for today (tap selected day)
const today = await page.evaluate(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})
await page.goto(`${BASE}/day/${today}`)
await shot('5-dayplan')

// add food flow
await page.goto(`${BASE}/add?date=${today}&meal=snack`)
await shot('6-addfood')
await page.getByRole('button', { name: /Masala Chai/ }).click()
await shot('7-home-or-back-after-add')

// profile
await page.goto(BASE + '/profile')
await shot('8-profile')

console.log(errors.length ? 'CONSOLE ERRORS:\n' + errors.join('\n') : 'no console errors')
await browser.close()
