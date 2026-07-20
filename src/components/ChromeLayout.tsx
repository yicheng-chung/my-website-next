"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useIsDesktop } from "@/lib/useIsDesktop";
import Navbar from "./Navbar";
import Profile from "./Profile";
import NowStatus from "./NowStatus";
import Footer from "./Footer";

// Home always keeps the profile/music/reading info inline (reordered to the
// end on mobile, so the page's own content isn't pushed below the fold by
// it). About keeps it inline only on desktop — on mobile it collapses into
// the same drawer every other route uses, since a second full profile block
// stacked above the bio is redundant on a narrow screen. Book detail pages
// don't show it at all: the drawer toggle sat right where the cover/meta
// card starts and covered part of it.
const HOME_ROUTE = "/";
const ABOUT_ROUTE = "/about";

const TEXT = {
  zh: { open: "打開個人資訊欄", close: "收起個人資訊欄" },
  en: { open: "Open profile panel", close: "Close profile panel" },
};

export default function ChromeLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const isDesktop = useIsDesktop();
  const t = TEXT[lang];

  const isHome = pathname === HOME_ROUTE;
  const isAbout = pathname === ABOUT_ROUTE;
  const isBookDetail = pathname.startsWith("/reading/");

  const showInline = isHome || (isAbout && isDesktop);
  const showDrawerToggle = !showInline && !isBookDetail;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  // Land on every new route with the drawer closed, even if it was left
  // open on a previous page.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setDrawerOpen(false);
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pt-20 pb-10 sm:gap-8 sm:px-6 sm:pt-24 md:flex-row md:items-start md:pt-28 lg:px-10">
        {showInline && isDesktop && (
          <aside className="flex w-full flex-col md:sticky md:top-24 md:w-[28rem] md:flex-shrink-0">
            <Profile />
            <NowStatus />
          </aside>
        )}

        {showInline && !isDesktop && <Profile />}

        <div className="min-w-0 flex-1">{children}</div>

        {showInline && !isDesktop && isHome && <NowStatus />}
      </main>

      {showDrawerToggle && (
        <>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label={t.open}
            className={`fixed top-1/2 left-0 z-30 flex h-12 w-7 -translate-y-1/2 items-center justify-center rounded-r-lg border border-l-0 border-neutral-200 bg-white/60 text-neutral-500 backdrop-blur-md transition-opacity hover:bg-white/90 hover:text-[#577E89] dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-400 dark:hover:bg-neutral-800/90 dark:hover:text-[#9BB8C2] ${
              drawerOpen ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          >
            <ChevronRight size={16} />
          </button>

          <AnimatePresence>
            {drawerOpen && (
              <>
                <motion.button
                  key="drawer-backdrop"
                  type="button"
                  aria-label={t.close}
                  onClick={() => setDrawerOpen(false)}
                  className="fixed inset-0 z-30 bg-black/30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
                <motion.div
                  key="drawer-panel"
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="fixed top-0 left-0 z-30 h-full w-[85vw] max-w-[24rem] overflow-y-auto border-r border-neutral-200 bg-neutral-100 p-4 pt-24 dark:border-neutral-700 dark:bg-neutral-900"
                >
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    aria-label={t.close}
                    className="absolute top-1/2 -right-7 flex h-12 w-7 -translate-y-1/2 items-center justify-center rounded-r-lg border border-l-0 border-neutral-200 bg-white text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <Profile />
                  <NowStatus />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}

      <Footer />
    </div>
  );
}
