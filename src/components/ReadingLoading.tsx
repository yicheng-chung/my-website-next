'use client'

import { Bone, SkeletonStatus } from './Skeleton'

// Loading skeletons for the reading pages — outlines in the shape of the
// real cards (BookCard's featured / shelf variants, the book page's
// panels), same boxes and padding so nothing jumps when the data lands.

const TAG_WIDTHS = ['w-12', 'w-20', 'w-16', 'w-14', 'w-20', 'w-12', 'w-16', 'w-24']

function FeaturedBookSkeleton() {
  return (
    <div className='flex gap-4 rounded-xl border border-neutral-200 bg-white p-3 sm:p-4 dark:border-neutral-700 dark:bg-neutral-800'>
      <Bone className='aspect-[3/4] w-20 flex-shrink-0 rounded-lg sm:w-28' />
      <div className='flex min-w-0 flex-1 flex-col justify-center gap-2.5'>
        <Bone className='h-5 w-3/4' />
        <Bone className='h-4 w-1/2' />
        <Bone className='mt-1 h-1.5 w-full max-w-48 rounded-full' />
      </div>
    </div>
  )
}

function ShelfBookSkeleton() {
  return (
    <div className='w-40 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-white sm:w-44 lg:w-48 dark:border-neutral-700 dark:bg-neutral-800'>
      <Bone className='aspect-[3/4] w-full' />
      <div className='flex flex-col gap-2 p-3'>
        <Bone className='h-4 w-5/6' />
        <Bone className='h-3 w-1/2' />
      </div>
    </div>
  )
}

// /reading: category pills, the "reading now" cards, the finished shelf.
// The top margin stands in for the navbar offset the (still hidden) top
// bookmark normally carries, plus a little air so the first row doesn't
// sit right under the navbar.
export function ReadingListLoading() {
  return (
    <SkeletonStatus
      className='flex flex-col gap-6 sm:gap-8'
      style={{ marginTop: 'calc(var(--navbar-height, 84px) + 1.5rem)' }}
    >
      <div>
        <Bone className='mb-2 h-3 w-28' />
        <div className='flex flex-wrap gap-2'>
          {TAG_WIDTHS.map((w, i) => (
            <Bone key={i} className={`h-6 rounded-full ${w}`} />
          ))}
        </div>
      </div>
      <div>
        <Bone className='mb-4 h-6 w-32' />
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3'>
          <FeaturedBookSkeleton />
          <FeaturedBookSkeleton />
          <FeaturedBookSkeleton />
        </div>
      </div>
      <div>
        <Bone className='mb-4 h-6 w-32' />
        <div className='flex gap-5 overflow-hidden py-6'>
          {Array.from({ length: 8 }).map((_, i) => (
            <ShelfBookSkeleton key={i} />
          ))}
        </div>
      </div>
    </SkeletonStatus>
  )
}

// /reading/[id]: back/Notion links, the cover + title panel, the info
// panel (date, progress, rating, categories), the reflection panel.
export function BookPageLoading() {
  return (
    <SkeletonStatus className='mx-auto flex max-w-2xl flex-col gap-8 sm:gap-10'>
      <div className='flex items-center justify-between'>
        <Bone className='h-4 w-24' />
        <Bone className='h-4 w-28' />
      </div>
      <div className='flex flex-col gap-5 rounded-2xl border border-neutral-200 bg-white p-6 sm:flex-row sm:items-start sm:p-8 dark:border-neutral-700 dark:bg-neutral-800'>
        <Bone className='h-56 w-40 flex-shrink-0 rounded-lg' />
        <div className='flex flex-1 flex-col'>
          <Bone className='h-9 w-3/4 sm:h-10' />
          <Bone className='mt-3 h-4 w-1/2' />
          <Bone className='mt-4 h-4 w-1/3' />
        </div>
      </div>
      <div className='flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5 dark:border-neutral-700 dark:bg-neutral-800/50'>
        <Bone className='h-3.5 w-44' />
        <Bone className='h-3.5 w-56' />
        <Bone className='h-3.5 w-32' />
        <div className='flex flex-wrap gap-2'>
          <Bone className='h-6 w-16 rounded-full' />
          <Bone className='h-6 w-20 rounded-full' />
        </div>
      </div>
      <div className='rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 dark:border-neutral-700 dark:bg-neutral-800'>
        <Bone className='mb-6 h-3.5 w-20' />
        <div className='flex flex-col gap-3'>
          <Bone className='h-4 w-full' />
          <Bone className='h-4 w-full' />
          <Bone className='h-4 w-11/12' />
          <Bone className='h-4 w-2/3' />
        </div>
      </div>
    </SkeletonStatus>
  )
}
