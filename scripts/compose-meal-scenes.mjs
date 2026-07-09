// Builds static Home meal-card thumbnails to match the reference designs:
// large centred dish, small time-of-day scene in the corner, soft edge feather
// melting into a light card tint.
//
// Usage: node scripts/compose-meal-scenes.mjs
import sharp from 'sharp'

const SRC = 'src/assets/source-art'
const OUT = 'src/assets/illustrations'
const SIZE = 480

/** Per-meal compose recipe — tuned against the required mockup. */
const JOBS = [
  {
    out: 'meal-breakfast',
    scene: `${SRC}/scene-breakfast.png`,
    dish: `${SRC}/dish-dosa.png`,
    cardBg: '#faf7e8',
    dishScale: 0.72,
    dishCenterY: 0.57,
    cropTopFrac: 0.5,
    cropSideFrac: 0.7,
  },
  {
    out: 'meal-lunch',
    scene: `${SRC}/scene-lunch.png`,
    dish: `${SRC}/dish-rice-plate.png`,
    cardBg: '#eef1f6',
    dishScale: 0.72,
    dishCenterY: 0.57,
    cropTopFrac: 0.5,
    cropSideFrac: 0.7,
  },
  {
    out: 'meal-snack',
    scene: `${SRC}/scene-snack.png`,
    dish: `${SRC}/dish-snack-chai.png`,
    cardBg: '#faf7e8',
    dishScale: 0.68,
    dishCenterY: 0.54,
    cropTopFrac: 0.44,
    cropSideFrac: 0.6,
    cropLeftFrac: 0.54,
  },
  {
    out: 'meal-dinner',
    scene: `${SRC}/scene-dinner.png`,
    dish: `${SRC}/dish-dinner-bowl.png`,
    cardBg: '#eef1f6',
    dishScale: 0.66,
    dishCenterY: 0.55,
    cropTopFrac: 0.48,
    cropSideFrac: 0.68,
  },
]

function parseHex(hex) {
  const h = hex.replace('#', '')
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) }
}

/** Alpha mask: opaque centre, fading out over the outer `feather` fraction. */
function edgeFeatherMask(size, feather = 0.16) {
  const f = Math.round(size * feather)
  const mask = Buffer.alloc(size * size)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.min(x, y, size - 1 - x, size - 1 - y)
      const t = Math.min(1, d / f)
      mask[y * size + x] = Math.round(255 * t * t * (3 - 2 * t))
    }
  }
  return sharp(mask, { raw: { width: size, height: size, channels: 1 } }).png().toBuffer()
}

/** Layer a cutout dish over the scene frame. */
async function compositeDish(scenePath, dishPath, { dishScale, dishCenterY }) {
  const sceneBuf = await sharp(scenePath).ensureAlpha().toBuffer()
  const sceneMeta = await sharp(sceneBuf).metadata()
  const dishMeta = await sharp(dishPath).metadata()

  const dishWidth = Math.round(sceneMeta.width * dishScale)
  const dishHeight = Math.round(dishMeta.height * (dishWidth / dishMeta.width))
  const dishBuf = await sharp(dishPath).resize(dishWidth, dishHeight, { fit: 'inside' }).toBuffer()

  const left = Math.round((sceneMeta.width - dishWidth) / 2)
  const top = Math.round(sceneMeta.height * dishCenterY - dishHeight / 2)

  return sharp(sceneBuf).composite([{ input: dishBuf, left, top }]).png().toBuffer()
}

for (const job of JOBS) {
  const {
    out,
    scene,
    dish,
    cardBg,
    dishScale,
    dishCenterY,
    cropTopFrac,
    cropSideFrac,
    cropLeftFrac = 0.5,
  } = job

  let composed = await compositeDish(scene, dish, { dishScale, dishCenterY })
  composed = await sharp(composed).flatten({ background: parseHex(cardBg) }).png().toBuffer()

  const meta = await sharp(composed).metadata()
  const side = Math.round(Math.min(meta.width, meta.height) * cropSideFrac)
  const crop = await sharp(composed)
    .extract({
      left: Math.max(0, Math.floor(meta.width * cropLeftFrac - side / 2)),
      top: Math.max(0, Math.floor(meta.height * cropTopFrac - side / 2)),
      width: side,
      height: side,
    })
    .resize(SIZE, SIZE)
    .toBuffer()

  const layers = [{ input: await edgeFeatherMask(SIZE), blend: 'dest-in' }]
  await sharp(crop).composite(layers).png().toFile(`${OUT}/${out}.png`)

  console.log(`✓ ${out}.png  cardBg ${cardBg}`)
}
