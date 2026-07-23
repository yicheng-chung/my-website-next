'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from '@/lib/useTranslations'
import content from '@/content/reading.json'
import BookCard from '@/components/BookCard'
import Spinner from '@/components/Spinner'
import {
  readNotionCache,
  writeNotionCache,
  type NotionData,
} from '@/lib/notionCache'

export default function ReadingPage() {
  const t = useTranslations(content)
  const [data, setData] = useState<NotionData | null>(null)

  useEffect(() => {
    const cached = readNotionCache()
    if (cached) {
      setData(cached)
      return
    }
    let cancelled = false
    fetch('/api/notion')
      .then((res) => res.json())
      .then((json: NotionData) => {
        if (!cancelled) {
          setData(json)
          writeNotionCache(json)
        }
      })
      .catch(() => {
        if (!cancelled) setData({ reading: [], finished: [] })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className='flex flex-col gap-6 sm:gap-8'>
      <div className='rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 dark:border-neutral-700 dark:bg-neutral-800'>
        <h1 className='mb-2 text-2xl font-bold text-[#F2A341] sm:text-3xl dark:text-[#F6B45E]'>
          {t.heading}
        </h1>
        <p className='mb-4 whitespace-pre-line text-base leading-relaxed sm:text-lg'>
          {t.sourceNote}
        </p>
      </div>

      {data === null ? (
        <div className='flex justify-center py-16'>
          <Spinner size={36} />
        </div>
      ) : (
        <>
          <section>
            <h2 className='mb-4 text-lg font-bold text-neutral-800 sm:text-xl dark:text-neutral-100'>
              {t.readingHeading}
            </h2>
            {data.reading.length === 0 && (
              <p className='text-sm text-neutral-500 dark:text-neutral-400'>
                {t.emptyReading}
              </p>
            )}
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-7'>
              {data.reading.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </section>

          <section>
            <h2 className='mb-4 text-lg font-bold text-neutral-800 sm:text-xl dark:text-neutral-100'>
              {t.finishedHeading}
            </h2>
            {data.finished.length === 0 && (
              <p className='text-sm text-neutral-500 dark:text-neutral-400'>
                {t.emptyFinished}
              </p>
            )}
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-7'>
              {data.finished.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
