// Crops the mascot avatar sheet (4×5 grid) into square PNGs.
// Insets each cell slightly to avoid neighbour bleed at grid lines.
// Pads to square with cream — no trim. Match tile bg in UI to cream.
//
// Usage: node scripts/crop-avatars.mjs [path-to-sheet]
import { mkdir, readdir, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

const SOURCE =
  process.argv[2] ??
  'scripts/assets/avatar-sheet.jpg'

const OUT_DIR = 'src/assets/illustrations'
const OUTPUT_SIZE = 360

/** App cream (#faf7e8) — matches sheet background and avatar tiles. */
const CREAM = { r: 250, g: 247, b: 232, alpha: 255 }

/** Row-major order matching the reference sheet (left → right, top → bottom). */
const AVATAR_IDS = [
  ['avatar-apple', 'avatar-orange', 'avatar-strawberry', 'avatar-watermelon', 'avatar-peach'],
  ['avatar-grapes', 'avatar-corn', 'avatar-broccoli', 'avatar-blueberry', 'avatar-lemon'],
  ['avatar-carrot', 'avatar-avocado', 'avatar-banana', 'avatar-garlic', 'avatar-mushroom'],
  ['avatar-tomato', 'avatar-pineapple', 'avatar-pepper', 'avatar-onion', 'avatar-cucumber'],
]

const COLS = 5
const ROWS = 4
/** Shrink extract inside each grid cell — keeps neighbours out of the crop. */
const INSET_RATIO = 0.035
/** Scale mascot up inside the square canvas after crop. */
const CONTENT_SCALE = 1.14

const ALL_IDS = new Set(AVATAR_IDS.flat())

await mkdir(OUT_DIR, { recursive: true })

const meta = await sharp(SOURCE).metadata()
const cellW = meta.width / COLS
const cellH = meta.height / ROWS

async function toSquareAvatar(buffer) {
  const { width = 0, height = 0 } = await sharp(buffer).metadata()
  const scaledW = Math.round(width * CONTENT_SCALE)
  const scaledH = Math.round(height * CONTENT_SCALE)

  const scaled = await sharp(buffer)
    .resize(scaledW, scaledH, { fit: 'inside' })
    .png()
    .toBuffer()

  const { width: sw = 0, height: sh = 0 } = await sharp(scaled).metadata()
  const size = Math.max(sw, sh)
  const padTop = Math.floor((size - sh) / 2)
  const padLeft = Math.floor((size - sw) / 2)

  return sharp(scaled)
    .extend({
      top: padTop,
      bottom: size - sh - padTop,
      left: padLeft,
      right: size - sw - padLeft,
      background: CREAM,
    })
    .resize(OUTPUT_SIZE, OUTPUT_SIZE, {
      fit: 'contain',
      background: CREAM,
    })
    .png()
}

for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    const id = AVATAR_IDS[row][col]

    const baseLeft = Math.round(col * cellW)
    const baseTop = Math.round(row * cellH)
    const baseRight = col === COLS - 1 ? meta.width : Math.round((col + 1) * cellW)
    const baseBottom = row === ROWS - 1 ? meta.height : Math.round((row + 1) * cellH)
    const baseW = baseRight - baseLeft
    const baseH = baseBottom - baseTop

    const insetX = Math.round(baseW * INSET_RATIO)
    const insetY = Math.round(baseH * INSET_RATIO)
    const left = baseLeft + insetX
    const top = baseTop + insetY
    const width = baseW - insetX * 2
    const height = baseH - insetY * 2

    const out = `${OUT_DIR}/${id}.png`
    const cell = await sharp(SOURCE).extract({ left, top, width, height }).toBuffer()
    const pipeline = await toSquareAvatar(cell)
    await pipeline.toFile(out)
    console.log('wrote', out)
  }
}

for (const file of await readdir(OUT_DIR)) {
  if (!file.startsWith('avatar-') || !file.endsWith('.png')) continue
  const id = file.replace(/\.png$/, '')
  if (!ALL_IDS.has(id) && id !== 'avatar-user') {
    await unlink(join(OUT_DIR, file))
    console.log('removed', file)
  }
}

console.log('Done —', COLS * ROWS, 'avatars')
