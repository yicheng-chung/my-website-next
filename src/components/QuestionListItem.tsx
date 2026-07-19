'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { QuestionEntry } from '@/lib/questions'
import QuestionCardContent from './QuestionCardContent'

interface QuestionListItemProps {
  question: QuestionEntry
  lang: 'zh' | 'en'
}

// Mobile counterpart to PlanetQuestion: a plain, non-draggable feed item
// instead of a free-floating star. Normal document flow already gives us
// the "expanding one card pushes the others down, closing it puts them
// back" behavior for free — `layout` just makes that reflow animate
// smoothly instead of jumping.
export default function QuestionListItem({ question, lang }: QuestionListItemProps) {
  const [expanded, setExpanded] = useState(false)
  const hasAnswer = Boolean(question.answer || question.answerEn)
  const title = (lang === 'en' && question.titleEn) || question.title

  const label = question.favorite
    ? `收藏的問題：${title}`
    : hasAnswer
    ? `已有答案的問題：${title}`
    : `還在探索的問題：${title}`

  const toggleExpanded = () => {
    if (!hasAnswer) return
    setExpanded((v) => !v)
  }

  return (
    <motion.div layout transition={{ layout: { duration: 0.3, ease: 'easeInOut' } }}>
      <motion.button
        type='button'
        onClick={toggleExpanded}
        aria-label={label}
        aria-expanded={hasAnswer ? expanded : undefined}
        className={`w-full rounded-2xl border border-white/10 bg-black/70 p-3 text-left shadow-lg ${
          hasAnswer ? 'cursor-pointer' : ''
        }`}
      >
        <QuestionCardContent question={question} lang={lang} expanded={expanded} compact />
      </motion.button>
    </motion.div>
  )
}
