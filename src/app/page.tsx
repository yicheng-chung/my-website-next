"use client";

import { useTranslations } from "@/lib/useTranslations";
import content from "@/content/home.json";

export default function Home() {
  const t = useTranslations(content);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 dark:border-neutral-700 dark:bg-neutral-800">
      <h1 className="mb-4 text-2xl font-bold text-[#577E89] sm:text-3xl dark:text-[#9BB8C2]">
        {t.title}
      </h1>
      <p className="whitespace-pre-line text-base leading-relaxed sm:text-lg">{t.body}</p>
    </div>
  );
}
