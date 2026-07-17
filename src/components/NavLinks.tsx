"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "@/lib/useTranslations";
import common from "@/content/common.json";

const NAV_ROUTES = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
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
              className={
                isActive
                  ? "font-bold text-white border-b-2 border-white pb-0.5"
                  : "text-white/90 hover:text-white transition-colors"
              }
            >
              {t.nav[item.key]}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
