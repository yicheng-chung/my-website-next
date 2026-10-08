'use client'

import { useEffect, useRef, useState } from 'react'

// Fades its children up into place the first time they scroll into view,
// then stays put. `delay` (ms) staggers siblings.
//
// Content that's already on screen when the page opens is never hidden,
// and nothing is hidden before the page's code runs (or if it never does,
// or under reduced motion) — it only goes transparent once the observer has
// confirmed it's still below the fold, i.e. somewhere nobody is looking yet.
export default function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'idle' | 'waiting' | 'shown'>('idle')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let first = true
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Already in view on the very first check: leave it alone.
          setState(first ? 'idle' : 'shown')
          observer.disconnect()
        } else if (first) {
          setState('waiting')
        }
        first = false
      },
      { rootMargin: '0px 0px -10% 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`${className} ${
        state === 'waiting'
          ? 'translate-y-6 opacity-0'
          : state === 'shown'
            ? 'translate-y-0 opacity-100 transition-[opacity,transform] duration-700 ease-out'
            : ''
      }`}
      style={state === 'shown' ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
