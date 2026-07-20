"use client";

import { useEffect, useState } from "react";
import Spinner from "./Spinner";

type SpotifyStatus = {
  isPlaying: boolean;
  trackId?: string;
  track: string | null;
};

export default function NowPlaying() {
  const [data, setData] = useState<SpotifyStatus | null>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="flex h-[152px] items-center justify-center rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
        <Spinner />
      </div>
    );
  }

  if (!data || !data.track || !data.trackId) return null;

  return (
    <iframe
      title="Spotify"
      src={`https://open.spotify.com/embed/track/${data.trackId}?theme=0`}
      width="100%"
      height="152"
      style={{ borderRadius: 12 }}
      frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    />
  );
}
