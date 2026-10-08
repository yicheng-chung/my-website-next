'use client'

import Link from 'next/link'
import { useTranslations } from '@/lib/useTranslations'
import content from '@/content/activities.json'
import { ORANGE, PAPER, SAGE } from './EventTheme'

// The homepage's activity card while an event is on (`hasEvent` in
// activities.json), on the Activities page's cream. Kept to a glance (per
// yicheng: too much information before) — the orange pill, the serif title
// with an orange half, one short where/when line and a button — with a
// little shelf of book spines on the right (desktop) for the "bring your
// own book" idea. Hovering the card nudges the books: they rise a touch,
// one after another, and the leaning one stands up. The frame
// (`className`) comes from the homepage so it matches the other two cards.

// Spines left to right: width, height (px), color, decorative bands.
const SPINES = [
  { w: 30, h: 128, color: SAGE, bands: true },
  { w: 22, h: 108, color: '#D8CBB6', bands: false },
  { w: 36, h: 146, color: ORANGE, bands: true },
  { w: 26, h: 120, color: '#2B455E', bands: true },
  { w: 24, h: 100, color: '#B86A0B', bands: false },
]

function BookShelf() {
  return (
    <div aria-hidden className='relative hidden h-40 w-56 shrink-0 items-end justify-center md:flex'>
      <div className='flex items-end gap-1.5'>
        {SPINES.map((b, i) => (
          <span
            key={i}
            className='relative block rounded-t-[3px] transition-transform duration-500 ease-out group-hover:-translate-y-1.5'
            style={{
              width: b.w,
              height: b.h,
              backgroundColor: b.color,
              transitionDelay: `${i * 60}ms`,
            }}
          >
            {b.bands && (
              <>
                <span className='absolute inset-x-0 top-3 h-0.5 bg-white/40' />
                <span className='absolute inset-x-0 top-5 h-0.5 bg-white/40' />
                <span className='absolute inset-x-0 bottom-4 h-0.5 bg-white/30' />
              </>
            )}
          </span>
        ))}
        {/* The leaning one, tipped left onto its neighbor's top corner —
            stands up straight on hover. Pivots on its own bottom-left
            corner, so it stays on the shelf; the extra gap (6px + the row's
            6px) is what 7° of tilt covers at the neighbor's 100px height
            (100 · tan 7° ≈ 12px), so it just touches. */}
        <span
          className='relative ml-1.5 block h-[132px] w-7 origin-bottom-left -rotate-[7deg] rounded-t-[3px] transition-transform duration-500 ease-out group-hover:rotate-0'
          style={{ backgroundColor: '#5E5248', transitionDelay: '300ms' }}
        >
          <span className='absolute inset-x-0 top-4 h-0.5 bg-white/30' />
        </span>
      </div>
      {/* The shelf. */}
      <span className='absolute inset-x-0 bottom-0 h-1 rounded-full bg-neutral-900' />
    </div>
  )
}

export default function EventPreviewCard({ className = '' }: { className?: string }) {
  const e = useTranslations(content).event

  return (
    <Link
      href='/activities'
      className={`${className} group flex items-center justify-between gap-8 p-6 text-black sm:p-10`}
      style={{ backgroundColor: PAPER }}
    >
      <div className='min-w-0'>
        <span
          className='inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wide'
          style={{ backgroundColor: ORANGE }}
        >
          {e.eyebrow}
        </span>
        <p className='mt-4 font-serif text-3xl leading-tight font-bold tracking-tight text-balance sm:text-5xl'>
          {e.titleLead}
          <span style={{ color: ORANGE }}>{e.titleAccent}</span>
        </p>
        <p className='mt-4 text-sm font-medium text-neutral-500 sm:text-base'>{e.cardMeta}</p>
        <span className='mt-6 inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-bold text-white'>
          {e.cardCta}
          <span aria-hidden className='transition-transform duration-300 group-hover:translate-x-1'>
            →
          </span>
        </span>
      </div>
      <BookShelf />
    </Link>
  )
}
