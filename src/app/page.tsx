'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from '@/lib/useTranslations'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { useLanguage } from '@/context/LanguageContext'
import { getAge } from '@/lib/age'
import content from '@/content/home.json'
import aboutContent from '@/content/about.json'
import activitiesContent from '@/content/activities.json'
import common from '@/content/common.json'
import status from '@/content/status.json'
import LifeTimeline from '@/components/LifeTimeline'
import NowPlayingCard from '@/components/NowPlayingCard'
import NowReading from '@/components/NowReading'
import { VerticalMarquee } from '@/components/Marquee'
import WaveDivider from '@/components/WaveDivider'
import OceanCurrents from '@/components/OceanCurrents'
import SeamShimmer from '@/components/SeamShimmer'

// Fixed regardless of light/dark mode — this is the page's own palette
// (per the reference design yicheng gave), not the rest of the site's
// neutral/cream + orange-accent language. The white "About"/"Into lately"
// bands below do still adapt for dark mode, since those read as ordinary
// page content rather than the deliberate hero/timeline color blocking.
const ORANGE = '#F2A341'
const CREAM = '#F3E4DC'
// Used only for the Life Timeline band, which yicheng wanted blue while
// the Hero band above stays its own color (now orange).
const TIMELINE_BLUE = '#2B455E'

// ChromeLayout gives Home's <main> no side padding of its own (so these
// bands can run full viewport-width with no cream page background showing
// on either side) — each section applies this same gutter directly instead,
// so its own text/widgets still sit inset from the edge rather than
// touching it.
const GUTTER = 'px-4 sm:px-6 lg:px-10'

// Shared frame for the three "into lately" cards (music / reading /
// activity), so they read as one set. Dark mode flips the frame to light,
// since a black border and shadow vanish on the dark background.
// Background is left to each card (music dark blue, reading cream,
// activity white).
const CARD =
  'border-4 border-black shadow-[4px_4px_0_0_#000] dark:border-neutral-200 dark:shadow-[4px_4px_0_0_#e5e5e5]'

// status.json's labels end in a colon (NowStatus shows them inline before
// the widget); as a tag above a card the colon is just noise.
const stripColon = (label: string) => label.replace(/[：:]\s*$/, '')

// The card's label as a tab on its top-left corner (`tone`: its bg/text
// classes). Fully bordered, bottom edge included (per yicheng), so it sits
// on the card's border; -mb-1 (border-4 = 4px) lands that bottom edge
// exactly on the card's top border instead of doubling it. The "see more"
// link (if any) sits at the right of the same row — kept out from under
// the card so cards sharing a grid row stay the same height.
function CardTag({
  children,
  tone,
  href,
  linkLabel,
}: {
  children: React.ReactNode
  tone: string
  href?: string
  linkLabel?: string
}) {
  return (
    <div className='flex items-end justify-between gap-4'>
      <span
        className={`relative z-10 -mb-1 border-4 border-black px-3 py-1.5 text-sm font-bold tracking-wide dark:border-neutral-200 ${tone}`}
      >
        {children}
      </span>
      {href && (
        <Link
          href={href}
          className='mb-2 text-sm font-medium text-[#2B455E] hover:underline dark:text-[#F3E4DC]'
        >
          {linkLabel}
        </Link>
      )}
    </div>
  )
}

const MUSIC_TONE = 'bg-[#2B455E] text-[#F3E4DC]'
const READING_TONE = 'bg-[#F3E4DC] text-[#2B455E]'
const ACTIVITY_TONE = 'bg-white text-black dark:bg-neutral-900 dark:text-white'
// The activity tab takes the orange of the card's own marquee strips (the
// left one runs right under it) instead of the card's white.
const ACTIVITY_TAB_TONE = 'bg-[#F2A341] text-black'

// A card that's a link itself grows a little on hover. Done on the column
// (tab + card together) rather than the card alone, which would pull the
// card away from its tab.
const HOVER_GROW = 'transition-transform has-[>a:hover]:scale-[1.02]'

