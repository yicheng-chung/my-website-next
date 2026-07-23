'use client'

import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { BadgeCheck, Heart, MessageCircle, Repeat2, Share2 } from 'lucide-react'
import { useTranslations } from '@/lib/useTranslations'
import common from '@/content/common.json'
import type { QuestionEntry } from '@/lib/questions'
import QuestionStarGlyph from './QuestionStarGlyph'

// Decorative — not a registered account, just the "poster" for every card
// on this page (it's all one person's questions).
const HANDLE = '@yicheng_chung'
const TWITTER_BLUE = '#1d9bf0'

const TEXT = {
  zh: { via: '問題宇宙' },
  en: { via: 'Universe of Questions' },
}

interface QuestionCardContentProps {
  question: QuestionEntry
  lang: 'zh' | 'en'
  expanded: boolean
  // Smaller avatars/text for the mobile list, where cards sit in a narrow
  // single column instead of floating loosely in open space. Also shows a
  // starfield glyph badge in the card's top-right corner — PlanetQuestion
  // already renders its own separate floating star next to the card on
  // desktop, so it isn't needed there too.
  compact?: boolean
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

export default function QuestionCardContent({
  question,
  lang,
  expanded,
  compact = false,
}: QuestionCardContentProps) {
  const t = TEXT[lang]
  const profile = useTranslations(common).profile

  const title = (lang === 'en' && question.titleEn) || question.title
  const answer =
    (lang === 'en' ? question.answerEn : question.answer) ?? question.answer
  const hasAnswer = Boolean(question.answer || question.answerEn)
  const dateLabel = formatDate(question.date, lang)

  const avatarSize = compact ? 32 : 40
  const replyAvatarSize = compact ? 28 : 36
  const titleTextClass = compact ? 'text-sm' : 'text-[15px]'
  const nameTextClass = compact ? 'text-sm' : 'text-[15px]'
  const handleTextClass = compact ? 'text-xs' : 'text-[13px]'
  const iconSize = compact ? 14 : 16

  const header = (
    <div className='min-w-0'>
      <div className={`flex items-center gap-1 leading-tight ${nameTextClass}`}>
        <span className='font-bold text-neutral-100'>{profile.name}</span>
        <BadgeCheck
          size={compact ? 13 : 15}
          fill={TWITTER_BLUE}
          stroke='#fff'
          strokeWidth={1.5}
          className='flex-shrink-0'
        />
      </div>
      <p className={`leading-tight text-neutral-500 ${handleTextClass}`}>{HANDLE}</p>
    </div>
  )

  const body = (
    <>
      <p className={`mt-2 leading-relaxed break-words text-neutral-100 ${titleTextClass}`}>
        {title}
      </p>

      <p className='mt-2 text-xs text-neutral-500'>
        {dateLabel ? `${dateLabel} · ` : ''}
        {t.via}
      </p>

      {/* Icon row stays put right under the meta line regardless of expand
          state — it's part of the main post, not something that should
          drift down below the reply once that appears. */}
      <div className='mt-3 flex items-center gap-5 text-neutral-500'>
        {/* The reply count is real (mirrors whether this question has an
            answer) — the other three icons are still decorative, except
            the heart, which reflects the actual "favorite" flag. Retweet
            is meant to eventually share to other platforms for real. */}
        <div className={`flex items-center gap-1 ${hasAnswer ? 'text-[#F6B45E]' : ''}`}>
          <MessageCircle size={iconSize} />
          {hasAnswer && <span className='text-xs'>1</span>}
        </div>
        <Repeat2 size={iconSize} />
        <Heart
          size={iconSize}
          fill={question.favorite ? '#f91880' : 'none'}
          className={question.favorite ? 'text-[#f91880]' : ''}
        />
        <Share2 size={iconSize - 1} />
      </div>

      <AnimatePresence initial={false}>
        {expanded && hasAnswer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className='overflow-hidden'
          >
            <div className='mt-4 flex gap-3 border-t border-white/10 pt-4'>
              <Image
                src='/images/yc.jpg'
                alt=''
                width={replyAvatarSize}
                height={replyAvatarSize}
                className='flex-shrink-0 rounded-full border border-white/10 object-cover'
                style={{ width: replyAvatarSize, height: replyAvatarSize }}
              />
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-1 text-xs'>
                  <span className='font-bold text-neutral-100'>{profile.name}</span>
                  <BadgeCheck size={12} fill={TWITTER_BLUE} stroke='#fff' strokeWidth={1.5} />
                  <span className='text-neutral-500'>{HANDLE}</span>
                </div>
                <p className='mt-1 text-sm leading-relaxed text-neutral-100'>{answer}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )

  // Real-Twitter layout: avatar + name/handle on their own row, body text
  // spans the full card width below it instead of being indented next to
  // the avatar — indenting it left barely any room for the question text
  // itself once the card was narrow (mobile) or the avatar sizable (desktop).
  return (
    <div className='relative'>
      {compact && (
        <div className='absolute top-0 right-0'>
          <QuestionStarGlyph size={16} hasAnswer={hasAnswer} favorite={question.favorite} />
        </div>
      )}
      <div className='flex items-center gap-2.5'>
        <Image
          src='/images/yc.jpg'
          alt=''
          width={avatarSize}
          height={avatarSize}
          className='flex-shrink-0 rounded-full border border-white/10 object-cover'
          style={{ width: avatarSize, height: avatarSize }}
        />
        {header}
      </div>
      {body}
    </div>
  )
}
