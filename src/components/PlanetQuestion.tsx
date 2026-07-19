'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from 'framer-motion'
import { BadgeCheck, Heart, MessageCircle, Repeat2, Share2, Sparkle } from 'lucide-react'
import { useTranslations } from '@/lib/useTranslations'
import common from '@/content/common.json'
import type { QuestionEntry } from '@/lib/questions'

// Decorative — not a registered account, just the "poster" for every card
// on this page (it's all one person's questions).
const HANDLE = '@yicheng_chung'
const TWITTER_BLUE = '#1d9bf0'
const GLOW_COLOR = '155,184,194' // matches the site's dark-mode accent, #9BB8C2
const GLOW_HEX = '#9BB8C2'
const QUIET_HEX = '#5b5f63'

const TEXT = {
  zh: { thoughts: '想法', answer: '答案', via: '問題宇宙' },
  en: { thoughts: 'Thoughts', answer: 'Answer', via: 'Universe of Questions' },
}

interface PlanetQuestionProps {
  question: QuestionEntry
  x: number
  y: number
  index: number
  lang: 'zh' | 'en'
  initialOffsetX: number
  initialOffsetY: number
  resetSignal: number
  correctionSignal: number
  onPositionChange: (id: string, offsetX: number, offsetY: number) => void
  onSizeChange: (id: string, size: { width: number; height: number }) => void
}

