// Generates PWA/App icons from the Nutri heart mark. Run: npm run icons
// These are placeholders — replace public/*.png with final branded icons later.
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const mark = (pad, bg, radius) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${radius}" fill="${bg}"/>
  <g transform="translate(${pad} ${pad}) scale(${(512 - pad * 2) / 48})">
    <path d="M25 9c1-4 4-6 8-6-.5 4-3 6.5-8 6z" fill="#4c9b50"/>
    <path d="M24.5 9.5c-.5-3-2.5-4.5-5.5-5 .5 3 2 4.7 5.5 5z" fill="#7cbb6a"/>
    <path d="M24 40C15 33.5 8.5 28 8.5 20.6 8.5 15.4 12.5 12 17 12c2.9 0 5.4 1.4 7 3.7 1.6-2.3 4.1-3.7 7-3.7 4.5 0 8.5 3.4 8.5 8.6C39.5 28 33 33.5 24 40z"
      stroke="#3f8843" stroke-width="3.2" stroke-linejoin="round" fill="none"/>
  </g>
</svg>`

await mkdir('public', { recursive: true })

const jobs = [
  { file: 'public/pwa-192.png', size: 192, svg: mark(72, '#faf7e8', 120) },
  { file: 'public/pwa-512.png', size: 512, svg: mark(72, '#faf7e8', 120) },
  // maskable: full-bleed background, extra safe-zone padding
  { file: 'public/pwa-512-maskable.png', size: 512, svg: mark(116, '#faf7e8', 0) },
  { file: 'public/apple-touch-icon.png', size: 180, svg: mark(72, '#faf7e8', 0) },
]

for (const { file, size, svg } of jobs) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(file)
  console.log('✓', file)
}
