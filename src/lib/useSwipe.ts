import { useRef } from 'react'

/** Eenvoudige veeg-detectie voor touchscreens. Geeft handlers terug om op een element te zetten. */
export function useSwipe(onLeft: () => void, onRight: () => void, opts: { onDown?: () => void; min?: number } = {}) {
  const start = useRef<{ x: number; y: number; t: number } | null>(null)
  const min = opts.min ?? 50
  return {
    onTouchStart: (e: React.TouchEvent) => { const t = e.touches[0]; start.current = { x: t.clientX, y: t.clientY, t: Date.now() } },
    onTouchEnd: (e: React.TouchEvent) => {
      const s = start.current; start.current = null
      if (!s) return
      const t = e.changedTouches[0]; const dx = t.clientX - s.x; const dy = t.clientY - s.y
      if (Date.now() - s.t > 800) return
      if (Math.abs(dx) > min && Math.abs(dx) > Math.abs(dy) * 1.3) { if (dx < 0) onLeft(); else onRight() }
      else if (opts.onDown && dy > min * 1.6 && Math.abs(dy) > Math.abs(dx) * 1.3) opts.onDown()
    },
  }
}
