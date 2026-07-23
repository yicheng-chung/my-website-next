'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { Book } from '@/lib/notion'
import { readNotionCache, writeNotionCache } from '@/lib/notionCache'
import ProgressBar from './ProgressBar'
import Spinner from './Spinner'

export default function NowReading() {
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
      <div className='flex h-[188px] items-center justify-center rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800'>
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
    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <Link
        key={book.id}
        href={`/reading/${book.id}`}
        className='flex animate-[fadeIn_0.4s_ease] items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800'
      >
        {book.cover ? (
          <div className='flex h-40 w-28 flex-shrink-0 items-center justify-center rounded-md bg-neutral-100 p-[5%] dark:bg-neutral-700'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={book.cover}
              alt={book.title}
              className='h-full w-full object-contain'
            />
          </div>
        ) : (
          <div className='h-40 w-28 flex-shrink-0 rounded-md bg-neutral-100 dark:bg-neutral-700' />
        )}
        <div className='min-w-0'>
          <p className='line-clamp-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100'>
            {book.title}
          </p>
          <p className='truncate text-xs text-neutral-500 dark:text-neutral-400'>{book.author}</p>
          {book.progress !== null && <ProgressBar percent={book.progress} />}
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
                  ? 'w-4 bg-[#F2A341] dark:bg-[#F6B45E]'
                  : 'w-1.5 bg-neutral-300 dark:bg-neutral-600'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
