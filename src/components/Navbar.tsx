"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import NavLinks from "./NavLinks";

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="fixed top-4 left-1/2 z-40 w-[90%] max-w-5xl -translate-x-1/2 rounded-full bg-[#ca4141] px-6 py-4 shadow-lg md:top-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="text-white md:hidden"
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu size={28} />
          </button>

          <Link href="/" className="text-xl font-bold text-white hover:text-amber-100 transition-colors">
            YiCheng&apos;s Page
          </Link>

          <nav className="hidden md:block">
            <NavLinks />
          </nav>
        </div>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute top-0 left-0 h-full w-64 bg-[#ca4141] p-6 shadow-xl">
            <button
              type="button"
              className="mb-8 text-white"
              aria-label="Close menu"
              onClick={() => setDrawerOpen(false)}
            >
              <X size={28} />
            </button>
            <NavLinks onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
