'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'
import { useIsDesktop } from '@/lib/useIsDesktop'
import type { QuestionEntry } from '@/lib/questions'
import { layoutStars, type StarPosition } from '@/lib/starfield'
import PlanetQuestion from '@/components/PlanetQuestion'
import QuestionListItem from '@/components/QuestionListItem'
import StarfieldGuide from '@/components/StarfieldGuide'
import StarLoading from '@/components/StarLoading'

// Fewer per region than the old bubble-card layout — each one is now a full
// tweet-style card (avatar, name, body, meta row), so packing 3 into a band
// left the collision-avoidance pass too much overlap to resolve reliably,
// especially right after a language switch reflows several cards at once.
const QUESTIONS_PER_REGION = 2
// Taller than the old bubble cards for the same reason.
const REGION_HEIGHT = 420
// Cards anchor at their star's y and grow downward — without this, a card
// seeded near the bottom of the last region can extend past the field's
// height and get clipped by its overflow-hidden edge.
const BOTTOM_PADDING = 220

// A star only gets a constellation line to its single nearest neighbor, and
// only if that neighbor is within this distance — keeps the sky sparse rather
// than a tangle of lines.
const MAX_LINE_DISTANCE = 260
const LINE_GAP = 16
// Roughly the center of the small drifting star marker that sits in front of
// each card — lines anchor there rather than at the card's top-left corner.
const ICON_CENTER_PX = 14

type Position = { x: number; y: number }
type Size = { width: number; height: number }

// Minimum gap left between two stars' bounding boxes after separation.
const COLLISION_PADDING = 14

// Pairwise AABB separation over a few passes — nudges overlapping stars apart
// along whichever axis has the smaller overlap, so a language switch (which
// changes each card's actual rendered size) can't leave two cards covering
// each other. Only returns entries for stars that actually needed to move.
function resolveCollisions(
  positions: Record<string, Position>,
  sizes: Record<string, Size>
): Record<string, Position> {
  const ids = Object.keys(positions).filter((id) => sizes[id])
  const corrections: Record<string, Position> = {}

  const box = (id: string) => {
    const pos = positions[id]
    const size = sizes[id]
    const corr = corrections[id] ?? { x: 0, y: 0 }
    return {
      x: pos.x + corr.x,
      y: pos.y + corr.y,
      w: size.width,
      h: size.height,
    }
  }

  // More passes than before — the tweet-style cards are much bigger than the
  // old bubbles, so a language switch reflowing several of them at once can
  // need more than a couple of rounds to fully untangle.
  for (let iter = 0; iter < 8; iter++) {
    let moved = false
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const idA = ids[i]
        const idB = ids[j]
        const a = box(idA)
        const b = box(idB)
        const overlapX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
        const overlapY = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)
        if (overlapX <= 0 || overlapY <= 0) continue

        moved = true
        const corrA = corrections[idA] ?? { x: 0, y: 0 }
        const corrB = corrections[idB] ?? { x: 0, y: 0 }
        if (overlapX < overlapY) {
          const push = overlapX / 2 + COLLISION_PADDING
          const dir = a.x <= b.x ? -1 : 1
          corrections[idA] = { x: corrA.x + dir * push, y: corrA.y }
          corrections[idB] = { x: corrB.x - dir * push, y: corrB.y }
        } else {
          const push = overlapY / 2 + COLLISION_PADDING
          const dir = a.y <= b.y ? -1 : 1
          corrections[idA] = { x: corrA.x, y: corrA.y + dir * push }
          corrections[idB] = { x: corrB.x, y: corrB.y - dir * push }
        }
      }
    }
    if (!moved) break
  }

  return corrections
}

// sessionStorage (not a module-level variable — Next.js can re-evaluate this
// module across client-side route transitions, which silently discarded a
// plain in-memory cache) so dragged positions survive navigating away and
// back. Cleared explicitly on an actual page reload via the Navigation Timing
// check below, since sessionStorage itself would otherwise survive that too.
const OFFSETS_KEY = 'questions-star-offsets'

