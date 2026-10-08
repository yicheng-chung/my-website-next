'use client'

import { useEffect, useState } from 'react'

// Animates from 0 up to `target` whenever `target` changes (e.g. once real
// data replaces the initial 0 after the Notion fetch resolves).
export function useCountUp(target: number, duration = 700): number {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (target <= 0) return
    let start: number | null = null
    let frame: number

    const step = (timestamp: number) => {
      if (start === null) start = timestamp
      const progress = Math.min(1, (timestamp - start) / duration)
      setValue(Math.round(progress * target))
      if (progress < 1) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  // A target of 0 just reads as 0 — derived here rather than reset with a
  // setState in the effect.
  return target <= 0 ? 0 : value
}