function formatDate(date: string | undefined, lang: 'zh' | 'en') {
  if (!date) return null
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return null
  return lang === 'zh'
    ? `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
    : d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
}

export default function PlanetQuestion({
  question,
  x,
  y,
  index,
  lang,
  initialOffsetX,
  initialOffsetY,
  resetSignal,
  correctionSignal,
  onPositionChange,
  onSizeChange,
}: PlanetQuestionProps) {
  const reduceMotion = useReducedMotion()
  const [expanded, setExpanded] = useState(false)
  const [hovered, setHovered] = useState(false)
  const t = TEXT[lang]
  const profile = useTranslations(common).profile

  // Seeded from the previous session's offset (if any) so a star's dragged
  // position survives navigating away and back — see the page-level cache.
  const dragX = useMotionValue(initialOffsetX)
  const dragY = useMotionValue(initialOffsetY)
  const isFirstReset = useRef(true)
  const isFirstCorrection = useRef(true)
  const wrapperRef = useRef<HTMLDivElement>(null)
  // Guards the resize observer against the answer panel's own expand/collapse
  // animation — only the collapsed, resting size should ever feed into the
  // collision-avoidance pass below, otherwise opening a card would nudge its
  // neighbors as a side effect.
  const expandedRef = useRef(false)

  const title = (lang === 'en' && question.titleEn) || question.title
  const thoughts =
    (lang === 'en' ? question.thoughtsEn : question.thoughts) ??
    question.thoughts
  const answer =
    (lang === 'en' ? question.answerEn : question.answer) ?? question.answer

  const hasAnswer = Boolean(question.answer || question.answerEn)
  const dateLabel = formatDate(question.date, lang)

  // The little star marker that sits in front of the card — unrelated to the
  // card's own hover/expand state, this is the original starfield glyph.
  const baseSize = question.favorite ? 34 : hasAnswer ? 26 : 20
  const starSize = hovered ? baseSize * 1.25 : baseSize
  const starColor = hasAnswer ? GLOW_HEX : QUIET_HEX
  const glowAlpha = hasAnswer
    ? hovered
      ? question.favorite
        ? 0.9
        : 0.75
      : question.favorite
      ? 0.6
      : 0.45
    : 0
  const glowSpread = question.favorite ? 12 : 8
  const starFilter = hasAnswer
    ? `drop-shadow(0 0 ${glowSpread}px rgba(${GLOW_COLOR},${glowAlpha})) drop-shadow(0 0 ${
        hovered ? glowSpread * 2 : glowSpread
      }px rgba(${GLOW_COLOR},${glowAlpha * 0.6}))`
    : 'none'

  const driftDuration = 9 + (index % 5)
  const driftX = 5 + (index % 4) * 2
  const driftY = 4 + (index % 3) * 2

  const label = question.favorite
    ? `收藏的問題：${title}`
    : hasAnswer
    ? `已有答案的問題：${title}`
    : `還在探索的問題：${title}`

  const toggleExpanded = () => {
    if (!hasAnswer) return
    setExpanded((v) => {
      const next = !v
      expandedRef.current = next
      return next
    })
  }

  // Reports this star's actual rendered footprint (collapsed) so the parent
  // can detect and resolve overlaps it can't predict from text length alone
  // — e.g. a language switch changing how many lines the title wraps to.
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      if (expandedRef.current) return
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      onSizeChange(question.id, { width, height })
    })
    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // dragX/dragY are left alone after the drag — Framer Motion's drag transform
  // persists and naturally accumulates across multiple drags on its own. We
  // just mirror the current total offset up to the parent (for the
  // constellation-line math and the cross-navigation cache); the parent never
  // re-drives x/y from this.
  const handleDragEnd = () => {
    onPositionChange(question.id, dragX.get(), dragY.get())
  }

  // "Reset" glides this star's own offset back to zero instead of snapping —
  // triggered by the parent bumping resetSignal (skip the very first render).
  useEffect(() => {
    if (isFirstReset.current) {
      isFirstReset.current = false
      return
    }
    const controlsX = animate(dragX, 0, { duration: 0.6, ease: 'easeInOut' })
    const controlsY = animate(dragY, 0, { duration: 0.6, ease: 'easeInOut' })
    onPositionChange(question.id, 0, 0)
    return () => {
      controlsX.stop()
      controlsY.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal])

  // Collision avoidance nudges this star's offset in the parent (see
  // resolveCollisions in the page) — glide there instead of snapping,
  // mirroring the reset animation above (skip the very first render).
  useEffect(() => {
    if (isFirstCorrection.current) {
      isFirstCorrection.current = false
      return
    }
    const controlsX = animate(dragX, initialOffsetX, {
      duration: 0.5,
      ease: 'easeInOut',
    })
    const controlsY = animate(dragY, initialOffsetY, {
      duration: 0.5,
      ease: 'easeInOut',
    })
    return () => {
      controlsX.stop()
      controlsY.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correctionSignal])

  return (
    <motion.div
      ref={wrapperRef}
      drag
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, scale: 0.7 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className='absolute flex max-w-[92vw] cursor-grab items-start gap-2.5 active:cursor-grabbing'
      style={{ left: x, top: y, x: dragX, y: dragY, zIndex: expanded ? 40 : 1 }}
    >
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : { x: [0, driftX, 0, -driftX, 0], y: [0, -driftY, 0, driftY, 0] }
        }
        transition={
          reduceMotion
            ? undefined
            : { duration: driftDuration, repeat: Infinity, ease: 'easeInOut' }
        }
        className='mt-1 flex-shrink-0'
      >
        <motion.button
          type='button'
          onTap={toggleExpanded}
          aria-label={label}
          aria-expanded={hasAnswer ? expanded : undefined}
          animate={{ width: starSize, height: starSize }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`flex items-center justify-center rounded-full outline-none ${
            hasAnswer ? 'cursor-pointer' : 'cursor-grab'
          }`}
        >
          <Sparkle
            width='100%'
            height='100%'
            fill={starColor}
            stroke={starColor}
            strokeWidth={1}
            style={{ filter: starFilter }}
          />
        </motion.button>
      </motion.div>

      <motion.button
        type='button'
        onTap={toggleExpanded}
        aria-label={label}
        aria-expanded={hasAnswer ? expanded : undefined}
        animate={{ width: expanded ? 500 : 360 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`max-w-[88vw] rounded-2xl border border-white/10 bg-black/70 p-4 text-left shadow-lg backdrop-blur-sm transition-colors duration-200 hover:bg-white/[0.04] ${
          hasAnswer ? 'cursor-pointer' : 'cursor-grab'
        }`}
      >
        <div className='flex items-start gap-3'>
          <Image
            src='/images/yc.jpg'
            alt=''
            width={40}
            height={40}
            className='h-10 w-10 flex-shrink-0 rounded-full border border-white/10 object-cover'
          />
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-1 text-[15px] leading-tight'>
              <span className='font-bold text-neutral-100'>{profile.name}</span>
              <BadgeCheck
                size={15}
                fill={TWITTER_BLUE}
                stroke='#fff'
                strokeWidth={1.5}
                className='flex-shrink-0'
              />
            </div>
            <p className='text-[13px] leading-tight text-neutral-500'>{HANDLE}</p>

            <p className='mt-2.5 text-[15px] leading-relaxed break-words text-neutral-100'>
              {title}
            </p>

            <p className='mt-2.5 text-xs text-neutral-500'>
              {dateLabel ? `${dateLabel} · ` : ''}
              {t.via}
            </p>

            {expanded && hasAnswer && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className='mt-4 space-y-4 border-t border-white/10 pt-4'
              >
                {thoughts && (
                  <div className='flex gap-3'>
                    <div className='flex w-10 flex-shrink-0 flex-col items-center'>
                      <div className='w-px flex-1 bg-white/10' />
                    </div>
                    <div className='min-w-0 flex-1 pb-1'>
                      <p className='text-[11px] font-semibold tracking-wide text-[#9BB8C2] uppercase'>
                        {t.thoughts}
                      </p>
                      <p className='mt-1.5 text-[15px] leading-relaxed text-neutral-300'>
                        {thoughts}
                      </p>
                    </div>
                  </div>
                )}

                <div className='flex gap-3'>
                  <Image
                    src='/images/yc.jpg'
                    alt=''
                    width={36}
                    height={36}
                    className='h-9 w-9 flex-shrink-0 rounded-full border border-white/10 object-cover'
                  />
                  <div className='min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3'>
                    <div className='flex items-center gap-1 text-xs'>
                      <span className='font-bold text-neutral-100'>{profile.name}</span>
                      <BadgeCheck size={12} fill={TWITTER_BLUE} stroke='#fff' strokeWidth={1.5} />
                      <span className='text-neutral-500'>{HANDLE}</span>
                    </div>
                    <p className='mt-2 text-[11px] font-semibold tracking-wide text-[#9BB8C2] uppercase'>
                      {t.answer}
                    </p>
                    <p className='mt-1.5 text-[15px] leading-relaxed text-neutral-100'>{answer}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className='mt-3 flex items-center gap-5 text-neutral-500'>
              <MessageCircle
                size={16}
                className={thoughts ? 'text-[#9BB8C2]' : ''}
              />
              <Repeat2
                size={16}
                className={question.favorite ? 'text-amber-400' : ''}
              />
              <Heart
                size={16}
                fill={hasAnswer ? '#f91880' : 'none'}
                className={hasAnswer ? 'text-[#f91880]' : ''}
              />
              <Share2 size={15} />
            </div>
          </div>
        </div>
      </motion.button>
    </motion.div>
  )
}
