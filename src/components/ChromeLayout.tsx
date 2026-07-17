"use client";

import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Profile from "./Profile";
import NowStatus from "./NowStatus";
import Footer from "./Footer";

export default function ChromeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-6 pt-24 pb-12 md:flex-row md:items-start md:pt-28 lg:px-10">
        <aside className="md:sticky md:top-24 md:w-[28rem] md:flex-shrink-0">
          <Profile />
          <NowStatus />
        </aside>
        <div className="flex-1">{children}</div>
      </main>

      <Footer />
    </div>
  );
}