function loadStoredOffsets(): Record<string, Position> {
  if (typeof window === 'undefined') return {}
  try {
    const nav = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined
    if (nav?.type === 'reload') {
      sessionStorage.removeItem(OFFSETS_KEY)
      return {}
    }
    const raw = sessionStorage.getItem(OFFSETS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveStoredOffsets(offsets: Record<string, Position>) {
  try {
    sessionStorage.setItem(OFFSETS_KEY, JSON.stringify(offsets))
  } catch {
    // ignore (private browsing, storage full, etc.)
  }
}

// Layered low-opacity blobs standing in for nebula clouds, plus fine star dust —
// self-contained CSS so there's no dependency on an external image asset.
const NEBULA = {
  backgroundImage: [
    'radial-gradient(600px 500px at 15% 10%, rgba(87,126,137,0.35), transparent 60%)',
    'radial-gradient(700px 600px at 85% 30%, rgba(111,159,156,0.28), transparent 60%)',
    'radial-gradient(650px 550px at 30% 80%, rgba(143,110,169,0.22), transparent 60%)',
    'radial-gradient(500px 500px at 75% 90%, rgba(155,184,194,0.25), transparent 60%)',
  ].join(', '),
  backgroundRepeat: 'no-repeat',
}

const FAR_DUST = {
  backgroundImage: [
    'radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.35), transparent)',
    'radial-gradient(1px 1px at 60% 70%, rgba(255,255,255,0.25), transparent)',
    'radial-gradient(1.5px 1.5px at 80% 10%, rgba(255,255,255,0.3), transparent)',
    'radial-gradient(1px 1px at 30% 85%, rgba(255,255,255,0.2), transparent)',
  ].join(', '),
  backgroundSize: '260px 260px',
  backgroundRepeat: 'repeat',
}

const NEAR_DUST = {
  backgroundImage: [
    'radial-gradient(2px 2px at 25% 40%, rgba(155,184,194,0.5), transparent)',
    'radial-gradient(1.5px 1.5px at 75% 60%, rgba(255,255,255,0.4), transparent)',
    'radial-gradient(2px 2px at 50% 15%, rgba(255,255,255,0.35), transparent)',
  ].join(', '),
  backgroundSize: '380px 380px',
  backgroundRepeat: 'repeat',
}

const TEXT = {
  zh: {
    title: '問題小宇宙',
    subtitle: '好多奇怪、習以為常，但又好想弄清楚的問題',
    intro:
      '平常我有好多在腦中那種一閃而過的問題，像流星一樣，大概會在五秒後忘記，但現在我很想要把這些倏忽即逝都保留下來。',
  },
  en: {
    title: 'The Universe of Questions',
    subtitle: `So many strange questions hidden in everyday life—things I've always taken for granted, yet can't stop wondering about.`,
    intro: `My mind is constantly filled with fleeting questions that flash by like shooting stars. Most of them disappear within five seconds, but now I want to hold on to those passing thoughts before they're gone.`,
  },
}

// Pixel margins for projecting a star's 0-100 xPercent onto the actual field
// width: a small gutter on the left, and room on the right for the star icon
// plus the tweet-style card that grows out from it (icon + gap + up to
// 360px card at rest — it widens further on expand, but that's not fed back
// into this layout, see expandedRef in PlanetQuestion). Capped as a fraction
// of the field itself so this doesn't eat the whole width on a narrow
// viewport.
const LEFT_MARGIN_PX = 16
const RIGHT_MARGIN_PX = 410

function computeBasePositions(
  starPositions: StarPosition[],
  fieldWidth: number
): Record<string, Position> {
  const map: Record<string, Position> = {}
  const rightMargin = Math.min(RIGHT_MARGIN_PX, fieldWidth * 0.4)
  const usableWidth = Math.max(fieldWidth - LEFT_MARGIN_PX - rightMargin, 0)
  starPositions.forEach((pos) => {
    const topPx =
      pos.regionIndex * REGION_HEIGHT + (pos.yPercent / 100) * REGION_HEIGHT
    const leftPx = LEFT_MARGIN_PX + (pos.xPercent / 100) * usableWidth
    map[pos.id] = { x: leftPx, y: topPx }
  })
  return map
}

export default function QuestionsPage() {
  const { lang } = useLanguage()
  const { forceDark, clearForceDark } = useTheme()
  const isDesktop = useIsDesktop()
  const t = TEXT[lang]
  const fieldRef = useRef<HTMLDivElement>(null)
  // null while the Notion-backed fetch is in flight.
  const [questions, setQuestions] = useState<QuestionEntry[] | null>(null)
  // The stars' original, non-dragged layout — stable unless the field is remeasured.
  const [basePositions, setBasePositions] = useState<Record<string, Position>>(
    {}
  )
  // Cumulative drag offset per star, mirrored up from each PlanetQuestion's own
  // Framer Motion drag transform (see the comment in that component for why).
  // Seeded from sessionStorage so drags survive leaving and returning to this page.
  const [offsets, setOffsets] = useState<Record<string, Position>>(() =>
    loadStoredOffsets()
  )
  // Bumping this tells every star to animate its own offset back to zero.
  const [resetSignal, setResetSignal] = useState(0)
  // Each star's actual rendered (collapsed) footprint, reported by itself —
  // needed because a language switch changes title/answer text length, which
  // this layout can't predict ahead of render. See resolveCollisions below.
  const [cardSizes, setCardSizes] = useState<Record<string, Size>>({})
  // Bumping this tells every star to glide to its (possibly just-corrected) offset.
  const [correctionSignal, setCorrectionSignal] = useState(0)

  // This page is an immersive space — force the whole site dark while it's open,
  // regardless of the light/dark toggle, and restore the prior state on leaving.
  useEffect(() => {
    forceDark()
    return () => clearForceDark()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch('/api/questions')
      .then((res) => res.json())
      .then((json: { questions: QuestionEntry[] }) => {
        if (!cancelled) setQuestions(json.questions ?? [])
      })
      .catch(() => {
        if (!cancelled) setQuestions([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const regionCount = questions
    ? Math.max(1, Math.ceil(questions.length / QUESTIONS_PER_REGION))
    : 1
  const fieldHeight = questions
    ? regionCount * REGION_HEIGHT + BOTTOM_PADDING
    : 480
  const starPositions = useMemo(
    () => (questions ? layoutStars(questions, QUESTIONS_PER_REGION, 42) : []),
    [questions]
  )

  // Measure before paint so stars don't flash at x:0 before spreading out.
  // Field width is stable regardless of loading state since the field container
  // always renders (the loading state overlays it rather than replacing it).
  useLayoutEffect(() => {
    if (!fieldRef.current || starPositions.length === 0) return
    setBasePositions(
      computeBasePositions(starPositions, fieldRef.current.clientWidth)
    )
  }, [starPositions])

  const resetPositions = () => {
    saveStoredOffsets({})
    setOffsets({})
    setResetSignal((s) => s + 1)
  }

  const handlePositionChange = (
    id: string,
    offsetX: number,
    offsetY: number
  ) => {
    setOffsets((prev) => {
      const next = { ...prev, [id]: { x: offsetX, y: offsetY } }
      saveStoredOffsets(next)
      return next
    })
  }

  const handleSizeChange = (id: string, size: Size) => {
    setCardSizes((prev) => {
      const existing = prev[id]
      // Ignore sub-pixel ResizeObserver noise so this doesn't churn every frame.
      if (
        existing &&
        Math.abs(existing.width - size.width) < 1 &&
        Math.abs(existing.height - size.height) < 1
      ) {
        return prev
      }
      return { ...prev, [id]: size }
    })
  }

  const positions = useMemo(() => {
    const map: Record<string, Position> = {}
    Object.entries(basePositions).forEach(([id, base]) => {
      const offset = offsets[id] ?? { x: 0, y: 0 }
      map[id] = { x: base.x + offset.x, y: base.y + offset.y }
    })
    return map
  }, [basePositions, offsets])

  // Whenever a star's actual size changes (a language switch reflowing its
  // text, most notably) or positions reset to their seed, re-check for
  // overlaps and nudge apart whatever's colliding. Debounced so a burst of
  // resize reports (many stars mounting, or a whole-page language switch)
  // settles before the pass runs, rather than firing once per star. `lang`
  // is also a trigger on its own — if a switch happens to leave every
  // card's measured size unchanged (same line count in both languages),
  // there'd otherwise be no cardSizes update to hang this pass off of.
  useEffect(() => {
    if (Object.keys(cardSizes).length === 0) return
    const timer = setTimeout(() => {
      const corrections = resolveCollisions(positions, cardSizes)
      if (Object.keys(corrections).length === 0) return
      setOffsets((prev) => {
        const next = { ...prev }
        Object.entries(corrections).forEach(([id, delta]) => {
          const cur = next[id] ?? { x: 0, y: 0 }
          next[id] = { x: cur.x + delta.x, y: cur.y + delta.y }
        })
        saveStoredOffsets(next)
        return next
      })
      setCorrectionSignal((s) => s + 1)
    }, 400)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardSizes, resetSignal, lang])

  // Each star connects to its single nearest neighbor, "constellation" style,
  // recomputed whenever a star is dragged to a new spot.
  const lines = useMemo(() => {
    const ids = Object.keys(positions)
    const seen = new Set<string>()
    const result: {
      key: string
      x1: number
      y1: number
      x2: number
      y2: number
    }[] = []

    ids.forEach((id) => {
      const p = positions[id]
      let nearestId: string | null = null
      let nearestDist = Infinity
      ids.forEach((otherId) => {
        if (otherId === id) return
        const q = positions[otherId]
        const d = Math.hypot(p.x - q.x, p.y - q.y)
        if (d < nearestDist) {
          nearestDist = d
          nearestId = otherId
        }
      })
      if (nearestId && nearestDist <= MAX_LINE_DISTANCE) {
        const key = [id, nearestId].sort().join('~')
        if (seen.has(key)) return
        seen.add(key)
        const q = positions[nearestId]
        const dx = q.x - p.x
        const dy = q.y - p.y
        const dist = Math.hypot(dx, dy) || 1
        const ux = dx / dist
        const uy = dy / dist
        result.push({
          key,
          x1: p.x + ICON_CENTER_PX + ux * LINE_GAP,
          y1: p.y + ICON_CENTER_PX + uy * LINE_GAP,
          x2: q.x + ICON_CENTER_PX - ux * LINE_GAP,
          y2: q.y + ICON_CENTER_PX - uy * LINE_GAP,
        })
      }
    })

    return result
  }, [positions])

  // On mobile the field div (and its ref) never renders at all — passing a
  // ref that's defined but permanently un-hydrated throws at runtime, so the
  // scroll target is only wired up in desktop mode. The resulting
  // scrollYProgress is unused on mobile anyway (no parallax there).
  const { scrollYProgress } = useScroll({
    target: isDesktop ? fieldRef : undefined,
    offset: ['start start', 'end end'],
  })
  const nebulaY = useTransform(
    scrollYProgress,
    (v) => `${v * fieldHeight * 0.08}px`
  )
  const farY = useTransform(
    scrollYProgress,
    (v) => `${v * fieldHeight * 0.15}px`
  )
  const nearY = useTransform(
    scrollYProgress,
    (v) => `${v * fieldHeight * 0.32}px`
  )

  const answeredCount = (questions ?? []).filter(
    (q) => q.answer || q.answerEn
  ).length

  return (
    <div className='flex flex-col gap-6 sm:gap-8'>
      <div className='rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 dark:border-neutral-700 dark:bg-neutral-800'>
        <h1 className='text-2xl font-bold text-[#577E89] sm:text-3xl dark:text-[#9BB8C2]'>
          {t.title}
        </h1>
        <p className='mt-1 text-sm text-neutral-500 dark:text-neutral-400'>
          {t.subtitle}
        </p>
        <p className='mt-4 text-base leading-relaxed sm:text-lg'>{t.intro}</p>
      </div>

      {isDesktop ? (
        <div
          ref={fieldRef}
          className='relative overflow-hidden rounded-2xl border border-white/10 bg-[#05080a]'
          style={{ height: fieldHeight }}
        >
          <motion.div
            aria-hidden
            className='pointer-events-none absolute inset-0'
            style={{ ...NEBULA, backgroundPositionY: nebulaY }}
          />
          <motion.div
            aria-hidden
            className='pointer-events-none absolute inset-0'
            style={{ ...FAR_DUST, backgroundPositionY: farY }}
          />
          <motion.div
            aria-hidden
            className='pointer-events-none absolute inset-0'
            style={{ ...NEAR_DUST, backgroundPositionY: nearY }}
          />

          {questions === null ? (
            <div className='absolute inset-0 flex items-center justify-center'>
              <StarLoading lang={lang} />
            </div>
          ) : (
            <>
              <svg
                aria-hidden
                className='pointer-events-none absolute inset-0 h-full w-full'
              >
                {lines.map((line) => (
                  <line
                    key={line.key}
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke='rgba(155,184,194,0.35)'
                    strokeWidth={1}
                    strokeDasharray='2 5'
                    strokeLinecap='round'
                  />
                ))}
              </svg>

              <div className='absolute inset-0'>
                {starPositions.map((pos, index) => {
                  const question = questions.find((q) => q.id === pos.id)
                  const base = basePositions[pos.id]
                  if (!question || !base) return null
                  const seed = offsets[pos.id] ?? { x: 0, y: 0 }
                  return (
                    <PlanetQuestion
                      key={pos.id}
                      question={question}
                      x={base.x}
                      y={base.y}
                      index={index}
                      lang={lang}
                      initialOffsetX={seed.x}
                      initialOffsetY={seed.y}
                      resetSignal={resetSignal}
                      correctionSignal={correctionSignal}
                      onPositionChange={handlePositionChange}
                      onSizeChange={handleSizeChange}
                    />
                  )
                })}
              </div>
            </>
          )}
        </div>
      ) : (
        // Mobile: a plain, non-draggable feed — no absolute positioning, no
        // collision avoidance needed, since normal document flow already
        // pushes cards apart (and back) as one expands or collapses.
        <div className='relative overflow-hidden rounded-2xl border border-white/10 bg-[#05080a] p-3'>
          <div aria-hidden className='pointer-events-none absolute inset-0' style={NEBULA} />
          <div aria-hidden className='pointer-events-none absolute inset-0' style={FAR_DUST} />
          <div aria-hidden className='pointer-events-none absolute inset-0' style={NEAR_DUST} />

          {questions === null ? (
            <div className='relative flex min-h-[320px] items-center justify-center'>
              <StarLoading lang={lang} />
            </div>
          ) : (
            <div className='relative flex flex-col gap-3'>
              {questions.map((question) => (
                <QuestionListItem key={question.id} question={question} lang={lang} />
              ))}
            </div>
          )}
        </div>
      )}

      <StarfieldGuide
        total={(questions ?? []).length}
        answered={answeredCount}
        exploring={(questions ?? []).length - answeredCount}
        lang={lang}
        onReset={resetPositions}
      />
    </div>
  )
}
