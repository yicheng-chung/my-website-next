"use client";

import { useEffect, useState } from "react";
import { FaSpotify } from "react-icons/fa";
import { useTranslations } from "@/lib/useTranslations";
import status from "@/content/status.json";
import Spinner from "./Spinner";

type SpotifyStatus = {
  isPlaying: boolean;
  trackId?: string;
  track: string | null;
  artist?: string;
  albumArt?: string | null;
  url?: string;
};

export default function NowPlaying() {
  const [data, setData] = useState<SpotifyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations(status);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/spotify")
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-[76px] items-center justify-center rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
        <Spinner />
      </div>
    );
  }

  if (!data || !data.track) return null;

  return (
    <a
      href={data.url}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
    >
      {data.albumArt ? (
        // Plain <img>, not next/image — this is Spotify's own CDN, and the
        // point of this component is to depend on as little of Spotify's
        // infrastructure as possible (see the removed <iframe> embed, which
        // is what used to intermittently show an "upstream request timeout"
        // error straight from Spotify's embed service).
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.albumArt}
          alt=""
          className="h-14 w-14 flex-shrink-0 rounded-md object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-700">
          <FaSpotify className="text-2xl text-[#1DB954]" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400">
          <FaSpotify className="flex-shrink-0 text-[#1DB954]" />
          {data.isPlaying ? t.nowPlayingLabel : t.recentlyPlayedLabel}
        </p>
        <p className="truncate text-sm font-semibold text-neutral-800 dark:text-neutral-100">
          {data.track}
        </p>
        {data.artist && (
          <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{data.artist}</p>
        )}
      </div>
    </a>
  );
}
