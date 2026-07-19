'use client'

import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { BadgeCheck, Heart, MessageCircle, Repeat2, Share2 } from 'lucide-react'
import { useTranslations } from '@/lib/useTranslations'
import common from '@/content/common.json'
import type { QuestionEntry } from '@/lib/questions'

// Decorative — not a registered account, just the "poster" for every card
// on this page (it's all one person's questions).
const HANDLE = '@yicheng_chung'
const TWITTER_BLUE = '#1d9bf0'

const TEXT = {
  zh: { thoughts: '想法', answer: '答案', via: '問題宇宙' },
  en: { thoughts: 'Thoughts', answer: 'Answer', via: 'Universe of Questions' },
}

interface QuestionCardContentProps {
  question: QuestionEntry
  lang: 'zh' | 'en'
  expanded: boolean
  // Smaller avatars/text/padding for the mobile list, where cards sit in a
  // narrow single column instead of floating loosely in open space.
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
  const thoughts =
    (lang === 'en' ? question.thoughtsEn : question.thoughts) ??
    question.thoughts
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

  return (
    <div className='flex items-start gap-3'>
      <Image
        src='/images/yc.jpg'
        alt=''
        width={avatarSize}
        height={avatarSize}
        className='flex-shrink-0 rounded-full border border-white/10 object-cover'
        style={{ width: avatarSize, height: avatarSize }}
      />
      <div className='min-w-0 flex-1'>
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

        <p className={`mt-2 leading-relaxed break-words text-neutral-100 ${titleTextClass}`}>
          {title}
        </p>

        <p className='mt-2 text-xs text-neutral-500'>
          {dateLabel ? `${dateLabel} · ` : ''}
          {t.via}
        </p>

        <AnimatePresence initial={false}>
          {expanded && hasAnswer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className='overflow-hidden'
            >
              <div className='mt-4 space-y-4 border-t border-white/10 pt-4'>
                {thoughts && (
                  <div className='flex gap-3'>
                    <div className='flex w-9 flex-shrink-0 flex-col items-center'>
                      <div className='w-px flex-1 bg-white/10' />
                    </div>
                    <div className='min-w-0 flex-1 pb-1'>
                      <p className='text-[11px] font-semibold tracking-wide text-[#9BB8C2] uppercase'>
                        {t.thoughts}
                      </p>
                      <p className='mt-1.5 text-sm leading-relaxed text-neutral-300'>
                        {thoughts}
                      </p>
                    </div>
                  </div>
                )}

                <div className='flex gap-3'>
                  <Image
                    src='/images/yc.jpg'
                    alt=''
                    width={replyAvatarSize}
                    height={replyAvatarSize}
                    className='flex-shrink-0 rounded-full border border-white/10 object-cover'
                    style={{ width: replyAvatarSize, height: replyAvatarSize }}
                  />
                  <div className='min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5'>
                    <div className='flex items-center gap-1 text-xs'>
                      <span className='font-bold text-neutral-100'>{profile.name}</span>
                      <BadgeCheck size={12} fill={TWITTER_BLUE} stroke='#fff' strokeWidth={1.5} />
                      <span className='text-neutral-500'>{HANDLE}</span>
                    </div>
                    <p className='mt-1.5 text-[11px] font-semibold tracking-wide text-[#9BB8C2] uppercase'>
                      {t.answer}
                    </p>
                    <p className='mt-1 text-sm leading-relaxed text-neutral-100'>{answer}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className='mt-3 flex items-center gap-5 text-neutral-500'>
          <MessageCircle size={iconSize} className={thoughts ? 'text-[#9BB8C2]' : ''} />
          <Repeat2 size={iconSize} className={question.favorite ? 'text-amber-400' : ''} />
          <Heart
            size={iconSize}
            fill={hasAnswer ? '#f91880' : 'none'}
            className={hasAnswer ? 'text-[#f91880]' : ''}
          />
          <Share2 size={iconSize - 1} />
        </div>
      </div>
    </div>
  )
}
