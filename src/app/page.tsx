"use client";

import { useTranslations } from "@/lib/useTranslations";
import content from "@/content/home.json";

export default function Home() {
  const t = useTranslations(content);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-8">
      <h1 className="mb-4 text-3xl font-bold text-[#577E89]">{t.title}</h1>
      <p className="whitespace-pre-line text-lg leading-relaxed">{t.body}</p>
    </div>
  );
}
