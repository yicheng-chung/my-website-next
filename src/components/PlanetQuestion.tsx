'use client'

import { useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from 'framer-motion'
import { Sparkle } from 'lucide-react'
import type { QuestionEntry } from '@/lib/questions'

const GLOW_COLOR = '155,184,194' // matches the site's dark-mode accent, #9BB8C2
const GLOW_HEX = '#9BB8C2'
const QUIET_HEX = '#5b5f63'

const TEXT = {
  zh: { thoughts: '想法', answer: '答案', unknown: '我目前還不知道。' },
  en: { thoughts: 'Thoughts', answer: 'Answer', unknown: "I don't know yet." },
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
  onPositionChange: (id: string, offsetX: number, offsetY: number) => void
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
  onPositionChange,
}: PlanetQuestionProps) {
  const reduceMotion = useReducedMotion()
  const [expanded, setExpanded] = useState(false)
  const [hovered, setHovered] = useState(false)
  const t = TEXT[lang]

  // Seeded from the previous session's offset (if any) so a star's dragged
  // position survives navigating away and back — see the page-level cache.
  const dragX = useMotionValue(initialOffsetX)
  const dragY = useMotionValue(initialOffsetY)
  const isFirstReset = useRef(true)

  const title = (lang === 'en' && question.titleEn) || question.title
  const thoughts = (lang === 'en' ? question.thoughtsEn : question.thoughts) ?? question.thoughts
  const answer = (lang === 'en' ? question.answerEn : question.answer) ?? question.answer

  const hasAnswer = Boolean(question.answer || question.answerEn)
  const baseSize = question.favorite ? 34 : hasAnswer ? 26 : 20
  const size = hovered ? baseSize * 1.25 : baseSize
  const color = hasAnswer ? GLOW_HEX : QUIET_HEX

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
  const filter = hasAnswer
    ? `drop-shadow(0 0 ${glowSpread}px rgba(${GLOW_COLOR},${glowAlpha})) drop-shadow(0 0 ${
        hovered ? glowSpread * 2 : glowSpread
      }px rgba(${GLOW_COLOR},${glowAlpha * 0.6}))`
    : 'none'

  const driftDuration = 7 + (index % 5)
  const driftX = 6 + (index % 4) * 2
  const driftY = 5 + (index % 3) * 2

  const label = question.favorite
    ? `收藏的問題：${title}`
    : hasAnswer
    ? `已有答案的問題：${title}`
    : `還在探索的問題：${title}`

  const toggleExpanded = () => {
    if (!hasAnswer) return
    setExpanded((v) => !v)
  }

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

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, scale: 0.7 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className='absolute flex max-w-[min(65vw,260px)] cursor-grab items-start gap-3 active:cursor-grabbing'
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
        className='flex-shrink-0'
      >
        <motion.button
          type='button'
          onTap={toggleExpanded}
          aria-label={label}
          aria-expanded={hasAnswer ? expanded : undefined}
          animate={{ width: size, height: size }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`flex items-center justify-center rounded-full outline-none ${
            hasAnswer ? 'cursor-pointer' : 'cursor-grab'
          }`}
        >
          <Sparkle
            width='100%'
            height='100%'
            fill={color}
            stroke={color}
            strokeWidth={1}
            style={{ filter }}
          />
        </motion.button>
      </motion.div>

      <div
        className={`mt-1 min-w-[130px] rounded-xl border px-3 py-2 backdrop-blur-sm transition-colors duration-200 ${
          hovered ? 'border-white/25 bg-white/10' : 'border-white/10 bg-white/5'
        } ${expanded ? 'bg-[#0d1416]/95' : ''}`}
      >
        <motion.button
          type='button'
          onTap={toggleExpanded}
          className={`text-left text-sm leading-snug font-medium text-neutral-100 ${
            hasAnswer ? 'cursor-pointer' : 'cursor-grab'
          }`}
        >
          {title}
        </motion.button>

        <AnimatePresence initial={false}>
          {expanded && hasAnswer && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className='overflow-hidden'
            >
              <div className='mt-2 border-t border-white/10 pt-2'>
                {thoughts && (
                  <>
                    <p className='mt-2 text-[10px] tracking-wide text-[#9BB8C2] uppercase'>
                      {t.thoughts}
                    </p>
                    <p className='mt-1 text-xs leading-relaxed text-neutral-300'>
                      {thoughts}
                    </p>
                  </>
                )}
                <p className='mt-2 text-[10px] tracking-wide text-[#9BB8C2] uppercase'>
                  {t.answer}
                </p>
                <p className='mt-1 text-xs leading-relaxed text-neutral-200'>
                  {answer}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
