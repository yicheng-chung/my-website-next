'use client'

import Image from 'next/image'
import { useTranslations } from '@/lib/useTranslations'
import content from '@/content/home.json'
import common from '@/content/common.json'
import HomeNavCard from '@/components/HomeNavCard'

export default function Home() {
  const t = useTranslations(content)
  const nav = useTranslations(common).nav

  return (
    <div className='flex flex-col gap-6 sm:gap-8'>
      <div className='rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 dark:border-neutral-700 dark:bg-neutral-800'>
        <h1 className='mb-4 text-2xl font-bold text-[#F2A341] sm:text-3xl dark:text-[#F6B45E]'>
          {t.title}
        </h1>
        <p className='whitespace-pre-line text-base leading-relaxed sm:text-lg'>
          {t.body}
        </p>
      </div>

      <div className='flex flex-col gap-4 sm:gap-5'>
        <HomeNavCard
          href='/about'
          title={nav.about}
          subtitle={t.navCards.about}
        >
          <Image
            src='/images/yc-childhood.jpg'
            alt=''
            fill
            sizes='(max-width: 640px) 100vw, 700px'
            className='object-cover object-[center_37%]'
          />
        </HomeNavCard>

        <HomeNavCard
          href='/reading'
          title={nav.reading}
          subtitle={t.navCards.reading}
        >
          <Image
            src='/images/reading-bg.jpeg'
            alt=''
            fill
            sizes='(max-width: 640px) 100vw, 700px'
            className='object-cover'
          />
        </HomeNavCard>

        <HomeNavCard href='/blog' title={nav.blog} subtitle={t.navCards.blog}>
          <Image
            src='/images/blog-nav-bg.jpg'
            alt=''
            fill
            sizes='(max-width: 640px) 100vw, 700px'
            className='object-cover'
          />
        </HomeNavCard>

        <HomeNavCard
          href='/questions'
          title={nav.questions}
          subtitle={t.navCards.questions}
        >
          <Image
            src='/images/questions-nav-bg.webp'
            alt=''
            fill
            sizes='(max-width: 640px) 100vw, 700px'
            className='object-cover'
          />
        </HomeNavCard>
      </div>
    </div>
  )
}
