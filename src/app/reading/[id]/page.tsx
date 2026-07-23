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

const TAG_CLASS = "bg-black text-[#F2A341] dark:bg-[#F2A341] dark:text-black";

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
          className="mt-4 inline-block text-sm text-[#F2A341] hover:underline dark:text-[#F6B45E]"
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
          className="inline-flex w-fit items-center gap-1 text-sm text-neutral-800 hover:text-black dark:text-neutral-400 dark:hover:text-[#F6B45E]"
        >
          <ArrowLeft size={16} />
          {t.backToList}
        </Link>
        <a
          href={book.url}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-neutral-800 hover:text-black hover:underline dark:font-normal dark:text-[#F6B45E] dark:hover:text-[#F6B45E]"
        >
          {t.openInNotion}
        </a>
      </div>

      <header className="flex flex-col gap-5 rounded-2xl border border-neutral-200 bg-white p-6 sm:flex-row sm:items-start sm:p-8 dark:border-neutral-700 dark:bg-neutral-800">
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
                className={`rounded-full px-3 py-1 text-xs font-medium ${TAG_CLASS}`}
              >
                ＃{cat}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 dark:border-neutral-700 dark:bg-neutral-800">
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
