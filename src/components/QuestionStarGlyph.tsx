'use client'

import { Sparkle } from 'lucide-react'

const GLOW_COLOR = '246,180,94' // matches the site's dark-mode accent, #F6B45E
const GLOW_HEX = '#F6B45E'
const QUIET_HEX = '#5b5f63'

interface QuestionStarGlyphProps {
  size: number
  hasAnswer: boolean
  favorite?: boolean
  hovered?: boolean
}

// The small glowing marker that sits in front of every question card —
// shared between the desktop starfield (PlanetQuestion) and the mobile list
// (QuestionListItem) so both draw from the same visual language.
export default function QuestionStarGlyph({
  size,
  hasAnswer,
  favorite,
  hovered,
}: QuestionStarGlyphProps) {
  const color = hasAnswer ? GLOW_HEX : QUIET_HEX
  const glowAlpha = hasAnswer
    ? hovered
      ? favorite
        ? 0.9
        : 0.75
      : favorite
      ? 0.6
      : 0.45
    : 0
  const glowSpread = favorite ? 12 : 8
  const filter = hasAnswer
    ? `drop-shadow(0 0 ${glowSpread}px rgba(${GLOW_COLOR},${glowAlpha})) drop-shadow(0 0 ${
        hovered ? glowSpread * 2 : glowSpread
      }px rgba(${GLOW_COLOR},${glowAlpha * 0.6}))`
    : 'none'

  return (
    <Sparkle
      width={size}
      height={size}
      fill={color}
      stroke={color}
      strokeWidth={1}
      style={{ filter, flexShrink: 0 }}
    />
  )
}
