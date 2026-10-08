'use client'

import { useLanguage } from '@/context/LanguageContext'

// The site's loading state (per yicheng): shimmering outlines in the shape
// of what's about to appear, and no visible text — every page and widget
// builds its own outline out of these. (Questions keeps its own twinkling
// stars + line, also per yicheng.) The sweep/colors live in globals.css
// (.skeleton).

// One placeholder block; size/shape/color come from className.
export function Bone({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`skeleton ${className}`} />
}

const LABEL = { zh: '載入中', en: 'Loading' }

// Wraps a skeleton so screen readers hear "loading" — the only text, and
// it isn't visible.
export function SkeletonStatus({
  className = '',
  style,
  children,
}: {
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}) {
  const { lang } = useLanguage()
  return (
    <div role='status' aria-label={LABEL[lang]} className={className} style={style}>
      {children}
    </div>
  )
}
