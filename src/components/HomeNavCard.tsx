"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface HomeNavCardProps {
  href: string;
  title: string;
  subtitle: string;
  // Background layer — an <Image fill /> or a plain styled <div>, rendered
  // behind a dark gradient so the title/subtitle stay readable regardless
  // of what's under them.
  children: ReactNode;
}

export default function HomeNavCard({ href, title, subtitle, children }: HomeNavCardProps) {
  return (
    <Link
      href={href}
      className="group relative block h-40 overflow-hidden rounded-2xl shadow-lg transition-transform duration-200 hover:scale-[1.01] sm:h-48"
    >
      <div className="absolute inset-0">{children}</div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
      <div className="absolute inset-0 bg-white/0 transition-colors duration-200 group-hover:bg-white/10" />

      <div className="relative flex h-full items-end justify-between gap-4 p-5 sm:p-6">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-white sm:text-2xl">{title}</h2>
          <p className="mt-1 text-sm text-white/80 sm:text-base">{subtitle}</p>
        </div>
        <ArrowRight
          size={26}
          strokeWidth={2.5}
          className="flex-shrink-0 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] transition-transform duration-200 group-hover:translate-x-1.5"
        />
      </div>
    </Link>
  );
}
