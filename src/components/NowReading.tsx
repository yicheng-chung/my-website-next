'use client'

import { useEffect, useState } from 'react'
import type { Book } from '@/lib/notion'
import ProgressBar from './ProgressBar'

export default function NowReading() {
  const [books, setBooks] = useState<Book[] | null>(null)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetch('/api/notion')
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setBooks(json.reading ?? [])
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

  if (!books || books.length === 0) return null

  const book = books[index]

  return (
    <div>
      <a
        key={book.id}
        href={book.url}
        target='_blank'
        rel='noreferrer'
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
      </a>

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
                  ? 'w-4 bg-[#577E89] dark:bg-[#9BB8C2]'
                  : 'w-1.5 bg-neutral-300 dark:bg-neutral-600'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
