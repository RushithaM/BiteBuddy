// Composes the Home meal-card scene BACKGROUNDS from the supplied art
// (src/assets/source-art/scene-*.png), feathering the edges so each melts
// into its card color. The selected dish is overlaid at runtime by
// <MealSceneThumb> — no food is baked in here. The scenes' central shadow
// blob (meant for a composited dish) is neutralized with a soft radial
// brighten so empty meals don't show a ghost.
//
// Usage: node scripts/compose-meal-scenes.mjs
import sharp from 'sharp'

const SRC = 'src/assets/source-art'
const OUT = 'src/assets/illustrations'
const SIZE = 480

const JOBS = [
  { out: 'meal-breakfast', scene: `${SRC}/scene-breakfast.png` },
  { out: 'meal-lunch', scene: `${SRC}/scene-lunch.png` },
  { out: 'meal-snack', scene: `${SRC}/scene-snack.png` },
  { out: 'meal-dinner', scene: `${SRC}/scene-dinner.png` },
]

// Alpha mask: opaque center, fading out over the outer `feather` fraction.
function edgeFeatherMask(size, feather = 0.14) {
  const f = Math.round(size * feather)
  const mask = Buffer.alloc(size * size)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.min(x, y, size - 1 - x, size - 1 - y)
      const t = Math.min(1, d / f)
      mask[y * size + x] = Math.round(255 * t * t * (3 - 2 * t)) // smoothstep
    }
  }
  return sharp(mask, { raw: { width: size, height: size, channels: 1 } }).png().toBuffer()
}

for (const { out, scene } of JOBS) {
  const meta = await sharp(scene).metadata()
  // tight square crop inside the bright blobby interior — the source scenes
  // have a dark vignette hugging all four edges that must not leak in
  // crop high enough to keep the smiley sun/moon at top-left
  const side = Math.round(Math.min(meta.width, meta.height) * 0.78)
  const crop = await sharp(scene)
    .extract({
      left: Math.floor((meta.width - side) / 2),
      top: Math.floor(meta.height * 0.45 - side / 2),
      width: side,
      height: side,
    })
    .resize(SIZE, SIZE)
    .toBuffer()

  const layers = [{ input: await edgeFeatherMask(SIZE), blend: 'dest-in' }]

  await sharp(crop).composite(layers).png().toFile(`${OUT}/${out}.png`)

  // sample the card color: mean of the crop's outer ring (pre-feather)
  const { data, info } = await sharp(crop).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  let r = 0, g = 0, b = 0, n = 0
  const ring = Math.round(SIZE * 0.08)
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const d = Math.min(x, y, info.width - 1 - x, info.height - 1 - y)
      if (d > ring) continue
      const i = (y * info.width + x) * 3
      r += data[i]; g += data[i + 1]; b += data[i + 2]; n++
    }
  }
  const hex = '#' + [r, g, b].map((v) => Math.round(v / n).toString(16).padStart(2, '0')).join('')
  console.log(`✓ ${out}.png  cardBg ≈ ${hex}`)
}
