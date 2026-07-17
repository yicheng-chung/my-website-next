"use client";

import { useTranslations } from "@/lib/useTranslations";
import content from "@/content/about.json";

export default function About() {
  const t = useTranslations(content);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-8">
      <h1 className="mb-4 text-3xl font-bold text-[#577E89]">{t.heading}</h1>
      <p className="mb-4 whitespace-pre-line text-lg leading-relaxed">{t.intro1}</p>
      <p className="whitespace-pre-line text-lg leading-relaxed">{t.intro2}</p>
    </div>
  );
}
