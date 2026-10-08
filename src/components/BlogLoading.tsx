'use client'

import type { BlogLayout } from './BlogLayoutToggle'
import { Bone, SkeletonStatus } from './Skeleton'

// The blog's loading skeletons: an outline of whichever layout (list /
// grid) is about to appear, so the page already has its shape and doesn't
// jump when the posts land.

function ListRowSkeleton() {
  return (
    <div className='flex items-start justify-between gap-6 border-b border-neutral-200 py-6 first:pt-0 dark:border-neutral-700'>
      <div className='flex min-w-0 flex-1 flex-col gap-3'>
        <Bone className='h-3.5 w-36' />
        <Bone className='h-6 w-3/4 sm:h-7' />
        <Bone className='h-4 w-full' />
        <Bone className='h-4 w-2/3' />
      </div>
      <Bone className='h-24 w-24 flex-shrink-0 sm:h-28 sm:w-28' />
    </div>
  )
}

function GridCardSkeleton({ large = false }: { large?: boolean }) {
  return (
    <div
      className={`flex h-full flex-col border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800 ${
        large ? 'sm:row-span-2' : ''
      }`}
    >
      {large && <Bone className='aspect-[3/2] w-full sm:aspect-[2/1]' />}
      <div
        className={`flex flex-1 flex-col items-center justify-center gap-3 ${
          large ? 'p-6 sm:p-10' : 'p-4 sm:p-5'
        }`}
      >
        <Bone className='h-5 w-16 rounded-full' />
        <Bone className={large ? 'h-8 w-2/3' : 'h-5 w-3/4'} />
        <Bone className='h-3.5 w-28' />
        <Bone className='h-4 w-5/6' />
      </div>
    </div>
  )
}

export default function BlogLoading({
  layout,
}: {
  // null = the saved layout isn't known yet (server render, before
  // hydration): nothing drawn then, rather than guessing a shape that may
  // be the wrong one.
  layout: BlogLayout | null
}) {
  return (
    <SkeletonStatus>
      {layout === 'list' && (
        <div className='mx-auto flex w-full max-w-2xl flex-col md:mt-6'>
          <ListRowSkeleton />
          <ListRowSkeleton />
          <ListRowSkeleton />
        </div>
      )}
      {layout === 'grid' && (
        <div className='md:mt-6'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:grid-rows-2 sm:gap-6'>
            <GridCardSkeleton large />
            <GridCardSkeleton />
            <GridCardSkeleton />
          </div>
        </div>
      )}
    </SkeletonStatus>
  )
}

// Infinite scroll's "loading the next page": more of the same outline,
// right where the next posts will appear — two list rows, or one row of
// three small grid cards (the grid's layout for everything past the
// featured top three).
export function BlogLoadingMore({ layout }: { layout: BlogLayout }) {
  return (
    <SkeletonStatus className='w-full'>
      {layout === 'list' ? (
        <div className='mx-auto flex w-full max-w-2xl flex-col'>
          <ListRowSkeleton />
          <ListRowSkeleton />
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6'>
          <GridCardSkeleton />
          <GridCardSkeleton />
          <GridCardSkeleton />
        </div>
      )}
    </SkeletonStatus>
  )
}

// A single post (/blog/[id]) while it loads: back link, then the white
// article panel with title, date + tag + translate button row, rule, and a
// few paragraphs — same box/padding as the real page so nothing jumps.
const PARAGRAPHS = [
  ['w-full', 'w-full', 'w-11/12', 'w-2/3'],
  ['w-full', 'w-full', 'w-5/6'],
  ['w-full', 'w-11/12', 'w-full', 'w-1/2'],
]

export function BlogPostLoading() {
  return (
    <SkeletonStatus className='flex w-full flex-col gap-8 sm:gap-10'>
      <Bone className='h-4 w-24' />
      <div className='-mx-4 bg-white p-4 sm:mx-0 sm:rounded-2xl sm:border sm:border-neutral-200 sm:p-8 dark:bg-neutral-800 sm:dark:border-neutral-700'>
        <div className='flex flex-col gap-3'>
          <Bone className='h-9 w-3/4 sm:h-10' />
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-center justify-between gap-2 sm:justify-start'>
              <Bone className='h-3.5 w-48' />
              <Bone className='h-5 w-16 rounded-full' />
            </div>
            <Bone className='h-7 w-44 self-end rounded-full sm:self-auto' />
          </div>
        </div>
        <hr className='my-6 border-neutral-200 dark:border-neutral-700' />
        <div className='flex flex-col gap-7'>
          {PARAGRAPHS.map((lines, i) => (
            <div key={i} className='flex flex-col gap-3'>
              {lines.map((w, j) => (
                <Bone key={j} className={`h-4 ${w}`} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </SkeletonStatus>
  )
}
