// Strips near-white flat backgrounds from meal scene PNGs so they blend on cream UI.
// Usage: node scripts/remove-meal-image-bg.mjs
import { readdir } from 'node:fs/promises'
import sharp from 'sharp'

const DIR = 'src/assets/illustrations'

/** Pixels this close to white become transparent (keeps cream scene blobs & food). */
function isBackground(r, g, b) {
  const min = Math.min(r, g, b)
  const max = Math.max(r, g, b)
  return min >= 248 && max - min <= 8
}

async function stripWhite(path) {
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    if (isBackground(r, g, b)) data[i + 3] = 0
  }

  await sharp(data, { raw: { width, height, channels: 4 } }).png().toFile(path)
  console.log(`✓ ${path}`)
}

const files = await readdir(DIR)
const mealFiles = files.filter((f) => f.startsWith('meal-') && f.endsWith('.png'))
const dayEndFiles = files.filter((f) => f === 'today-day-end.png')

for (const file of [...mealFiles, ...dayEndFiles]) {
  await stripWhite(`${DIR}/${file}`)
}