export default function Home() {
  const t = useTranslations(content)
  const about = useTranslations(aboutContent)
  const activities = useTranslations(activitiesContent)
  const { siteName, profile } = useTranslations(common)
  const s = useTranslations(status)
  const { lang } = useLanguage()
  useDocumentTitle(siteName)

  return (
    <div className='flex flex-col'>
      {/* Hero. The two color bands (this section and the white one right
          after it) are now plain adjacent siblings with nothing between
          them — guaranteed to touch regardless of content height. The
          photo is an absolutely-positioned overlay anchored to this
          section's own bottom edge (top-full) and shifted up by half its
          own height (-translate-y-1/2), so it's centered exactly on the
          seam — half sitting on the orange, half on the white — without
          needing to know either section's actual rendered height. A full
          circle rather than the earlier arch shape, since that symmetry is
          what makes this positioning trick work cleanly. */}
      <section
        className={`relative z-10 flex flex-col items-center pt-[calc(var(--navbar-height,68px)+1.5rem)] pb-6 text-center md:pt-[calc(var(--navbar-height,84px)+4rem)] md:pb-16 ${GUTTER}`}
        style={{ backgroundColor: ORANGE }}
      >
        {/* Dark ink on the orange — cream text didn't read clearly on
            this lighter band. Fixed colors, not dark: variants, since the
            band itself doesn't change with theme. Opens magazine-style:
            the first word (過去 / the first English word) is set huge and
            floated so the small body text wraps around it. Left-aligned
            everywhere, since the wrap needs it; on desktop the block sits
            in the right half, with the photo on the left. */}
        {(() => {
          const lines = profile.intro
            .replace('{age}', String(getAge()))
            .split('\n')
            .map((line) => line.trim())
          const first = lines[0] ?? ''
          const opener =
            lang === 'zh' ? first.slice(0, 2) : (first.match(/^\S+/)?.[0] ?? '')
          return (
            <div className='mx-auto flex w-full max-w-5xl items-center gap-6 sm:gap-8 md:block'>
              {/* Phones: the photo sits inside the band, to the left of
                  the text. Desktop uses the seam-straddling one below. */}
              <div className='relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-[3px] border-white shadow-lg sm:h-32 sm:w-32 md:hidden'>
                <Image
                  src='/images/yc-childhood.jpg'
                  alt={profile.name}
                  fill
                  sizes='128px'
                  className='object-cover object-[center_30%]'
                />
              </div>
              <p className='relative min-w-0 flex-1 text-right text-sm leading-relaxed font-medium text-neutral-900 sm:text-base md:mr-0 md:ml-auto md:max-w-md md:flex-none md:text-left md:text-lg lg:max-w-xl'>
                {/* Hand-drawn arrow from the photo (bottom-left) up to the
                    text, with a little loop for a doodled feel. Anchored to
                    the text's own left edge so it always lands on it;
                    lg+ only, where there's room between photo and text. */}
                <svg
                  aria-hidden
                  viewBox='0 0 200 120'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='3.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='pointer-events-none absolute top-2 right-full mr-3 hidden w-44 text-black lg:block'
                >
                  <path d='M8 100 C 30 94, 52 94, 78 84 C 104 74, 96 50, 82 58 C 68 66, 84 88, 112 80 C 140 72, 162 64, 188 56' />
                  <path d='M188 56 C 182 51, 176 47, 170 45' />
                  <path d='M188 56 C 183 60, 179 65, 176 70' />
                </svg>
                {/* Each source line as its own balanced block, so a line
                    that wraps splits evenly instead of leaving a few
                    characters stranded on the next line. The opener is
                    plain text on phones, where the text is centered; from
                    md up it floats as a big drop cap the text wraps
                    around. */}
                {lines.map((line, i) => {
                  const text =
                    i === 0 ? line.slice(opener.length).trimStart() : line
                  // Phones (zh only): one clause per line, broken after
                  // every ，/。, so each line is a whole thought short enough
                  // to fit beside the photo without being split mid-word
                  // (心理／師。). English clauses are too uneven ("Now,"
                  // alone) for this, so it keeps normal wrapping.
                  const clauses =
                    lang === 'zh' ? text.split(/(?<=[，。])/).filter(Boolean) : [text]
                  return (
                    <span key={i} className='block md:text-balance'>
                      {i === 0 && (
                        <span className='md:float-left md:mt-1 md:mr-3 md:text-[5.25rem] md:leading-[0.85] md:font-black md:tracking-tight md:text-black'>
                          {opener}
                        </span>
                      )}
                      {clauses.map((clause, j) =>
                        j === 0 ? (
                          clause
                        ) : (
                          <span key={j} className='block md:inline'>
                            {clause}
                          </span>
                        )
                      )}
                    </span>
                  )
                })}
              </p>
            </div>
          )
        })()}

        <SeamShimmer />

        {/* Desktop only (phones get the in-band photo above): at the
            left edge of the same max-w-5xl column the text and the About
            band below use, straddling the seam. */}
        <div className='absolute top-full hidden -translate-y-1/2 md:block md:left-[max(1.5rem,calc((100%-64rem)/2))] md:translate-x-0 lg:left-[max(2.5rem,calc((100%-64rem)/2))]'>
          <div className='relative h-40 w-40 overflow-hidden rounded-full border-4 border-white shadow-xl sm:h-52 sm:w-52 md:h-60 md:w-60 dark:border-neutral-900'>
            <Image
              src='/images/yc-childhood.jpg'
              alt={profile.name}
              fill
              sizes='240px'
              className='object-cover object-[center_30%]'
            />
          </div>
        </div>
      </section>

      {/* About — left is the factual bio (about.json, formerly its own
          /about page), right is the personal/informal voice (home.json).
          Top padding clears the overlaid photo (which extends past the
          seam by half its own height — 80px mobile, 104px sm+ — plus some
          breathing room after it). */}
      <section
        className={`relative bg-white pt-12 pb-32 sm:pb-40 md:pt-44 ${GUTTER} dark:bg-neutral-950`}
      >
        <div className='mx-auto max-w-5xl'>
          <div className='grid gap-14 sm:grid-cols-2 sm:gap-20'>
            {/* Left: self-intro (about.json). Right: site intro (home.json).
                Each column's own heading sits at its own top-left, both the
                same size — rather than one big heading shared above both
                columns with the other reduced to a small label. Each \n in
                the source text is a real paragraph break — split into
                actual <p> tags with even spacing instead of relying on
                whitespace-pre-line's bare line-height gap. */}
            <div>
              {/* Plain block flow (space-y, not flex/gap) so the drop cap's
                  float can reach past the short first paragraph and the
                  following ones wrap around it too — a flex item would
                  contain the float inside its own paragraph. */}
              <div className='space-y-3'>
                {`${about.intro1.replace('{age}', String(getAge()))}\n${
                  about.intro2
                }`
                  .split('\n')
                  .map((paragraph, i) => {
                    // Same magazine-style drop cap as the hero, on the
                    // first paragraph only — in the site's orange here
                    // since this band is white, not orange. The rest of
                    // the greeting (你好 / Hello, up to the first
                    // punctuation) stays orange too, as a lead-in.
                    const initial = i === 0 ? Array.from(paragraph)[0] ?? '' : ''
                    const leadIn =
                      i === 0
                        ? (paragraph.match(/^[^！!，,\s]+/)?.[0] ?? initial).slice(initial.length)
                        : ''
                    return (
                      <p
                        key={i}
                        className='text-base leading-relaxed text-neutral-600 dark:text-neutral-300'
                      >
                        {initial && (
                          <span className='float-left mt-1 mr-3 text-[4.5rem] leading-[0.85] font-black text-[#F2A341] dark:text-[#F6B45E]'>
                            {initial}
                          </span>
                        )}
                        {leadIn && (
                          <span className='text-[#F2A341] dark:text-[#F6B45E]'>
                            {leadIn}
                          </span>
                        )}
                        {paragraph.slice(initial.length + leadIn.length)}
                      </p>
                    )
                  })}
              </div>
            </div>
            <div>
              <h2 className='text-3xl font-black leading-tight text-neutral-900 sm:text-4xl dark:text-neutral-100'>
                {t.title}
              </h2>
              <div className='mt-4 flex flex-col gap-3'>
                {t.body.split('\n').map((paragraph, i) => (
                  <p
                    key={i}
                    className='text-base leading-relaxed text-neutral-600 dark:text-neutral-300'
                  >
                    {paragraph}
                  </p>
                ))}
                {about.quote && (
                  <blockquote className='mt-10 border-l-2 border-[#F2A341] pl-4 dark:border-[#F6B45E]'>
                    <p className='text-base leading-relaxed text-neutral-900 dark:text-neutral-100'>
                      <span className='font-bold italic'>{about.quote}</span>
                      {about.quoteSource && (
                        <span className='ml-2 text-sm font-normal text-neutral-500 not-italic dark:text-neutral-400'>
                          {about.quoteSource}
                        </span>
                      )}
                    </p>
                  </blockquote>
                )}
              </div>
            </div>
          </div>
        </div>
        <WaveDivider className='fill-[#2B455E]' />
      </section>

      {/* Life timeline — same map/strip widget as before; only the heading
          and the band around it are new. The map and its own popup card
          stay white/bordered regardless (map tiles need a light base to
          stay legible, and re-theming the map widget itself wasn't part of
          what was asked for here). */}
      <section
        className={`relative pt-20 pb-32 sm:pt-28 sm:pb-40 ${GUTTER}`}
        style={{ backgroundColor: TIMELINE_BLUE }}
      >
        <OceanCurrents />
        <div className='relative z-10 mx-auto max-w-5xl'>
          <h2
            className='mb-6 text-3xl font-black tracking-tight uppercase sm:text-4xl'
            style={{ color: CREAM }}
          >
            {lang === 'zh' ? '人生時間軸' : 'Life Timeline'}
          </h2>
          <LifeTimeline />
        </div>
        <WaveDivider className='fill-white dark:fill-neutral-950' />
      </section>

      {/* What's currently on — the homepage's old "最近在讀/Spotify" widgets,
          kept (per yicheng). NowReading's `bare` prop strips its own card
          chrome so the shared CARD frame below is the only one. */}
      <section
        className={`bg-white py-14 sm:py-20 ${GUTTER} dark:bg-neutral-950`}
      >
        <div className='mx-auto max-w-5xl'>
          <h2 className='text-3xl font-black tracking-tight text-neutral-900 uppercase sm:text-4xl dark:text-neutral-100'>
            {lang === 'zh' ? '音樂、書以及活動' : "What I'm Into Lately"}
          </h2>
          {/* All three as the same card — the activity card's own black
              border + hard shadow, which the rest of the site already
              uses — instead of three different treatments split apart by
              rule lines (per yicheng: the lines only made the mismatch
              more visible). Music + reading share row one at equal height
              (grid rows stretch); activity spans row two. Each card's
              label is a tab on its top-left corner (see CardTag). min-w-0
              on each column (and wrap-anywhere on the titles) so a long
              unbroken word in a book or song title can't widen its card
              past the screen on phones (per yicheng). */}
          <div className='mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2'>
            <div className={`flex min-w-0 flex-col ${HOVER_GROW}`}>
              <CardTag tone={MUSIC_TONE}>{stripColon(s.musicLabel)}</CardTag>
              <NowPlayingCard className={`${CARD} flex-1`} />
            </div>
            <div className='flex min-w-0 flex-col'>
              <CardTag tone={READING_TONE} href='/reading' linkLabel={s.viewAllLabel}>
                {stripColon(s.readingLabel)}
              </CardTag>
              <div className={`${CARD} flex flex-1 flex-col justify-center bg-[#F3E4DC] p-2`}>
                <NowReading onCream />
              </div>
            </div>
            <div className={`flex min-w-0 flex-col sm:col-span-2 ${HOVER_GROW}`}>
              <CardTag tone={ACTIVITY_TAB_TONE} href='/activities' linkLabel={s.viewActivityLabel}>
                {stripColon(s.activityLabel)}
              </CardTag>
              {/* No Notion-backed activity to show yet, so this reuses the
                  Activities page's own empty-state card. Vertical marquees
                  live inside the card's border; the row has an explicit
                  height so the marquees' h-full has something to resolve
                  against. */}
              <Link
                href='/activities'
                className={`${CARD} flex h-56 items-stretch overflow-hidden ${ACTIVITY_TONE}`}
              >
                <VerticalMarquee text='COMING SOON' />
                <div className='flex min-w-0 flex-1 flex-col items-center justify-center gap-3 px-4 py-10 text-center'>
                  <p className='text-2xl font-black text-black sm:text-3xl dark:text-white'>
                    {activities.emptyTitle}
                  </p>
                  <p className='text-xs font-medium text-neutral-600 sm:text-base dark:text-neutral-400'>
                    {activities.emptyBody}
                  </p>
                </div>
                <VerticalMarquee text='COMING SOON' reverse />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
