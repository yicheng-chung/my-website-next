'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import { Sparkle } from 'lucide-react'

interface StarfieldGuideProps {
  total: number
  answered: number
  exploring: number
  lang: 'zh' | 'en'
  onReset: () => void
}

const TEXT = {
  zh: {
    title: '宇宙指南',
    answered: '已找到答案',
    exploring: '持續探索中',
    favorite: '特別喜歡的問題',
    total: '問題總數',
    answeredCount: '已解答',
    exploringCount: '探索中',
    guide: '指南',
    reset: '讓星星回到原來位置',
  },
  en: {
    title: 'Universe Guide',
    answered: 'Answered',
    exploring: 'Still exploring',
    favorite: 'A favorite question',
    total: 'Total questions',
    answeredCount: 'Answered',
    exploringCount: 'Exploring',
    guide: 'Guide',
    reset: 'Reset star positions',
  },
}

function StarSwatch({
  variant,
}: {
  variant: 'answered' | 'exploring' | 'favorite'
}) {
  const color = variant === 'exploring' ? '#5b5f63' : '#9BB8C2'
  const size = variant === 'favorite' ? 18 : 14
  const glow =
    variant === 'exploring'
      ? 'none'
      : `drop-shadow(0 0 4px rgba(155,184,194,0.7)) drop-shadow(0 0 ${
          variant === 'favorite' ? 10 : 6
        }px rgba(155,184,194,0.4))`
  return (
    <Sparkle
      width={size}
      height={size}
      fill={color}
      stroke={color}
      strokeWidth={1}
      style={{ filter: glow, flexShrink: 0 }}
    />
  )
}

function GuideContent({
  total,
  answered,
  exploring,
  lang,
  onReset,
}: StarfieldGuideProps) {
  const t = TEXT[lang]
  return (
    <div className='space-y-3 text-sm'>
      <p className='font-semibold text-neutral-100'>{t.title}</p>
      <ul className='space-y-2 text-neutral-300'>
        <li className='flex items-center gap-2'>
          <StarSwatch variant='answered' /> {t.answered}
        </li>
        <li className='flex items-center gap-2'>
          <StarSwatch variant='exploring' /> {t.exploring}
        </li>
        <li className='flex items-center gap-2'>
          <StarSwatch variant='favorite' /> {t.favorite}
        </li>
      </ul>
      <div className='grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-center'>
        <div>
          <p className='text-lg font-bold text-neutral-100'>{total}</p>
          <p className='text-[10px] text-neutral-400'>{t.total}</p>
        </div>
        <div>
          <p className='text-lg font-bold text-[#9BB8C2]'>{answered}</p>
          <p className='text-[10px] text-neutral-400'>{t.answeredCount}</p>
        </div>
        <div>
          <p className='text-lg font-bold text-neutral-300'>{exploring}</p>
          <p className='text-[10px] text-neutral-400'>{t.exploringCount}</p>
        </div>
      </div>
      <button
        type='button'
        onClick={onReset}
        className='flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2 text-xs text-neutral-200 transition-colors hover:bg-white/10'
      >
        <RotateCcw size={13} />
        {t.reset}
      </button>
    </div>
  )
}

// The planet drifts slowly within a small radius even at rest, and the glow
// brightens on hover — separate from the drift so hover feedback stays
// instant regardless of where the drift loop currently is.
function GuidePlanet({ open }: { open: boolean }) {
  return (
    <motion.span
      aria-hidden
      className='relative block h-14 w-14'
      animate={{ x: [0, 7, -5, 0], y: [0, -6, 5, 0] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.span
        className='absolute inset-0 overflow-hidden rounded-full'
        animate={{
          boxShadow: open
            ? '0 0 16px 3px rgba(155,184,194,0.6), 0 0 30px 8px rgba(155,184,194,0.3)'
            : '0 0 10px 2px rgba(155,184,194,0.4), 0 0 18px 5px rgba(155,184,194,0.18)',
        }}
        whileHover={{
          boxShadow:
            '0 0 20px 4px rgba(155,184,194,0.75), 0 0 36px 10px rgba(155,184,194,0.4)',
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <Image src='/images/guide-planet.png' alt='' fill sizes='56px' className='object-cover' />
      </motion.span>
    </motion.span>
  )
}

export default function StarfieldGuide({
  total,
  answered,
  exploring,
  lang,
  onReset,
}: StarfieldGuideProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const t = TEXT[lang]

  // Tapping/clicking anywhere outside the planet or panel closes it.
  useEffect(() => {
    if (!open) return
    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  return (
    <div
      ref={containerRef}
      className='fixed right-4 bottom-4 z-30 md:right-6 md:bottom-6'
    >
      <AnimatePresence>
        {open && (
          <motion.div
            key='panel'
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.92 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className='mb-3 w-60 rounded-2xl border border-white/10 bg-[#0d1416]/90 p-4 backdrop-blur-md sm:w-64'
          >
            <GuideContent
              total={total}
              answered={answered}
              exploring={exploring}
              lang={lang}
              onReset={onReset}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type='button'
        onClick={() => setOpen((v) => !v)}
        aria-label={t.guide}
        aria-expanded={open}
        className='ml-auto flex cursor-pointer items-center justify-center'
      >
        <GuidePlanet open={open} />
      </button>
    </div>
  )
}
