// Background removal for the Nutri mascot art (solid/gradient backgrounds
// with glow halos). Naive color thresholds fail on this art because the glow
// is bright AND saturated — instead we flood-fill from the image borders and
// let the dark ink outlines (plus bright saturated sparkle fills) act as
// barriers, so enclosed characters survive while background, glow, and
// ground shadows are cleared.
//
// Usage: node scripts/cutout.mjs <in.png> <out.png> [maxWidth]
import sharp from 'sharp'

const [, , input, output, maxWidthArg] = process.argv
if (!input || !output) {
  console.error('usage: node scripts/cutout.mjs <in.png> <out.png> [maxWidth]')
  process.exit(1)
}

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: W, height: H } = info

const idx = (x, y) => (y * W + x) * 4
const isBarrier = (i) => {
  const r = data[i], g = data[i + 1], b = data[i + 2]
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
  if (lum < 95) return true // dark ink outline
  if (r > 235 && g > 180 && b < 140) return true // bright yellow sparkle/fruit fill
  return false
}

// BFS flood from every border pixel.
const visited = new Uint8Array(W * H)
const queue = []
for (let x = 0; x < W; x++) queue.push([x, 0], [x, H - 1])
for (let y = 0; y < H; y++) queue.push([0, y], [W - 1, y])
while (queue.length) {
  const [x, y] = queue.pop()
  if (x < 0 || y < 0 || x >= W || y >= H) continue
  const p = y * W + x
  if (visited[p] || isBarrier(idx(x, y))) continue
  visited[p] = 1
  queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
}

// Dilate the background once so blended halo pixels along outlines go too.
const dilated = new Uint8Array(visited)
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    if (visited[y * W + x]) continue
    if (
      (x > 0 && visited[y * W + x - 1]) ||
      (x < W - 1 && visited[y * W + x + 1]) ||
      (y > 0 && visited[(y - 1) * W + x]) ||
      (y < H - 1 && visited[(y + 1) * W + x])
    )
      dilated[y * W + x] = 1
  }

for (let p = 0; p < W * H; p++) if (dilated[p]) data[p * 4 + 3] = 0

let img = sharp(data, { raw: { width: W, height: H, channels: 4 } }).png()
img = sharp(await img.toBuffer()).trim()
const maxWidth = Number(maxWidthArg) || 720
const buf = await img.toBuffer()
const meta = await sharp(buf).metadata()
await sharp(buf)
  .resize({ width: Math.min(maxWidth, meta.width), fit: 'inside' })
  .png()
  .toFile(output)

const cleared = dilated.reduce((a, v) => a + v, 0)
console.log(`✓ ${output} — cleared ${((cleared / (W * H)) * 100).toFixed(1)}% as background`)
