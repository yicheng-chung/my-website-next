"use client";

import { useTranslations } from "@/lib/useTranslations";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import content from "@/content/activities.json";
import common from "@/content/common.json";
import Marquee from "@/components/Marquee";

// Deliberately not using the site's usual neutral/cream, thin-border,
// serif-heading language — per yicheng, this page should feel like its own
// loud, playful thing (bold chunky borders, a fixed bright palette, a hard
// drop shadow, a scrolling ticker band) rather than blend in with Blog/
// Reading/Questions. Fixed colors regardless of light/dark mode is
// intentional for the same reason — the whole point is that it doesn't
// quietly match.
//
// Placeholder for now — no activities exist yet, so this only ever renders
// the empty state. Once there's a Notion database backing it, this becomes
// a real fetch (same pattern as blog/reading/questions) that either lists
// whatever's currently open for signup or falls back to this same empty
// state when nothing is.
export default function ActivitiesPage() {
  const t = useTranslations(content);
  const { siteName } = useTranslations(common);
  useDocumentTitle(`${t.title} · ${siteName}`);

  return (
    <div className="flex flex-col gap-6">
      <Marquee text="COMING SOON" />

      <div
        className="relative overflow-hidden rounded-[2rem] border-4 border-black px-6 py-20 text-center shadow-[8px_8px_0_0_#000]"
        style={{
          backgroundColor: "#FF6B35",
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 14px, transparent 14px, transparent 28px)",
        }}
      >
        <h1
          className="text-5xl font-black text-white sm:text-7xl"
          style={{ WebkitTextStroke: "3px black", paintOrder: "stroke fill" }}
        >
          {t.title}
        </h1>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-[2rem] border-4 border-black bg-white px-6 py-16 text-center shadow-[8px_8px_0_0_#000]">
        <p className="text-2xl font-black text-black sm:text-3xl">{t.emptyTitle}</p>
        <p className="text-xs font-medium text-neutral-600 sm:whitespace-nowrap sm:text-base">
          {t.emptyBody}
        </p>
      </div>

      <Marquee text="COMING SOON" />
    </div>
  );
}
