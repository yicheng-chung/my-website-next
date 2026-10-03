"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useTranslations } from "@/lib/useTranslations";
import common from "@/content/common.json";
import NavLinks from "./NavLinks";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { siteName } = useTranslations(common);
  const headerRef = useRef<HTMLElement>(null);

  // Exposes the navbar's real rendered height as a CSS var, so a page that
  // needs to sit flush against this fixed header (Activities' full-bleed
  // marquees) can offset by exactly that amount instead of a guessed,
  // breakpoint-hardcoded pixel value that'd drift out of sync the next time
  // this header's own height changes.
  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const update = () =>
      document.documentElement.style.setProperty('--navbar-height', `${el.offsetHeight}px`)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-40 bg-black px-4 py-3 shadow-sm transition-colors sm:px-6 sm:py-4 dark:bg-white"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="flex-shrink-0 text-white md:hidden dark:text-black"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu size={26} />
            </button>

            <Link href="/" className="flex-shrink-0 transition-opacity hover:opacity-70">
              {/* Hand-drawn signature, stored as black ink on a transparent
                  background (public/images/signature.png). The header bar
                  itself flips black/white with theme (see className below),
                  so rather than keeping two colored image files, `invert`
                  recolors this one image to white on the black (light-theme)
                  header, and `dark:invert-0` switches it back to its native
                  black ink on the white (dark-theme) header. */}
              <Image
                src="/images/signature.png"
                alt={siteName}
                width={261}
                height={100}
                priority
                className="h-11 w-auto invert sm:h-13 dark:invert-0"
              />
            </Link>
          </div>

          <div className="flex flex-shrink-0 items-center gap-3 sm:gap-6">
            <nav className="hidden md:block">
              <NavLinks />
            </nav>
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
      </header>

      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-black/50"
              onClick={() => setDrawerOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            />
            <motion.div
              className="absolute top-0 left-0 h-full w-64 max-w-[80vw] bg-black p-6 shadow-xl dark:bg-white"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <button
                type="button"
                className="mb-8 text-white dark:text-black"
                aria-label="Close menu"
                onClick={() => setDrawerOpen(false)}
              >
                <X size={28} />
              </button>
              <NavLinks onNavigate={() => setDrawerOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
