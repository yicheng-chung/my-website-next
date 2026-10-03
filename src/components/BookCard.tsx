import { MessageCircle } from 'lucide-react'
import Image from 'next/image'
import { canOptimizeCover, type Book } from '@/lib/notion'
import InteractiveCard from './InteractiveCard'
import ProgressBar from './ProgressBar'

export default function BookCard({
  book,
  variant = 'shelf',
}: {
  book: Book
  variant?: 'shelf' | 'featured'
}) {
  if (variant === 'featured') {
    return (
      <InteractiveCard
        href={`/reading/${book.id}`}
        className='group flex gap-4 rounded-xl border border-neutral-200 bg-white p-3 hover:shadow-md sm:p-4 dark:border-neutral-700 dark:bg-neutral-800'
      >
        <div className='relative aspect-[3/4] w-20 flex-shrink-0 overflow-hidden rounded-lg bg-white transition-transform duration-300 group-hover:scale-110 sm:w-28'>
          {book.cover && (
            <Image
              src={book.cover}
              alt={book.title}
              fill
              sizes='112px'
              unoptimized={!canOptimizeCover(book.cover)}
              className='object-contain'
            />
          )}
        </div>
        <div className='flex min-w-0 flex-1 flex-col justify-center gap-1.5'>
          <p className='line-clamp-2 text-base font-bold text-neutral-800 sm:text-lg dark:text-neutral-100'>
            {book.title}
          </p>
          <p className='truncate text-sm text-neutral-500 dark:text-neutral-400'>
            {book.author}
          </p>
          {book.progress !== null && (
            <div className='mt-1 max-w-48'>
              <ProgressBar percent={book.progress} />
            </div>
          )}
        </div>
      </InteractiveCard>
    )
  }

  return (
    <InteractiveCard
      href={`/reading/${book.id}`}
      className='group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800'
    >
      <div className='relative aspect-[3/4] w-full overflow-hidden bg-white p-[5%]'>
        {book.cover && (
          <Image
            src={book.cover}
            alt={book.title}
            fill
            sizes='(max-width: 640px) 50vw, 300px'
            unoptimized={!canOptimizeCover(book.cover)}
            className='object-contain transition-transform duration-300 group-hover:scale-105'
          />
        )}
        {book.hasReflection && (
          <div className='absolute top-1.5 right-1.5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#F2A341] text-white shadow-md'>
            <MessageCircle size={15} strokeWidth={0.25} fill='white' />
          </div>
        )}
      </div>
      <div className='flex flex-col gap-1 p-3'>
        <p className='line-clamp-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100'>
          {book.title}
        </p>
        <p className='truncate text-xs text-neutral-500 dark:text-neutral-400'>
          {book.author}
        </p>
        {book.progress !== null && <ProgressBar percent={book.progress} />}
      </div>
    </InteractiveCard>
  )
}
