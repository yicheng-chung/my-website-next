'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { canOptimizeCover, type Book } from '@/lib/notion'
import { readNotionCache, writeNotionCache } from '@/lib/notionCache'
import ProgressBar from './ProgressBar'
import Spinner from './Spinner'

// `onCream` is for the homepage's cream reading card: the site's dark blue
// for text, cover border and idle dots, orange for progress and the active
// dot (implies `bare`).
export default function NowReading({
  bare: bareProp = false,
  onCream = false,
}: {
  bare?: boolean
  onCream?: boolean
}) {
  const bare = bareProp || onCream
  const [books, setBooks] = useState<Book[] | null>(null)
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    const cached = readNotionCache()
    if (cached) {
      setBooks(cached.reading)
      return
    }
    let cancelled = false
    fetch('/api/notion')
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) {
          setBooks(json.reading ?? [])
          writeNotionCache(json)
        }
      })
      .catch(() => {
        if (!cancelled) setBooks([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!books || books.length < 2) return
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % books.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [books])

  if (books === null) {
    return (
      <div
        className={`flex items-center justify-center ${bare ? 'h-[152px]' : 'h-[216px]'} ${
          bare ? '' : 'rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800'
        }`}
      >
        <Spinner />
      </div>
    )
  }

  if (books.length === 0) return null

  const book = books[index]
  const swipeCount = books.length

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const startX = touchStartX.current
    touchStartX.current = null
    if (startX === null) return

    const deltaX = e.changedTouches[0].clientX - startX
    const SWIPE_THRESHOLD = 40
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return

    setIndex((i) => (deltaX < 0 ? (i + 1) % swipeCount : (i - 1 + swipeCount) % swipeCount))
  }

  return (
    // data-swipe-local tells Navbar's global edge-swipe-to-open-drawer
    // listener to leave touches here alone — this carousel already has its
    // own left/right swipe meaning (switch book), which was firing at the
    // same time as the drawer opening.
    <div data-swipe-local onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <Link
        key={book.id}
        href={`/reading/${book.id}`}
        className={`flex animate-[fadeIn_0.4s_ease] items-center gap-3 p-3 transition-shadow ${
          bare
            ? ''
            : 'rounded-xl border border-neutral-200 bg-white hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800'
        }`}
      >
        {book.cover ? (
          <div
            className={`relative flex-shrink-0 bg-white p-[5%] ${
              onCream ? 'h-44 w-30 border-2 border-[#2B455E]' : 'rounded-md'
            } ${onCream ? '' : bare ? 'h-38 w-26' : 'h-48 w-32'}`}
          >
            <Image
              src={book.cover}
              alt={book.title}
              fill
              sizes='128px'
              unoptimized={!canOptimizeCover(book.cover)}
              className='object-contain'
            />
          </div>
        ) : (
          <div
            className={`flex-shrink-0 bg-white ${
              onCream ? 'h-44 w-30 border-2 border-[#2B455E]' : `rounded-md ${bare ? 'h-38 w-26' : 'h-48 w-32'}`
            }`}
          />
        )}
        <div className='min-w-0 flex-1'>
          <p
            className={
              onCream
                ? 'line-clamp-2 text-xl wrap-anywhere leading-tight font-black text-[#2B455E] sm:text-2xl'
                : 'line-clamp-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100'
            }
          >
            {book.title}
          </p>
          <p
            className={
              onCream
                ? 'mt-1 mb-4 truncate text-sm text-[#2B455E]/70'
                : 'truncate text-xs text-neutral-500 dark:text-neutral-400'
            }
          >
            {book.author}
          </p>
          {book.progress !== null && <ProgressBar percent={book.progress} onCream={onCream} />}
        </div>
      </Link>

      {books.length > 1 && (
        <div className='mt-2 flex justify-center gap-1.5'>
          {books.map((b, i) => (
            <button
              key={b.id}
              type='button'
              aria-label={`第 ${i + 1} 本`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index
                  ? onCream
                    ? 'w-4 bg-[#F2A341]'
                    : 'w-4 bg-[#F2A341] dark:bg-[#F6B45E]'
                  : onCream
                    ? 'w-1.5 bg-[#2B455E]/25'
                    : 'w-1.5 bg-neutral-300 dark:bg-neutral-600'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
