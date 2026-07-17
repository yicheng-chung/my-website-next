"use client";

import { MapPin } from "lucide-react";
import { useTranslations } from "@/lib/useTranslations";
import status from "@/content/status.json";
import NowPlaying from "./NowPlaying";

export default function NowStatus() {
  const s = useTranslations(status);

  return (
    <div className="mt-6 flex w-full flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="flex items-center gap-1.5 text-sm text-neutral-500">
        <MapPin size={14} />
        <span>
          {s.locationLabel} {s.location}
        </span>
      </div>
      <span className="text-sm text-neutral-500">{s.musicLabel}</span>
      <NowPlaying />
    </div>
  );
}
