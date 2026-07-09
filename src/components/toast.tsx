import { useEffect, useState } from 'react'

const EVENT = 'nutri:toast'

export function showToast(message: string) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: message }))
}

/** Small transient message pill, bottom-centered above the nav. */
export function ToastHost() {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const onToast = (e: Event) => {
      setMessage((e as CustomEvent<string>).detail)
      clearTimeout(timer)
      timer = setTimeout(() => setMessage(null), 2200)
    }
    window.addEventListener(EVENT, onToast)
    return () => {
      window.removeEventListener(EVENT, onToast)
      clearTimeout(timer)
    }
  }, [])

  if (!message) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-6">
      <div className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-cream shadow-card">
        {message}
      </div>
    </div>
  )
}
