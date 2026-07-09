// Removes near-white backgrounds from food icon PNGs via border flood-fill.
// Dark ink outlines act as barriers so the illustration is preserved.
//
// Usage: node scripts/cutout-food-icons.mjs
import { readdir } from 'node:fs/promises'
import sharp from 'sharp'

const DIR = 'src/assets/food-icons'

const files = (await readdir(DIR)).filter((f) => f.endsWith('.png'))

for (const file of files) {
  const path = `${DIR}/${file}`
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: W, height: H } = info

  const idx = (x, y) => (y * W + x) * 4
  const lum = (i) => 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
  const isBarrier = (i) => lum(i) < 88
  const isBg = (i) => {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    return r > 232 && g > 232 && b > 228
  }

  const visited = new Uint8Array(W * H)
  const queue = []
  for (let x = 0; x < W; x++) queue.push([x, 0], [x, H - 1])
  for (let y = 0; y < H; y++) queue.push([0, y], [W - 1, y])

  while (queue.length) {
    const [x, y] = queue.pop()
    if (x < 0 || y < 0 || x >= W || y >= H) continue
    const p = y * W + x
    const i = idx(x, y)
    if (visited[p] || isBarrier(i) || !isBg(i)) continue
    visited[p] = 1
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
  }

  // One-pixel dilation to eat anti-aliased fringe.
  const dilated = new Uint8Array(visited)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (visited[y * W + x]) continue
      if (
        (x > 0 && visited[y * W + x - 1]) ||
        (x < W - 1 && visited[y * W + x + 1]) ||
        (y > 0 && visited[(y - 1) * W + x]) ||
        (y < H - 1 && visited[(y + 1) * W + x])
      ) {
        dilated[y * W + x] = 1
      }
    }
  }

  for (let p = 0; p < W * H; p++) {
    if (dilated[p]) data[p * 4 + 3] = 0
  }

  let buf = await sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer()
  buf = await sharp(buf).trim().png().toBuffer()
  await sharp(buf).resize({ width: 256, fit: 'inside' }).png().toFile(path)

  const cleared = dilated.reduce((a, v) => a + v, 0)
  console.log(`✓ ${file} — cleared ${((cleared / (W * H)) * 100).toFixed(1)}%`)
}
