'use client'

import { useMemo, useState, type CSSProperties } from 'react'
import Image from 'next/image'
import { canOptimizeCover, type Book } from '@/lib/notion'

// Fixed background layer of a few giant, softly blurred book covers that
// rise up the screen, each at its own speed and phase so they never look
// synced. Sits behind all page content — decorative only (aria-hidden,
// pointer-events-none), never meant to be legible.
// Small seeded random generator (mulberry32), so the picks below are a
// pure function of the books + one seed instead of calling Math.random
// while rendering.
function seededRandom(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export default function DreamyBookBackdrop({ books }: { books: Book[] }) {
  // Rolled once per mount (a lazy initializer runs only on the first
  // render), so the backdrop is still a fresh random mix each visit.
  const [seed] = useState(() => Math.floor(Math.random() * 2 ** 32))

  const covers = useMemo(() => {
    const random = seededRandom(seed)
    const withCovers = books.filter((b) => b.cover)
    if (withCovers.length === 0) return []

    // Picked once per mount (not re-rolled on every render) — four or five
    // random books from whatever's currently reading or finished.
    const count = Math.min(withCovers.length, 4 + Math.round(random()))
    const shuffled = [...withCovers].sort(() => random() - 0.5).slice(0, count)

    // Fixed slot templates for placement/size/timing/phase so the chosen
    // books never line up or move in sync.
    const slots = [
      { left: 4, size: 360, rotate: -7, duration: 34, delay: 0 },
      { left: 32, size: 300, rotate: 9, duration: 42, delay: -25 },
      { left: 58, size: 340, rotate: -4, duration: 38, delay: -14 },
      { left: 80, size: 280, rotate: 6, duration: 45, delay: -34 },
      { left: 18, size: 320, rotate: -10, duration: 40, delay: -8 },
    ]

    return shuffled.map((book, i) => ({
      ...slots[i % slots.length],
      src: book.cover as string,
      key: book.id,
    }))
  }, [books, seed])

  if (covers.length === 0) return null

  return (
    <div aria-hidden className='pointer-events-none fixed inset-0 -z-10 overflow-hidden'>
      {covers.map((c) => (
        <Image
          key={c.key}
          src={c.src}
          alt=''
          width={c.size}
          height={Math.round(c.size * 1.3)}
          unoptimized={!canOptimizeCover(c.src)}
          className='dreamy-drift absolute top-full rounded-[2rem] object-cover opacity-[0.25] blur-[28px] dark:opacity-[0.32]'
          style={
            {
              left: `${c.left}%`,
              // Tailwind's preflight resets img height to auto, which
              // fights with next/image's own width/height attributes
              // (hence Next's dev-only "width or height modified, but not
              // the other" warning) — pinning both explicitly here wins
              // over that reset instead of silently deferring to it.
              width: c.size,
              height: Math.round(c.size * 1.3),
              '--dreamy-rotate': `${c.rotate}deg`,
              animationDuration: `${c.duration}s`,
              animationDelay: `${c.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
