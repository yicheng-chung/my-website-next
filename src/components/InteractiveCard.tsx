'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState, type MouseEvent, type ReactNode } from 'react'

// Delay between the click "pop" and the actual route change, so the pop
// animation (defined in globals.css as .animate-book-pop) gets to play
// before the page swaps out from under it.
const POP_DURATION = 220
const TILT_DEGREES = 8

// A card that tilts toward the cursor (desktop) and plays a little "pop"
// before navigating on click, on both desktop and touch. Renders a real
// <a> (via next/link) so crawling and keyboard access still work — we just
// intercept the click to delay the route change for the animation.
export default function InteractiveCard({
  href,
  className,
  children,
}: {
  href: string
  className: string
  children: ReactNode
}) {
  const router = useRouter()
  const ref = useRef<HTMLAnchorElement>(null)
  const [popping, setPopping] = useState(false)

  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(700px) rotateX(${(-y * TILT_DEGREES).toFixed(2)}deg) rotateY(${(x * TILT_DEGREES).toFixed(2)}deg)`
  }

  const resetTilt = () => {
    if (ref.current) ref.current.style.transform = ''
  }

  const handleClick = (e: MouseEvent) => {
    e.preventDefault()
    if (popping) return
    resetTilt()
    setPopping(true)
    setTimeout(() => router.push(href), POP_DURATION)
  }

  return (
    <Link
      href={href}
      ref={ref}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      className={`transition-transform duration-150 ease-out active:scale-95 ${popping ? 'animate-book-pop' : ''} ${className}`}
    >
      {children}
    </Link>
  )
}
