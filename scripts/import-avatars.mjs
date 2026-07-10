// Copies individual mascot PNGs into src/assets/avatars/.
//
// Usage: node scripts/import-avatars.mjs
import { mkdir, copyFile, readdir, unlink } from 'node:fs/promises'
import { join } from 'node:path'

const SRC_DIR = 'scripts/assets/avatars'
const OUT_DIR = 'src/assets/avatars'

/** Attachment order from the provided individual avatar files. */
const AVATARS = [
  { id: 'avatar-apple', file: 'avatar-apple.png' },
  { id: 'avatar-orange', file: 'avatar-orange.png' },
  { id: 'avatar-strawberry', file: 'avatar-strawberry.png' },
  { id: 'avatar-watermelon', file: 'avatar-watermelon.png' },
  { id: 'avatar-peach', file: 'avatar-peach.png' },
  { id: 'avatar-grapes', file: 'avatar-grapes.png' },
  { id: 'avatar-corn', file: 'avatar-corn.png' },
  { id: 'avatar-broccoli', file: 'avatar-broccoli.png' },
  { id: 'avatar-lemon', file: 'avatar-lemon.png' },
  { id: 'avatar-blueberry', file: 'avatar-blueberry.png' },
  { id: 'avatar-carrot', file: 'avatar-carrot.png' },
  { id: 'avatar-avocado', file: 'avatar-avocado.png' },
  { id: 'avatar-banana', file: 'avatar-banana.png' },
  { id: 'avatar-mushroom', file: 'avatar-mushroom.png' },
  { id: 'avatar-tomato', file: 'avatar-tomato.png' },
  { id: 'avatar-pineapple', file: 'avatar-pineapple.png' },
]

const ALL_IDS = new Set(AVATARS.map((a) => a.id))

await mkdir(SRC_DIR, { recursive: true })
await mkdir(OUT_DIR, { recursive: true })

for (const { id, file } of AVATARS) {
  const src = join(SRC_DIR, file)
  const dest = join(OUT_DIR, `${id}.png`)
  await copyFile(src, dest)
  console.log('copied', dest)
}

for (const file of await readdir(OUT_DIR)) {
  if (!file.endsWith('.png')) continue
  const id = file.replace(/\.png$/, '')
  if (!ALL_IDS.has(id)) {
    await unlink(join(OUT_DIR, file))
    console.log('removed', file)
  }
}

// Remove legacy sheet crops from illustrations.
const legacyDir = 'src/assets/illustrations'
for (const file of await readdir(legacyDir)) {
  if (file.startsWith('avatar-') && file.endsWith('.png') && file !== 'avatar-user.png') {
    await unlink(join(legacyDir, file))
    console.log('removed legacy', file)
  }
}

console.log('Done —', AVATARS.length, 'avatars')
