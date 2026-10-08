'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { canOptimizeCover, type Book } from '@/lib/notion'
import { readNotionCache, writeNotionCache } from '@/lib/notionCache'
import ProgressBar from './ProgressBar'
import { Bone, SkeletonStatus } from './Skeleton'

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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reads this session's cache (sessionStorage) after mount on purpose: the server can't see it, so reading it during render would make server and client HTML differ.
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
    // Skeleton in the same shape as the book row below (cover, title,
    // author, progress, dots), sized per variant; on the cream card the
    // blocks are a faint dark blue instead of the default warm grey.
    const tone = onCream ? 'bg-[#2B455E]/10 [--skeleton-shine:rgba(255,255,255,0.5)]' : ''
    const cover = onCream
      ? 'h-44 w-30'
      : bare
        ? 'h-38 w-26 rounded-md'
        : 'h-48 w-32 rounded-md'
    return (
      <SkeletonStatus>
        <div
          className={`flex items-center gap-3 p-3 ${
            bare
              ? ''
              : 'rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800'
          }`}
        >
          <Bone className={`flex-shrink-0 ${cover} ${tone}`} />
          <div className='flex min-w-0 flex-1 flex-col gap-2'>
            <Bone className={`${onCream ? 'h-6' : 'h-4'} w-3/4 ${tone}`} />
            <Bone className={`${onCream ? 'mb-3 h-4' : 'h-3'} w-1/2 ${tone}`} />
            <Bone className={`h-1.5 w-full rounded-full ${tone}`} />
          </div>
        </div>
        <div className='mt-2 flex justify-center gap-1.5'>
          {Array.from({ length: 5 }).map((_, i) => (
            <Bone key={i} className={`h-1.5 w-1.5 rounded-full ${tone}`} />
          ))}
        </div>
      </SkeletonStatus>
    )
  }

  if (books.length === 0) return null

  const book = books[index]
  const swipeCount = books.length
  // The book the carousel shows next — its cover is loaded ahead of time
  // (see the hidden image below) so it's already there when its turn
  // comes, instead of the card sitting with a blank cover for a few seconds
  // while it downloads.
  const upcoming = books.length > 1 ? books[(index + 1) % books.length] : null

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

      {/* Same src/sizes as the visible cover, so the browser fetches the
          exact same (optimized) file and reuses it on the next turn. Eager,
          since a lazy image that's invisible never loads; 1px and
          transparent rather than display:none for the same reason. */}
      {upcoming?.cover && (
        <div aria-hidden className='pointer-events-none absolute h-px w-px overflow-hidden opacity-0'>
          <Image
            key={upcoming.id}
            src={upcoming.cover}
            alt=''
            fill
            sizes='128px'
            loading='eager'
            unoptimized={!canOptimizeCover(upcoming.cover)}
          />
        </div>
      )}

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
