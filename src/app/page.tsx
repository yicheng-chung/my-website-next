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
import activitiesContent from '@/content/activities.json'
import common from '@/content/common.json'
import status from '@/content/status.json'
import links from '@/content/links.json'
import LifeTimeline from '@/components/LifeTimeline'
import NowPlaying from '@/components/NowPlaying'
import NowReading from '@/components/NowReading'
import { VerticalMarquee } from '@/components/Marquee'

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
  const activities = useTranslations(activitiesContent)
  const { siteName, profile } = useTranslations(common)
  const s = useTranslations(status)
  const { lang } = useLanguage()
  useDocumentTitle(siteName)

  return (
    <div className="flex flex-col">
      {/* Hero. The two color bands (this section and the white one right
          after it) are now plain adjacent siblings with nothing between
          them — guaranteed to touch regardless of content height. The
          photo is an absolutely-positioned overlay anchored to this
          section's own bottom edge (top-full) and shifted up by half its
          own height (-translate-y-1/2), so it's centered exactly on the
          seam — half sitting on the green, half on the white — without
          needing to know either section's actual rendered height. A full
          circle rather than the earlier arch shape, since that symmetry is
          what makes this positioning trick work cleanly. */}
      <section
        className={`relative flex flex-col items-center pt-14 pb-28 text-center sm:pt-20 sm:pb-36 ${BLEED}`}
        style={{ backgroundColor: GREEN }}
      >
        <h1
          className="text-4xl font-black tracking-tight uppercase sm:text-6xl"
          style={{ color: CREAM }}
        >
          {profile.name}
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed sm:max-w-xl sm:text-base" style={{ color: CREAM }}>
          {profile.intro.replace('{age}', String(getAge()))}
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

        <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-white shadow-xl sm:h-52 sm:w-52 dark:border-neutral-900">
            <Image
              src="/images/yc-childhood.jpg"
              alt={profile.name}
              fill
              sizes="208px"
              className="object-cover object-[center_30%]"
            />
          </div>
        </div>
      </section>

      {/* About — left is the factual bio (about.json, formerly its own
          /about page), right is the personal/informal voice (home.json).
          Top padding clears the overlaid photo (which extends past the
          seam by half its own height — 80px mobile, 104px sm+ — plus some
          breathing room after it). */}
      <section className={`bg-white pt-28 pb-14 sm:pt-36 sm:pb-20 ${BLEED} dark:bg-neutral-950`}>
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 sm:grid-cols-2 sm:gap-12">
            {/* Left: self-intro (about.json). Right: site intro (home.json).
                Each column's own heading sits at its own top-left, both the
                same size — rather than one big heading shared above both
                columns with the other reduced to a small label. Each \n in
                the source text is a real paragraph break — split into
                actual <p> tags with even spacing instead of relying on
                whitespace-pre-line's bare line-height gap. */}
            <div>
              <h2 className="text-3xl font-black leading-tight text-[#F2A341] sm:text-4xl dark:text-[#F6B45E]">
                {about.heading}
              </h2>
              <div className="mt-4 flex flex-col gap-3">
                {`${about.intro1.replace('{age}', String(getAge()))}\n${about.intro2}`
                  .split('\n')
                  .map((paragraph, i) => (
                    <p
                      key={i}
                      className="text-base leading-relaxed text-neutral-600 dark:text-neutral-300"
                    >
                      {paragraph}
                    </p>
                  ))}
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black leading-tight text-neutral-900 sm:text-4xl dark:text-neutral-100">
                {t.title}
              </h2>
              <div className="mt-4 flex flex-col gap-3">
                {t.body.split('\n').map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-base leading-relaxed text-neutral-600 dark:text-neutral-300"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
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
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-black tracking-tight text-neutral-900 uppercase sm:text-4xl dark:text-neutral-100">
            {lang === 'zh' ? '最近在做的事' : "What I'm Into Lately"}
          </h2>
          {/* Two equal-width columns (grid, not flex-1 — flex-1 let each
              column's intrinsic content width win, which is what made them
              look uneven). Three flat items in a 2-col grid auto-flows as
              music+reading on row one, activity alone on row two — per
              yicheng. */}
          <div className="mt-8 grid gap-10 sm:grid-cols-2">
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{s.musicLabel}</p>
              <div className="mt-2">
                <NowPlaying />
              </div>
            </div>
            <div>
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
            <div className="sm:col-span-2">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{s.activityLabel}</p>
              {/* No Notion-backed activity to show yet, so this reuses the
                  Activities page's own empty-state card verbatim (same
                  text, same white/border-4/hard-shadow treatment) rather
                  than a bare color swatch. Swap for the real activity's
                  cover + title once that page actually has data. */}
              {/* Vertical marquees flank the card — same "COMING SOON"
                  ticker as the Activities page's own horizontal ones, just
                  rotated, and scrolling opposite ways on each side. */}
              {/* Explicit height on the row itself — without it, `h-full`
                  on the marquees has no definite parent height to resolve
                  against, so the flex row ends up stretching to the
                  marquees' own enormous (pre-clip) content height instead
                  of the other way around. */}
              <div className="mt-2 flex h-56 items-stretch">
                <VerticalMarquee text="COMING SOON" />
                <Link href="/activities" className="min-w-0 flex-1">
                  <div className="flex h-full flex-col items-center justify-center gap-3 border-4 border-black bg-white px-4 py-10 text-center shadow-[4px_4px_0_0_#000] transition-transform hover:scale-[1.02] dark:bg-neutral-900">
                    <p className="text-2xl font-black text-black sm:text-3xl dark:text-white">
                      {activities.emptyTitle}
                    </p>
                    <p className="text-xs font-medium text-neutral-600 sm:text-base dark:text-neutral-400">
                      {activities.emptyBody}
                    </p>
                  </div>
                </Link>
                <VerticalMarquee text="COMING SOON" reverse />
              </div>
              <Link
                href="/activities"
                className="mt-3 inline-block text-sm text-[#F2A341] hover:underline dark:text-[#F6B45E]"
              >
                {s.viewActivityLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
