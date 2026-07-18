'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Info, RotateCcw, X } from 'lucide-react'
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

export default function StarfieldGuide({
  total,
  answered,
  exploring,
  lang,
  onReset,
}: StarfieldGuideProps) {
  // Desktop panel defaults open; collapses into a slim tab on the right edge.
  const [desktopOpen, setDesktopOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const mobileRef = useRef<HTMLDivElement>(null)
  const t = TEXT[lang]

  // Mobile: tapping anywhere outside the panel/button closes it.
  useEffect(() => {
    if (!mobileOpen) return
    function handlePointerDown(e: PointerEvent) {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [mobileOpen])

  return (
    <>
      {/* Desktop: collapsible drawer anchored to the right edge */}
      <div className='fixed right-0 bottom-6 z-30 hidden md:block'>
        <motion.div
          initial={false}
          animate={{ x: desktopOpen ? 0 : 224 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className='relative w-56 rounded-l-2xl border border-r-0 border-white/10 bg-white/5 p-4 backdrop-blur-md'
        >
          <button
            type='button'
            onClick={() => setDesktopOpen((v) => !v)}
            aria-label={t.guide}
            aria-expanded={desktopOpen}
            className='absolute top-1/2 -left-8 flex h-10 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-l-lg border border-r-0 border-white/10 bg-white/10 text-white backdrop-blur-md'
          >
            {desktopOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <GuideContent
            total={total}
            answered={answered}
            exploring={exploring}
            lang={lang}
            onReset={onReset}
          />
        </motion.div>
      </div>

      {/* Mobile: collapsible button, closes on tap outside */}
      <div ref={mobileRef} className='fixed right-4 bottom-4 z-30 md:hidden'>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className='mb-3 w-56 rounded-2xl border border-white/10 bg-[#0d1416]/90 p-4 backdrop-blur-md'
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
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={t.guide}
          className='ml-auto flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-md'
        >
          {mobileOpen ? <X size={18} /> : <Info size={18} />}
        </button>
      </div>
    </>
  )
}
