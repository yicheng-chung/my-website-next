'use client'

import { useEffect, useMemo, useRef, useState, type WheelEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from '@/lib/useTranslations'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { useCountUp } from '@/lib/useCountUp'
import content from '@/content/reading.json'
import common from '@/content/common.json'
import BookCard from '@/components/BookCard'
import DreamyBookBackdrop from '@/components/DreamyBookBackdrop'
import Footer from '@/components/Footer'
import { ReadingListLoading } from '@/components/ReadingLoading'
import { Bone } from '@/components/Skeleton'
import {
  readNotionCache,
  writeNotionCache,
  type NotionData,
} from '@/lib/notionCache'
import type { Book } from '@/lib/notion'

const TAG_ACTIVE = 'bg-[#F2A341] text-black'
const TAG_INACTIVE =
  'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'

function matchesTags(book: Book, activeTags: string[]): boolean {
  return (
    activeTags.length === 0 ||
    book.categories.some((c) => activeTags.includes(c))
  )
}

export default function ReadingPage() {
  const t = useTranslations(content)
  const { nav, siteName } = useTranslations(common)
  useDocumentTitle(`${nav.reading} · ${siteName}`)
  const [data, setData] = useState<NotionData | null>(null)
  const [activeTags, setActiveTags] = useState<string[]>([])

  useEffect(() => {
    const cached = readNotionCache()
    if (cached) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reads this session's cache (sessionStorage) after mount on purpose: the server can't see it, so reading it during render would make server and client HTML differ.
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

  // Stable reference so DreamyBookBackdrop's own useMemo only re-rolls its
  // random pick when the data actually changes — not on every render this
  // page does while useCountUp is still ticking (that was reshuffling the
  // backdrop every animation frame right after load).
  const backdropBooks = useMemo(
    () => (data ? [...data.reading, ...data.finished] : []),
    [data]
  )

  const allTags = useMemo(() => {
    if (!data) return []
    const set = new Set<string>()
    for (const book of [...data.reading, ...data.finished]) {
      for (const c of book.categories) set.add(c)
    }
    return Array.from(set).sort()
  }, [data])

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const filteredReading = useMemo(
    () => data?.reading.filter((b) => matchesTags(b, activeTags)) ?? [],
    [data, activeTags]
  )
  const filteredFinished = useMemo(
    () => data?.finished.filter((b) => matchesTags(b, activeTags)) ?? [],
    [data, activeTags]
  )

  const finishedStripRef = useRef<HTMLDivElement>(null)
  const scrollRafRef = useRef<number | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollBounds = () => {
    const container = finishedStripRef.current
    if (!container) return
    setCanScrollLeft(container.scrollLeft > 4)
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 4
    )
  }

  useEffect(() => {
    updateScrollBounds()
  }, [filteredFinished])

  const handleFinishedScroll = () => {
    if (scrollRafRef.current !== null) return
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null
      updateScrollBounds()
    })
  }

  // Lets a plain vertical mouse-wheel scroll this strip sideways while the
  // cursor is over it — only when the gesture is actually vertical, so a
  // trackpad's native horizontal swipe still passes through untouched.
  const handleFinishedWheel = (e: WheelEvent<HTMLDivElement>) => {
    const el = finishedStripRef.current
    if (!el || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
    e.preventDefault()
    el.scrollLeft += e.deltaY
  }

  const scrollFinishedBy = (direction: 1 | -1) => {
    finishedStripRef.current?.scrollBy({
      left: direction * 180,
      behavior: 'smooth',
    })
  }

  // The bookmarks stay hidden until the list itself is in (per yicheng),
  // so the page doesn't open on two photos around a spinner. Kept mounted
  // (display: none, not unmounted) so the top one's `priority` preload
  // still starts right away and it's ready the moment the list lands.
  const loaded = data !== null
  const bookmarkClass = loaded ? 'animate-[fadeIn_0.4s_ease]' : 'hidden'

  const categoryCount = useCountUp(allTags.length)
  const readingCount = useCountUp(filteredReading.length)
  const finishedCount = useCountUp(filteredFinished.length)

  return (
    <div className='flex flex-col gap-6 sm:gap-8'>
      <DreamyBookBackdrop books={backdropBooks} />
      {/* Two 有河書店 bookmarks bookend the page at full viewport width —
          this one on top, flush against the fixed navbar (same
          --navbar-height offset as Activities), the other at the very
          bottom. Photographed and pre-rotated to lie flat (the files
          themselves are landscape — no CSS rotation). Hidden while the
          Notion fetch is still out (see `loaded`); a skeleton block of the
          same size holds its place meanwhile, so the list doesn't get
          pushed down when the photo appears. */}
      {!loaded && (
        <Bone
          className='aspect-[2573/583] w-full'
          style={{ marginTop: 'var(--navbar-height, 84px)' }}
        />
      )}
      <Image
        src='/images/bookmark-resistance.jpg'
        alt={t.bookmarkResistanceAlt}
        width={2573}
        height={583}
        priority
        sizes='100vw'
        className={`h-auto w-full ${bookmarkClass}`}
        style={{ marginTop: 'var(--navbar-height, 84px)' }}
      />
      {/* ChromeLayout gives this route a full-bleed <main>, so the list
          itself re-applies the usual centered column and side gutter. */}
      <div className='mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 sm:gap-8 sm:px-6 lg:px-10'>
        {data === null ? (
          <ReadingListLoading />
        ) : (
          <>
            {allTags.length > 0 && (
              <div>
                <p className='mb-2 text-xs text-neutral-500 dark:text-neutral-400'>
                  {t.categoriesCaption.replace('{count}', String(categoryCount))}
                </p>
                <div className='flex flex-wrap gap-2'>
                  <button
                    type='button'
                    onClick={() => setActiveTags([])}
                    className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      activeTags.length === 0 ? TAG_ACTIVE : TAG_INACTIVE
                    }`}
                  >
                    {t.allTags}
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      type='button'
                      onClick={() => toggleTag(tag)}
                      className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        activeTags.includes(tag) ? TAG_ACTIVE : TAG_INACTIVE
                      }`}
                    >
                      ＃{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredReading.length > 0 && (
              <section>
                <h2 className='mb-4 text-lg font-bold text-neutral-800 sm:text-xl dark:text-neutral-100'>
                  {t.readingHeading}
                  <span className='ml-1 text-sm font-normal text-neutral-400 dark:text-neutral-500'>
                    {t.countSuffix.replace('{count}', String(readingCount))}
                  </span>
                </h2>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3'>
                  <AnimatePresence initial={false}>
                    {filteredReading.map((book) => (
                      <motion.div
                        key={book.id}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                      >
                        <BookCard book={book} variant='featured' />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )}

            {filteredFinished.length > 0 && (
              <section>
                <h2 className='mb-4 text-lg font-bold text-neutral-800 sm:text-xl dark:text-neutral-100'>
                  {t.finishedHeading}
                  <span className='ml-1 text-sm font-normal text-neutral-400 dark:text-neutral-500'>
                    {t.countSuffix.replace('{count}', String(finishedCount))}
                  </span>
                </h2>
                <div className='relative'>
                  <div
                    ref={finishedStripRef}
                    onWheel={handleFinishedWheel}
                    onScroll={handleFinishedScroll}
                    className='hide-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto py-6'
                  >
                    <AnimatePresence initial={false}>
                      {filteredFinished.map((book) => (
                        <motion.div
                          key={book.id}
                          layout
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{ duration: 0.2 }}
                          className='w-40 flex-shrink-0 snap-center sm:w-44 lg:w-48'
                        >
                          <div className='origin-center scale-100 transition-transform duration-200 ease-out hover:z-10 hover:scale-[1.1]'>
                            <BookCard book={book} variant='shelf' />
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <button
                    type='button'
                    aria-label={t.scrollLeft}
                    onClick={() => scrollFinishedBy(-1)}
                    disabled={!canScrollLeft}
                    className={`absolute top-1/2 left-0 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm transition-opacity ${
                      canScrollLeft
                        ? 'cursor-pointer border-neutral-200 bg-white/90 text-neutral-600 hover:bg-white dark:border-neutral-600 dark:bg-neutral-800/90 dark:text-neutral-300 dark:hover:bg-neutral-800'
                        : 'cursor-not-allowed border-neutral-200/50 bg-white/40 text-neutral-400 opacity-40 dark:border-neutral-700/50 dark:bg-neutral-800/40 dark:text-neutral-600'
                    }`}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type='button'
                    aria-label={t.scrollRight}
                    onClick={() => scrollFinishedBy(1)}
                    disabled={!canScrollRight}
                    className={`absolute top-1/2 right-0 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm transition-opacity ${
                      canScrollRight
                        ? 'cursor-pointer border-neutral-200 bg-white/90 text-neutral-600 hover:bg-white dark:border-neutral-600 dark:bg-neutral-800/90 dark:text-neutral-300 dark:hover:bg-neutral-800'
                        : 'cursor-not-allowed border-neutral-200/50 bg-white/40 text-neutral-400 opacity-40 dark:border-neutral-700/50 dark:bg-neutral-800/40 dark:text-neutral-600'
                    }`}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </section>
            )}
          </>
        )}
      </div>
      {/* From md (768px) up, the page's footer floats over this photo's
          bottom edge (compacted below xl, where the photo is shorter, so it
          stays clear of the bookmark's text). On phones the photo is far too
          short for that, so the ordinary footer sits just above it instead
          and the page ends on the bookmark alone (per yicheng). */}
      {/* mt/-mb shift it down toward the bookmark without moving the
          bookmark itself. While loading (no bookmark yet) this plain footer
          is shown at every width instead, so md+ isn't left without one. */}
      <div className={`mt-6 -mb-6 sm:mt-8 sm:-mb-8 ${loaded ? 'md:hidden' : ''}`}>
        <Footer />
      </div>
      <div className={`relative ${bookmarkClass}`}>
        <Image
          src='/images/bookmark-change.jpg'
          alt={t.bookmarkChangeAlt}
          width={2573}
          height={556}
          sizes='100vw'
          className='block h-auto w-full'
        />
        <div className='hidden md:absolute md:inset-x-0 md:bottom-0 md:block'>
          <Footer onImage />
        </div>
      </div>
    </div>
  )
}
