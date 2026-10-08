"use client";

import { useEffect, useState } from "react";
import { Bone, SkeletonStatus } from "./Skeleton";

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
    // Skeleton in the shape of Spotify's embed (art on the left, title /
    // artist / progress on the right), same 152px height.
    return (
      <SkeletonStatus className="flex h-[152px] items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
        <Bone className="h-[118px] w-[118px] shrink-0 rounded-md" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Bone className="h-4 w-2/3" />
          <Bone className="h-3 w-1/3" />
          <Bone className="mt-6 h-1 w-full rounded-full" />
        </div>
      </SkeletonStatus>
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
