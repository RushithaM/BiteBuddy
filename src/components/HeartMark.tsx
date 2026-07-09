/** Inline-SVG fallback for the heart logo (also the PWA icon source). */
export function HeartMark({ className = 'h-12 w-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      {/* leaves */}
      <path d="M25 9c1-4 4-6 8-6-.5 4-3 6.5-8 6z" fill="#4c9b50" />
      <path d="M24.5 9.5c-.5-3-2.5-4.5-5.5-5 .5 3 2 4.7 5.5 5z" fill="#7cbb6a" />
      {/* heart outline */}
      <path
        d="M24 40C15 33.5 8.5 28 8.5 20.6 8.5 15.4 12.5 12 17 12c2.9 0 5.4 1.4 7 3.7 1.6-2.3 4.1-3.7 7-3.7 4.5 0 8.5 3.4 8.5 8.6C39.5 28 33 33.5 24 40z"
        stroke="#3f8843"
        strokeWidth="3.2"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
