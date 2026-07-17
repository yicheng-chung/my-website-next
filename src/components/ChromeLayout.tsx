"use client";

import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Profile from "./Profile";
import Footer from "./Footer";

export default function ChromeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pt-24 pb-12 md:flex-row md:items-start md:pt-28">
        <aside className="md:w-72 md:flex-shrink-0">
          <Profile />
        </aside>
        <div className="flex-1">{children}</div>
      </main>

      <Footer />
    </div>
  );
}
