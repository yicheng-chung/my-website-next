"use client";

import Image from "next/image";
import { useTranslations } from "@/lib/useTranslations";
import { useTypewriter } from "@/lib/useTypewriter";
import content from "@/content/home.json";
import common from "@/content/common.json";
import HomeNavCard from "@/components/HomeNavCard";

export default function Home() {
  const t = useTranslations(content);
  const nav = useTranslations(common).nav;
  const { text: typedTitle, done: titleDone } = useTypewriter(t.title);
  const { text: typedBody, done: bodyDone } = useTypewriter(t.body, 18, titleDone);

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 dark:border-neutral-700 dark:bg-neutral-800">
        <h1 className="mb-4 min-h-[2.25rem] text-2xl font-bold text-[#F2A341] sm:min-h-[2.75rem] sm:text-3xl dark:text-[#F6B45E]">
          {typedTitle}
          {!titleDone && (
            <span className="ml-0.5 animate-pulse" aria-hidden>
              |
            </span>
          )}
        </h1>
        <p className="min-h-[6.5rem] whitespace-pre-line text-base leading-relaxed sm:text-lg">
          {typedBody}
          {titleDone && !bodyDone && (
            <span className="ml-0.5 animate-pulse" aria-hidden>
              |
            </span>
          )}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:gap-5">
        <HomeNavCard href="/about" title={nav.about} subtitle={t.navCards.about}>
          <Image
            src="/images/yc.jpg"
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 700px"
            className="object-cover object-[center_32%]"
          />
        </HomeNavCard>

        <HomeNavCard href="/reading" title={nav.reading} subtitle={t.navCards.reading}>
          <Image
            src="/images/reading-bg.jpeg"
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 700px"
            className="object-cover"
          />
        </HomeNavCard>

        <HomeNavCard href="/questions" title={nav.questions} subtitle={t.navCards.questions}>
          <Image
            src="/images/questions-nav-bg.webp"
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 700px"
            className="object-cover"
          />
        </HomeNavCard>
      </div>
    </div>
  );
}
