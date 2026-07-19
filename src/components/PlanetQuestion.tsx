'use client'

import { useEffect, useRef, useState } from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from 'framer-motion'
import type { QuestionEntry } from '@/lib/questions'
import QuestionCardContent from './QuestionCardContent'
import QuestionStarGlyph from './QuestionStarGlyph'

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
  const hasAnswer = Boolean(question.answer || question.answerEn)

  // The little star marker that sits in front of the card — unrelated to the
  // card's own hover/expand state, this is the original starfield glyph.
  const baseSize = question.favorite ? 34 : hasAnswer ? 26 : 20
  const starSize = hovered ? baseSize * 1.25 : baseSize

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
          <QuestionStarGlyph
            size={starSize}
            hasAnswer={hasAnswer}
            favorite={question.favorite}
            hovered={hovered}
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
        <QuestionCardContent question={question} lang={lang} expanded={expanded} />
      </motion.button>
    </motion.div>
  )
}
