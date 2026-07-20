"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "@/lib/useTranslations";
import { useLanguage } from "@/context/LanguageContext";
import content from "@/content/reading.json";
import { readNotionCache, writeNotionCache, type NotionData } from "@/lib/notionCache";
import type { Book, ContentBlock } from "@/lib/notion";
import Spinner from "@/components/Spinner";
import BlockList from "@/components/BookContentBlocks";
import ProgressBar from "@/components/ProgressBar";

function findBook(data: NotionData, id: string): Book | null {
  return data.reading.find((b) => b.id === id) ?? data.finished.find((b) => b.id === id) ?? null;
}

// Notion-style tag colors — deterministic per category name (same category
// always gets the same color across books) rather than a hand-maintained
// mapping, since the category list is open-ended.
const TAG_PALETTE = [
  "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-300",
  "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300",
  "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300",
  "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-300",
  "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800/60 dark:bg-violet-950/40 dark:text-violet-300",
  "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800/60 dark:bg-teal-950/40 dark:text-teal-300",
  "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800/60 dark:bg-orange-950/40 dark:text-orange-300",
  "border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-800/60 dark:bg-pink-950/40 dark:text-pink-300",
  "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-300",
  "border-lime-200 bg-lime-50 text-lime-700 dark:border-lime-800/60 dark:bg-lime-950/40 dark:text-lime-300",
];

function tagColorClass(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return TAG_PALETTE[hash % TAG_PALETTE.length];
}

export default function BookDetailPage() {
  const params = useParams<{ id: string }>();
  const t = useTranslations(content);
  const { lang } = useLanguage();
  const [book, setBook] = useState<Book | null | undefined>(undefined);
  const [blocks, setBlocks] = useState<ContentBlock[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    const cached = readNotionCache();
    const listPromise: Promise<NotionData> = cached
      ? Promise.resolve(cached)
      : fetch("/api/notion").then((res) => res.json());

    listPromise
      .then((json: NotionData) => {
        if (cancelled) return;
        if (!cached) writeNotionCache(json);
        setBook(findBook(json, params.id));
      })
      .catch(() => {
        if (!cancelled) setBook(null);
      });

    fetch(`/api/notion/book/${params.id}`)
      .then((res) => res.json())
      .then((json: { content: ContentBlock[] }) => {
        if (!cancelled) setBlocks(json.content);
      })
      .catch(() => {
        if (!cancelled) setBlocks([]);
      });

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (book === undefined || blocks === null) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={36} />
      </div>
    );
  }

  if (book === null) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-neutral-200 bg-white p-6 text-center dark:border-neutral-700 dark:bg-neutral-800">
        <p className="text-neutral-500 dark:text-neutral-400">{t.notFound}</p>
        <Link
          href="/reading"
          className="mt-4 inline-block text-sm text-[#577E89] hover:underline dark:text-[#9BB8C2]"
        >
          {t.backToList}
        </Link>
      </div>
    );
  }

  const formattedStartDate = book.startDate
    ? new Date(book.startDate).toLocaleDateString(lang === "zh" ? "zh-TW" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 sm:gap-10">
      <div className="flex items-center justify-between">
        <Link
          href="/reading"
          className="inline-flex w-fit items-center gap-1 text-sm text-neutral-500 hover:text-[#577E89] dark:text-neutral-400 dark:hover:text-[#9BB8C2]"
        >
          <ArrowLeft size={16} />
          {t.backToList}
        </Link>
        <a
          href={book.url}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-[#577E89] hover:underline dark:text-[#9BB8C2]"
        >
          {t.openInNotion}
        </a>
      </div>

      <header className="flex flex-col gap-5 sm:flex-row sm:items-start">
        {book.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.cover}
            alt={book.title}
            className="h-56 w-auto self-start rounded-lg object-contain shadow-xl"
          />
        )}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl dark:text-neutral-100">
            {book.title}
          </h1>
          {book.originalTitle && (
            <p className="mt-2 text-base text-neutral-500 dark:text-neutral-400">
              {book.originalTitle}
            </p>
          )}
          <p className="mt-3 text-base text-neutral-600 dark:text-neutral-300">{book.author}</p>
        </div>
      </header>

      <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500 sm:p-5 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-400">
        {formattedStartDate && (
          <p>
            {t.startDateLabel}
            {formattedStartDate}
          </p>
        )}
        {book.progress !== null && (
          <div className="flex items-center gap-2">
            <span className="shrink-0">{t.progressLabel}</span>
            <div className="max-w-36 flex-1">
              <ProgressBar percent={book.progress} />
            </div>
          </div>
        )}
        {book.rating && (
          <p>
            {t.ratingLabel}
            <span aria-label={book.rating}>{book.rating}</span>
          </p>
        )}
        {book.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {book.categories.map((cat) => (
              <span
                key={cat}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${tagColorClass(cat)}`}
              >
                ＃{cat}
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-6 text-sm font-semibold tracking-wide text-neutral-400 uppercase dark:text-neutral-500">
          {t.reflectionHeading}
        </h2>
        {blocks.length === 0 ? (
          <p className="text-lg leading-loose text-neutral-500 italic dark:text-neutral-400">
            {t.emptyContent}
          </p>
        ) : (
          <BlockList blocks={blocks} />
        )}
      </div>
    </div>
  );
}
