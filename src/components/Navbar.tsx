"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import NavLinks from "./NavLinks";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#577E89] px-4 py-3 shadow-sm transition-colors sm:px-6 sm:py-4 dark:bg-[#33474D]">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="flex-shrink-0 text-white md:hidden"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu size={26} />
            </button>

            <Link
              href="/"
              className="truncate text-lg font-bold text-white transition-colors hover:text-amber-100 sm:text-xl"
            >
              YiCheng&apos;s Page
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
              className="absolute top-0 left-0 h-full w-64 max-w-[80vw] bg-[#577E89] p-6 shadow-xl dark:bg-[#33474D]"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <button
                type="button"
                className="mb-8 text-white"
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
