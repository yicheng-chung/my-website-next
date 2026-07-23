'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useLanguage } from '@/context/LanguageContext'
import {
  timelineEvents,
  formatEventShort,
  formatEventFull,
} from '@/lib/timelineEvents'
import { useIsDesktop } from '@/lib/useIsDesktop'

const NODE_WIDTH = 104
const DRAG_THRESHOLD = 5
const ARROW_SCROLL_AMOUNT = NODE_WIDTH * 3

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'
const DEFAULT_ZOOM = 4

export default function LifeTimeline() {
  const { lang } = useLanguage()
  const isDesktop = useIsDesktop()
  const [activeId, setActiveId] = useState<string | null>(
    timelineEvents[0]?.id ?? null
  )
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const stripRef = useRef<HTMLDivElement>(null)
  const dragState = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  })

  const activeEvent = timelineEvents.find((e) => e.id === activeId) ?? null

  useEffect(() => {
    if (!isDesktop || !mapContainerRef.current || mapRef.current) return

    const first = timelineEvents[0]
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center: first ? [first.location.lng, first.location.lat] : [0, 20],
      zoom: first?.location.zoom ?? DEFAULT_ZOOM,
      attributionControl: { compact: true },
    })
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [isDesktop])

  const handleSelect = (id: string) => {
    setActiveId(id)
    const event = timelineEvents.find((e) => e.id === id)
    if (event && mapRef.current) {
      mapRef.current.flyTo({
        center: [event.location.lng, event.location.lat],
        zoom: event.location.zoom ?? DEFAULT_ZOOM,
        essential: true,
        duration: 1800,
      })
    }
    nodeRefs.current[id]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }

  // Tracked via window listeners (not setPointerCapture) — capturing the pointer
  // on the strip element would swallow click events on the node buttons inside it.
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = stripRef.current
    if (!el) return
    dragState.current = {
      isDown: true,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
      moved: false,
    }

    const handleMove = (ev: PointerEvent) => {
      if (!dragState.current.isDown) return
      const dx = ev.clientX - dragState.current.startX
      if (Math.abs(dx) > DRAG_THRESHOLD) dragState.current.moved = true
      el.scrollLeft = dragState.current.scrollLeft - dx
    }

    const handleUp = () => {
      dragState.current.isDown = false
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  const scrollByArrow = (direction: 1 | -1) => {
    stripRef.current?.scrollBy({
      left: direction * ARROW_SCROLL_AMOUNT,
      behavior: 'smooth',
    })
  }

  return (
    <div className='mt-8'>
      <h2 className='mb-4 text-xl font-bold text-neutral-800 dark:text-neutral-100'>
        {lang === 'zh' ? '年代記事' : 'Timeline'}
      </h2>

      {isDesktop ? (
        <div className='relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-700'>
          <div ref={mapContainerRef} className='h-96 w-full' />

          <AnimatePresence mode='wait'>
            {activeEvent && (
              <motion.div
                key={activeEvent.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className='absolute left-4 right-4 top-4 max-w-sm rounded-xl border border-neutral-200 bg-white/95 p-4 shadow-lg backdrop-blur dark:border-neutral-700 dark:bg-neutral-800/95'
              >
                {activeEvent.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeEvent.image}
                    alt={activeEvent.title[lang]}
                    className='mb-3 h-32 w-full rounded-lg object-cover'
                  />
                )}
                <p className='text-xs font-semibold text-[#F2A341] dark:text-[#F6B45E]'>
                  {formatEventFull(activeEvent, lang)}
                </p>
                <p className='mt-1 text-sm font-bold text-neutral-800 dark:text-neutral-100'>
                  {activeEvent.title[lang]}
                </p>
                <p className='mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300'>
                  {activeEvent.description[lang]}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/95 via-white/80 to-transparent pt-14 pb-4 dark:from-neutral-900/95 dark:via-neutral-900/80'>
            <button
              type='button'
              aria-label={lang === 'zh' ? '往前' : 'Scroll left'}
              onClick={() => scrollByArrow(-1)}
              className='absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-600 shadow-sm transition-colors hover:bg-white dark:border-neutral-600 dark:bg-neutral-800/90 dark:text-neutral-300 dark:hover:bg-neutral-800'
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type='button'
              aria-label={lang === 'zh' ? '往後' : 'Scroll right'}
              onClick={() => scrollByArrow(1)}
              className='absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-600 shadow-sm transition-colors hover:bg-white dark:border-neutral-600 dark:bg-neutral-800/90 dark:text-neutral-300 dark:hover:bg-neutral-800'
            >
              <ChevronRight size={18} />
            </button>

            <div
              ref={stripRef}
              onPointerDown={handlePointerDown}
              className='hide-scrollbar snap-x snap-mandatory overflow-x-auto px-12 py-2 [-webkit-user-select:none] select-none [touch-action:pan-x]'
            >
              <div
                className='relative flex items-center'
                style={{ minWidth: timelineEvents.length * NODE_WIDTH }}
              >
                <div className='absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-neutral-300 dark:bg-neutral-600' />
                {timelineEvents.map((event) => {
                  const isActive = event.id === activeId
                  return (
                    <button
                      key={event.id}
                      ref={(el) => {
                        nodeRefs.current[event.id] = el
                      }}
                      type='button'
                      onClick={() => {
                        if (dragState.current.moved) return
                        handleSelect(event.id)
                      }}
                      className='group relative z-10 flex shrink-0 cursor-pointer snap-center flex-col items-center gap-0 py-2'
                      style={{ width: NODE_WIDTH }}
                    >
                      <MapPin
                        className={`-mb-1.5 shrink-0 transition-all ${
                          isActive
                            ? 'h-8 w-8 fill-[#F2A341] text-[#F2A341] dark:fill-[#F6B45E] dark:text-[#F6B45E]'
                            : 'h-6 w-6 fill-white text-neutral-400 group-hover:scale-110 group-hover:fill-[#F2A341]/20 group-hover:text-[#F2A341] dark:fill-neutral-800 dark:text-neutral-500 dark:group-hover:text-[#F6B45E]'
                        }`}
                        strokeWidth={2}
                      />
                      <span
                        className={`mt-1.5 whitespace-nowrap text-xs font-medium ${
                          isActive
                            ? 'text-sm font-bold text-neutral-800 dark:text-neutral-100'
                            : 'text-neutral-500 dark:text-neutral-400'
                        }`}
                      >
                        {formatEventShort(event)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className='flex flex-col gap-3'>
          {timelineEvents.map((event) => {
            const isOpen = event.id === activeId
            return (
              <div
                key={event.id}
                className='overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800'
              >
                <button
                  type='button'
                  onClick={() => setActiveId(isOpen ? null : event.id)}
                  className='flex w-full cursor-pointer items-center gap-3 p-4 text-left'
                >
                  <MapPin
                    className={`h-4 w-4 flex-shrink-0 ${
                      isOpen
                        ? 'fill-[#F2A341] text-[#F2A341] dark:fill-[#F6B45E] dark:text-[#F6B45E]'
                        : 'fill-neutral-300 text-neutral-400 dark:fill-neutral-600 dark:text-neutral-500'
                    }`}
                    strokeWidth={2}
                  />
                  <span className='text-sm font-bold text-neutral-800 dark:text-neutral-100'>
                    {formatEventFull(event, lang)} · {event.title[lang]}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className='overflow-hidden'
                    >
                      <div className='px-4 pb-4'>
                        {event.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={event.image}
                            alt={event.title[lang]}
                            className='mb-3 h-40 w-full rounded-lg object-cover'
                          />
                        )}
                        <p className='text-sm leading-relaxed text-neutral-600 dark:text-neutral-300'>
                          {event.description[lang]}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
