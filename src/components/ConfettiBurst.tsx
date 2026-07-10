type Particle = {
  left: string
  top: string
  color: string
  size: number
  shape: 'square' | 'diamond' | 'circle'
  delay: number
  duration: number
  rotate: number
}

const PARTICLES: Particle[] = [
  { left: '6%', top: '4%', color: '#f59e0b', size: 8, shape: 'square', delay: 0, duration: 2.6, rotate: 12 },
  { left: '18%', top: '10%', color: '#4c9b50', size: 7, shape: 'diamond', delay: 0.08, duration: 2.8, rotate: -18 },
  { left: '32%', top: '2%', color: '#facc15', size: 6, shape: 'square', delay: 0.15, duration: 2.4, rotate: 24 },
  { left: '48%', top: '8%', color: '#fb923c', size: 7, shape: 'circle', delay: 0.05, duration: 2.9, rotate: 0 },
  { left: '62%', top: '3%', color: '#4c9b50', size: 8, shape: 'diamond', delay: 0.12, duration: 2.5, rotate: 30 },
  { left: '78%', top: '9%', color: '#fbbf24', size: 7, shape: 'square', delay: 0.2, duration: 2.7, rotate: -8 },
  { left: '90%', top: '5%', color: '#7cbb6a', size: 6, shape: 'circle', delay: 0.1, duration: 2.6, rotate: 0 },
  { left: '14%', top: '18%', color: '#f97316', size: 5, shape: 'diamond', delay: 0.25, duration: 3, rotate: 45 },
  { left: '52%', top: '16%', color: '#eab308', size: 6, shape: 'square', delay: 0.18, duration: 2.8, rotate: -20 },
  { left: '86%', top: '17%', color: '#4c9b50', size: 5, shape: 'square', delay: 0.22, duration: 2.5, rotate: 15 },
  { left: '38%', top: '14%', color: '#fb923c', size: 5, shape: 'diamond', delay: 0.3, duration: 3.1, rotate: -35 },
  { left: '70%', top: '12%', color: '#facc15', size: 6, shape: 'circle', delay: 0.28, duration: 2.9, rotate: 0 },
]

function particleClass(shape: Particle['shape']) {
  if (shape === 'circle') return 'rounded-full'
  if (shape === 'diamond') return 'rotate-45 rounded-[1px]'
  return 'rounded-[2px]'
}

/** Decorative confetti burst for success screens. */
export function ConfettiBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className={`confetti-particle absolute ${particleClass(p.shape)}`}
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ['--confetti-rotate' as string]: `${p.rotate}deg`,
          }}
        />
      ))}
    </div>
  )
}
