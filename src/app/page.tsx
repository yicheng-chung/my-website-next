'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FaGithub, FaLinkedin, FaFacebook, FaInstagram } from 'react-icons/fa'
import { useTranslations } from '@/lib/useTranslations'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { useLanguage } from '@/context/LanguageContext'
import { getAge } from '@/lib/age'
import content from '@/content/home.json'
import aboutContent from '@/content/about.json'
import common from '@/content/common.json'
import status from '@/content/status.json'
import links from '@/content/links.json'
import LifeTimeline from '@/components/LifeTimeline'
import NowPlaying from '@/components/NowPlaying'
import NowReading from '@/components/NowReading'

const SOCIAL_LINKS = [
  { href: links.instagram, label: 'Instagram', Icon: FaInstagram },
  { href: links.facebook, label: 'Facebook', Icon: FaFacebook },
  { href: links.github, label: 'GitHub', Icon: FaGithub },
  { href: links.linkedin, label: 'LinkedIn', Icon: FaLinkedin },
]

// Fixed regardless of light/dark mode — this is the page's own palette
// (per the reference design yicheng gave), not the rest of the site's
// neutral/cream + orange-accent language. The white "About"/"Into lately"
// bands below do still adapt for dark mode, since those read as ordinary
// page content rather than the deliberate hero/timeline color blocking.
const GREEN = '#16302A'
const CREAM = '#F3E4DC'

// Bleeds each band edge-to-edge of the shared content column (cancels
// ChromeLayout's own side padding) without going full viewport-width —
// every other page keeps that same column width, so this keeps Home
// visually aligned with the rest of the site while still reading as solid
// color blocks rather than boxed-in cards.
const BLEED = '-mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10'

export default function Home() {
  const t = useTranslations(content)
  const about = useTranslations(aboutContent)
  const { siteName, profile } = useTranslations(common)
  const s = useTranslations(status)
  const { lang } = useLanguage()
  useDocumentTitle(siteName)

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section
        className={`flex flex-col items-center pt-14 pb-20 text-center sm:pt-20 sm:pb-28 ${BLEED}`}
        style={{ backgroundColor: GREEN }}
      >
        <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: CREAM }}>
          {profile.role}
        </p>
        <h1
          className="mt-3 text-4xl font-black tracking-tight uppercase sm:text-6xl"
          style={{ color: CREAM }}
        >
          {profile.name}
        </h1>
        <p className="mt-2 text-sm" style={{ color: CREAM, opacity: 0.75 }}>
          {profile.school} {profile.years}
        </p>
        <div className="mt-5 flex gap-5">
          {SOCIAL_LINKS.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              style={{ color: CREAM }}
              className="transition-opacity hover:opacity-70"
            >
              <Icon size={22} />
            </a>
          ))}
        </div>
      </section>

      {/* Photo deliberately overlaps the hero/about seam (negative margin
          pulling it up into the green band above) — the one visual borrowed
          directly from the reference image. */}
      <div className="relative -mt-16 flex justify-center sm:-mt-20">
        <div className="relative h-40 w-40 overflow-hidden rounded-t-full border-4 border-white shadow-xl sm:h-52 sm:w-52 dark:border-neutral-900">
          <Image
            src="/images/yc-childhood.jpg"
            alt={profile.name}
            fill
            sizes="208px"
            className="object-cover object-[center_30%]"
          />
        </div>
      </div>

      {/* About — left is the personal/informal voice (home.json), right is
          the factual bio (about.json, formerly its own /about page) */}
      <section className={`bg-white pt-10 pb-14 sm:pb-20 ${BLEED} dark:bg-neutral-950`}>
        <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-2 sm:gap-12">
          <div>
            <h2 className="text-3xl font-black leading-tight text-neutral-900 sm:text-4xl dark:text-neutral-100">
              {t.title}
            </h2>
            <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
              {t.body}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-widest text-[#F2A341] uppercase dark:text-[#F6B45E]">
              {about.heading}
            </h3>
            <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
              {about.intro1.replace('{age}', String(getAge()))}
            </p>
            <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
              {about.intro2}
            </p>
          </div>
        </div>
      </section>

      {/* Life timeline — same map/strip widget as before; only the heading
          and the band around it are new. The map and its own popup card
          stay white/bordered regardless (map tiles need a light base to
          stay legible, and re-theming the map widget itself wasn't part of
          what was asked for here). */}
      <section className={`py-14 sm:py-20 ${BLEED}`} style={{ backgroundColor: GREEN }}>
        <div className="mx-auto max-w-5xl">
          <h2
            className="mb-6 text-3xl font-black tracking-tight uppercase sm:text-4xl"
            style={{ color: CREAM }}
          >
            {lang === 'zh' ? '人生時間軸' : 'Life Timeline'}
          </h2>
          <LifeTimeline />
        </div>
      </section>

      {/* What's currently on — the homepage's old "最近在讀/Spotify" widgets,
          kept (per yicheng) but laid flat instead of in their old rounded
          card — NowReading's `bare` prop strips that chrome; NowPlaying's
          rounded corners are Spotify's own embed styling, left alone. */}
      <section className={`bg-white py-14 sm:py-20 ${BLEED} dark:bg-neutral-950`}>
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-black tracking-tight text-neutral-900 uppercase sm:text-4xl dark:text-neutral-100">
            {lang === 'zh' ? '最近在做的事' : "What I'm Into Lately"}
          </h2>
          <div className="mt-8 flex flex-col gap-10 sm:flex-row">
            <div className="flex-1">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{s.musicLabel}</p>
              <div className="mt-2">
                <NowPlaying />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{s.readingLabel}</p>
              <div className="mt-2">
                <NowReading bare />
              </div>
              <Link
                href="/reading"
                className="mt-3 inline-block text-sm text-[#F2A341] hover:underline dark:text-[#F6B45E]"
              >
                {s.viewAllLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
