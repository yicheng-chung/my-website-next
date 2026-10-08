'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from '@/lib/useTranslations'
import status from '@/content/status.json'
import { Bone, SkeletonStatus } from './Skeleton'

type SpotifyStatus = {
  isPlaying: boolean
  track: string | null
  artist?: string
  albumArt?: string | null
  url?: string
}

// The homepage's dark-blue music card — the same /api/spotify data NowPlaying
// feeds into Spotify's own embed, laid out by hand instead so it can match
// the site's cards (the embed's dark rounded player sat in the card like a
// box in a box). The whole card links out to the track on Spotify.
export default function NowPlayingCard({ className = '' }: { className?: string }) {
  const s = useTranslations(status)
  const [data, setData] = useState<SpotifyStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/spotify')
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setData(json)
      })
      .catch(() => {
        if (!cancelled) setData(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const base = `${className} bg-[#2B455E] text-[#F3E4DC]`

  if (loading) {
    // Skeleton in the card's own layout (album art, title, artist, the
    // Spotify link), blocks in a faint cream on the blue.
    const tone = 'bg-[#F3E4DC]/15 [--skeleton-shine:rgba(243,228,220,0.25)]'
    return (
      <SkeletonStatus className={`${base} flex items-center gap-5 p-5`}>
        <Bone className={`aspect-square w-28 shrink-0 sm:w-36 ${tone}`} />
        <div className='flex min-w-0 flex-1 flex-col gap-2'>
          <Bone className={`h-7 w-3/4 ${tone}`} />
          <Bone className={`h-4 w-1/3 ${tone}`} />
          <Bone className={`mt-3 h-3 w-16 ${tone}`} />
        </div>
      </SkeletonStatus>
    )
  }

  if (!data?.track) {
    return <div className={`${base} min-h-44`} />
  }

  return (
    <a
      href={data.url}
      target='_blank'
      rel='noopener noreferrer'
      className={`${base} group flex items-center gap-5 p-5`}
    >
      <div className='relative aspect-square w-28 shrink-0 border-2 border-[#F3E4DC] sm:w-36'>
        {data.albumArt && (
          <Image
            src={data.albumArt}
            alt={data.track}
            fill
            sizes='144px'
            className='object-cover'
          />
        )}
      </div>
      <div className='min-w-0 flex-1'>
        {/* Only shown while something is actually playing — the
            "recently played" case needs no label (per yicheng), the tag
            above the card already says it. */}
        {data.isPlaying && (
          <p className='mb-2 flex items-center gap-2 text-xs font-bold tracking-wide text-[#F2A341]'>
            <span className='relative flex h-2 w-2'>
              <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F2A341] opacity-75' />
              <span className='relative inline-flex h-2 w-2 rounded-full bg-[#F2A341]' />
            </span>
            {s.nowPlayingLabel}
          </p>
        )}
        <p className='line-clamp-2 text-xl wrap-anywhere leading-tight font-black sm:text-2xl'>
          {data.track}
        </p>
        <p className='mt-1 truncate text-sm text-[#F3E4DC]/70'>{data.artist}</p>
        <p className='mt-4 text-xs font-medium text-[#F3E4DC]/70 group-hover:text-[#F3E4DC]'>
          Spotify ↗
        </p>
      </div>
    </a>
  )
}
