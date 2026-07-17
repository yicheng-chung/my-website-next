"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Profile from "./Profile";
import NowStatus from "./NowStatus";
import Footer from "./Footer";

export default function ChromeLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pt-20 pb-10 sm:gap-8 sm:px-6 sm:pt-24 md:flex-row md:items-start md:pt-28 lg:px-10">
        <aside
          className={`${isHome ? "flex" : "hidden"} w-full flex-col md:sticky md:top-24 md:flex md:w-[28rem] md:flex-shrink-0`}
        >
          <Profile />
          <NowStatus />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </main>

      <Footer />
    </div>
  );
}
