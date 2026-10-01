"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "@/lib/useTranslations";
import common from "@/content/common.json";

const NAV_ROUTES = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  { href: "/reading", key: "reading" },
  { href: "/blog", key: "blog" },
  { href: "/questions", key: "questions" },
] as const;

export default function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations(common);
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-4 text-lg md:flex-row md:items-center md:gap-6 md:text-base">
      {NAV_ROUTES.map((item) => {
        const isActive = pathname === item.href;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={`group relative inline-block pb-1 transition-colors ${
                isActive
                  ? "font-bold text-white dark:text-black"
                  : "text-white/90 hover:text-white dark:text-black/70 dark:hover:text-black"
              }`}
            >
              {t.nav[item.key]}
              <span
                className={`pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left bg-white transition-transform duration-200 dark:bg-black ${
                  isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
