"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/lib/useTranslations";
import content from "@/content/reading.json";
import BookCard from "@/components/BookCard";
import type { Book } from "@/lib/notion";

type NotionResponse = { reading: Book[]; finished: Book[] };

export default function ReadingPage() {
  const t = useTranslations(content);
  const [data, setData] = useState<NotionResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/notion")
      .then((res) => res.json())
      .then((json: NotionResponse) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setData({ reading: [], finished: [] });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
        <h1 className="mb-2 text-2xl font-bold text-[#577E89] sm:text-3xl">{t.heading}</h1>
        <p className="text-sm text-neutral-500">{t.sourceNote}</p>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-bold text-neutral-800 sm:text-xl">
          {t.readingHeading}
        </h2>
        {data && data.reading.length === 0 && (
          <p className="text-sm text-neutral-500">{t.emptyReading}</p>
        )}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
          {(data?.reading ?? []).map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-neutral-800 sm:text-xl">
          {t.finishedHeading}
        </h2>
        {data && data.finished.length === 0 && (
          <p className="text-sm text-neutral-500">{t.emptyFinished}</p>
        )}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
          {(data?.finished ?? []).map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>
    </div>
  );
}
