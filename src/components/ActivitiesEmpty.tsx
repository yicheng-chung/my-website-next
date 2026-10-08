"use client";

import { useTranslations } from "@/lib/useTranslations";
import content from "@/content/activities.json";
import Marquee from "@/components/Marquee";

// The Activities page's original "nothing planned yet" design, unchanged
// (per yicheng: kept for whenever no event is on — see `hasEvent` in
// activities.json). Deliberately loud and playful — bold chunky borders, a
// fixed bright palette, a hard drop shadow, a scrolling ticker band —
// rather than blending in with Blog/Reading/Questions; fixed colors in
// light and dark mode for the same reason.
export default function ActivitiesEmpty() {
  const t = useTranslations(content);

  return (
    <div className="flex flex-col gap-10 sm:gap-14">
      {/* Full viewport width (ChromeLayout gives this route's <main> no
          side padding or max-width to cancel, same as Home) and flush
          against the fixed navbar — marginTop matches its real rendered
          height exactly via the CSS var Navbar.tsx keeps updated, rather
          than a guessed pixel value that'd drift out of sync whenever the
          navbar's own height changes. The 84px fallback is only for the
          brief window before that effect has run. */}
      <div style={{ marginTop: "var(--navbar-height, 84px)" }}>
        <Marquee text="COMING SOON" />
      </div>

      {/* The two cards stay in the site's usual centered reading column —
          only the marquees are meant to bleed full-width — so this wrapper
          re-applies the same side gutter ChromeLayout's <main> would
          otherwise have provided. */}
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col items-center gap-3 rounded-[2rem] border-4 border-black bg-white px-6 py-16 text-center shadow-[8px_8px_0_0_#000]">
          <p className="text-2xl font-black text-black sm:text-3xl">{t.emptyTitle}</p>
          <p className="text-xs font-medium text-neutral-600 sm:whitespace-nowrap sm:text-base">
            {t.emptyBody}
          </p>
        </div>
      </div>

      {/* Flush against the footer below — no bottom padding left on this
          route's <main>, and nothing after this in the flex column, so it
          sits directly adjacent the same way the top one sits against the
          navbar. */}
      <Marquee text="COMING SOON" />
    </div>
  );
}
