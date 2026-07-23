"use client";

import { MapPin } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "@/lib/useTranslations";
import status from "@/content/status.json";
import NowPlaying from "./NowPlaying";
import NowReading from "./NowReading";

export default function NowStatus() {
  const s = useTranslations(status);

  return (
    <div className="mt-6 flex w-full flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
      <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
        <MapPin size={14} />
        <span>
          {s.locationLabel} {s.location}
        </span>
      </div>
      <span className="text-sm text-neutral-500 dark:text-neutral-400">{s.musicLabel}</span>
      <NowPlaying />
      <span className="text-sm text-neutral-500 dark:text-neutral-400">{s.readingLabel}</span>
      <NowReading />
      <Link
        href="/reading"
        className="self-start text-xs text-[#F2A341] hover:underline dark:text-[#F6B45E]"
      >
        {s.viewAllLabel}
      </Link>
    </div>
  );
}
