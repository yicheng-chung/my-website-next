"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Languages } from "lucide-react";
import { useTranslations } from "@/lib/useTranslations";
import { useLanguage } from "@/context/LanguageContext";
import content from "@/content/blog.json";
import { readBlogCache, writeBlogCache } from "@/lib/blogCache";
import type { BlogPost } from "@/lib/blog";
import type { ContentBlock } from "@/lib/notion";
import Spinner from "@/components/Spinner";
import BlockList from "@/components/BlogContentBlocks";

// Only these block types carry translatable text; the rest (divider, image)
// pass through untouched.
const TEXT_BLOCK_TYPES = new Set([
  "heading_1",
  "heading_2",
  "heading_3",
  "paragraph",
  "quote",
  "bulleted_list_item",
  "numbered_list_item",
  "callout",
  "toggle",
]);

function blockText(block: ContentBlock): string {
  return "spans" in block ? block.spans.map((s) => s.text).join("") : "";
}

// Reconstructs each block with its translated text — as a single plain span,
// since translated word order won't line up with the original bold/italic
// run boundaries. Non-text blocks (image, divider) pass through unchanged.
function withTranslatedText(block: ContentBlock, text: string): ContentBlock {
  if (!TEXT_BLOCK_TYPES.has(block.type) || !("spans" in block)) return block;
  return { ...block, spans: [{ text }] };
}

export default function BlogPostPage() {
  const params = useParams<{ id: string }>();
  const t = useTranslations(content);
  const { lang, setLang } = useLanguage();
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined);
  const [blocks, setBlocks] = useState<ContentBlock[] | null>(null);
  // Cached once translated, since re-translating on every toggle would waste
  // requests against the free endpoint (see lib/translate.ts) for no benefit
  // — the content doesn't change mid-visit.
  const [translated, setTranslated] = useState<{ title: string; blocks: ContentBlock[] } | null>(
    null
  );
  const [showTranslated, setShowTranslated] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const cached = readBlogCache();
    const listPromise: Promise<BlogPost[]> = cached
      ? Promise.resolve(cached)
      : fetch("/api/blog")
          .then((res) => res.json())
          .then((json: { posts: BlogPost[] }) => json.posts ?? []);

    listPromise
      .then((posts) => {
        if (cancelled) return;
        if (!cached) writeBlogCache(posts);
        setPost(posts.find((p) => p.id === params.id) ?? null);
      })
      .catch(() => {
        if (!cancelled) setPost(null);
      });

    fetch(`/api/blog/${params.id}`)
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

  if (post === undefined || blocks === null) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={36} />
      </div>
    );
  }

  if (post === null) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-neutral-200 bg-white p-6 text-center dark:border-neutral-700 dark:bg-neutral-800">
        <p className="text-neutral-500 dark:text-neutral-400">{t.notFound}</p>
        <Link
          href="/blog"
          className="mt-4 inline-block text-sm text-[#F2A341] hover:underline dark:text-[#F6B45E]"
        >
          {t.backToList}
        </Link>
      </div>
    );
  }

  const formattedDate = post.date
    ? new Date(post.date).toLocaleString(lang === "zh" ? "zh-TW" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : null;

  // Translating also switches the whole site's language to English (and
  // switching back to the original switches it back to zh), so the nav and
  // article don't end up in a mismatched language pair (per yicheng).
  const handleTranslateClick = async () => {
    if (translated) {
      const next = !showTranslated;
      setShowTranslated(next);
      setLang(next ? "en" : "zh");
      return;
    }
    setTranslating(true);
    setTranslateError(false);
    try {
      const texts = [post.title, ...blocks.map(blockText)];
      const res = await fetch("/api/blog/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts }),
      });
      if (!res.ok) throw new Error("translate request failed");
      const json: { texts: string[] } = await res.json();
      const [translatedTitle, ...translatedTexts] = json.texts;
      setTranslated({
        title: translatedTitle,
        blocks: blocks.map((b, i) => withTranslatedText(b, translatedTexts[i])),
      });
      setShowTranslated(true);
      setLang("en");
    } catch {
      setTranslateError(true);
    } finally {
      setTranslating(false);
    }
  };

  const displayTitle = showTranslated && translated ? translated.title : post.title;
  const displayBlocks = showTranslated && translated ? translated.blocks : blocks;

  return (
    <div className="flex w-full flex-col gap-8 sm:gap-10">
      <Link
        href="/blog"
        className="inline-flex w-fit items-center gap-1 text-sm text-neutral-800 hover:text-black dark:text-neutral-400 dark:hover:text-[#F6B45E]"
      >
        <ArrowLeft size={16} />
        {t.backToList}
      </Link>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 dark:border-neutral-700 dark:bg-neutral-800">
        <header className="flex flex-col gap-3">
          <h1 className="font-serif text-3xl font-bold text-neutral-900 sm:text-4xl dark:text-neutral-100">
            {displayTitle}
          </h1>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {/* Date + tag: same row on both breakpoints. On mobile they're
                pushed to opposite ends (justify-between); on desktop the
                tag sits right after the date instead (sm:justify-start),
                since the button below takes over "far right" duty there. */}
            <div className="flex items-center justify-between gap-2 sm:justify-start">
              {formattedDate && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{formattedDate}</p>
              )}
              {post.category && (
                <span className="rounded-full bg-black px-2.5 py-0.5 text-xs font-medium text-[#F2A341] dark:bg-[#F2A341] dark:text-black">
                  ＃{post.category}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleTranslateClick}
              disabled={translating}
              className="inline-flex shrink-0 items-center gap-1.5 self-end rounded-full border border-neutral-200 px-3 py-1 text-sm font-medium text-neutral-600 transition-colors hover:border-[#F2A341] hover:text-[#F2A341] disabled:opacity-60 sm:self-auto dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-[#F6B45E] dark:hover:text-[#F6B45E]"
            >
              {translating ? (
                <Spinner size={14} />
              ) : (
                <Languages size={14} />
              )}
              {/* Each label is in the language it switches TO, not whatever
                  the site's current language happens to be — "Translate to
                  English" reads in English, "顯示原文" (switching back to
                  the Chinese original) reads in Chinese. */}
              {showTranslated && translated ? "顯示原文" : "Translate to English"}
            </button>
          </div>
          {translateError && (
            <p className="text-sm text-red-500 dark:text-red-400">{t.translateFailed}</p>
          )}
        </header>

        <hr className="my-6 border-neutral-200 dark:border-neutral-700" />

        {displayBlocks.length === 0 ? (
          <p className="text-lg leading-loose text-neutral-500 italic dark:text-neutral-400">
            {t.emptyContent}
          </p>
        ) : (
          <BlockList blocks={displayBlocks} />
        )}
      </div>

      {post.cover && !post.coverFromContent && (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.cover} alt="" className="h-auto w-full object-contain" />
        </div>
      )}
    </div>
  );
}
