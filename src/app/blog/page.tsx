"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "@/lib/useTranslations";
import { useLanguage } from "@/context/LanguageContext";
import content from "@/content/blog.json";
import BlogCard from "@/components/BlogCard";
import BlogLayoutToggle, { type BlogLayout } from "@/components/BlogLayoutToggle";
import Spinner from "@/components/Spinner";
import { readBlogCache, writeBlogCache } from "@/lib/blogCache";
import type { BlogPost, BlogPostPage } from "@/lib/blog";

const LAYOUT_KEY = "blog-layout";

export default function BlogPage() {
  const t = useTranslations(content);
  const { lang } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [layout, setLayout] = useState<BlogLayout>("list");
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Mirrors the latest state into refs so the IntersectionObserver (set up
  // once, never torn down/recreated) can always act on current values
  // without needing to be recreated whenever they change.
  const stateRef = useRef({ hasMore, nextCursor, loadingMore });
  stateRef.current = { hasMore, nextCursor, loadingMore };

  // useLayoutEffect, not useEffect — this runs before the browser paints,
  // so switching away from the "list" default (when a different layout was
  // saved from a previous visit) doesn't flash the default on screen first.
  useLayoutEffect(() => {
    const stored = localStorage.getItem(LAYOUT_KEY);
    if (stored === "list" || stored === "grid") setLayout(stored);
  }, []);

  const handleLayoutChange = (next: BlogLayout) => {
    setLayout(next);
    localStorage.setItem(LAYOUT_KEY, next);
  };

  // Initial page load — 5 posts at a time, not the whole blog. Picks up a
  // cached, already-scrolled-further state if there is one, so coming back
  // to this page doesn't re-paginate from scratch.
  useEffect(() => {
    const cached = readBlogCache();
    if (cached) {
      setPosts(cached.posts);
      setNextCursor(cached.nextCursor);
      setHasMore(cached.hasMore);
      return;
    }
    let cancelled = false;
    fetch("/api/blog")
      .then((res) => res.json())
      .then((json: BlogPostPage) => {
        if (cancelled) return;
        const result = { posts: json.posts ?? [], nextCursor: json.nextCursor, hasMore: json.hasMore };
        setPosts(result.posts);
        setNextCursor(result.nextCursor);
        setHasMore(result.hasMore);
        writeBlogCache(result);
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Infinite scroll: fetch the next page of 5 once the sentinel at the
  // bottom of the list comes into view — same feed pattern as scrolling
  // Facebook or Twitter, and it keeps each visit to this page cheap. Set up
  // once and never torn down/recreated (it reads stateRef for current
  // values instead) — recreating the observer on every state change was
  // tearing it down before it ever got a chance to report an intersection.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "600px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-checks the sentinel's actual on-screen position (rather than relying
  // on the observer's own callback, which only fires on a true/false
  // transition and can race with the fetch below) whenever a page finishes
  // loading. Needed because a short layout — e.g. the grid view's first 5
  // posts — can leave the sentinel inside the loaded margin from the start,
  // so no new intersection transition ever happens to ask for the next
  // page. Keeps loading until either the sentinel scrolls out of range or
  // hasMore turns false, at which point loadMore is a no-op.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const rect = sentinel.getBoundingClientRect();
    const margin = 600;
    const inView = rect.top < window.innerHeight + margin && rect.bottom > -margin;
    if (inView) loadMore();
    // loadingMore is included so that once a fetch's .finally() clears it
    // (a separate microtask from the .then() that updates the other three,
    // so this effect can otherwise fire while loadingMore is still true and
    // bail out with nothing left to re-trigger it), this re-checks and
    // retries instead of getting stuck.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, hasMore, nextCursor, loadingMore]);

  const loadMore = () => {
    const current = stateRef.current;
    if (current.loadingMore || !current.hasMore || !current.nextCursor) return;
    setLoadingMore(true);
    fetch(`/api/blog?cursor=${encodeURIComponent(current.nextCursor)}`)
      .then((res) => res.json())
      .then((json: BlogPostPage) => {
        setPosts((prev) => {
          const merged = [...(prev ?? []), ...(json.posts ?? [])];
          writeBlogCache({ posts: merged, nextCursor: json.nextCursor, hasMore: json.hasMore });
          return merged;
        });
        setNextCursor(json.nextCursor);
        setHasMore(json.hasMore);
      })
      .catch(() => setHasMore(false))
      .finally(() => setLoadingMore(false));
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Mobile: floats bottom-right like the Questions page's guide planet,
          within thumb reach instead of pinned at the top of a page that's
          mostly scrolled past. Desktop: back in the normal flow, top-right. */}
      <div className="fixed right-4 bottom-4 z-30 md:static md:z-auto md:flex md:justify-end">
        <BlogLayoutToggle layout={layout} onChange={handleLayoutChange} />
      </div>

      {posts === null ? (
        <div className="flex justify-center py-16">
          <Spinner size={36} />
        </div>
      ) : posts.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{t.emptyList}</p>
      ) : layout === "list" ? (
        <div className="mx-auto flex w-full max-w-2xl flex-col">
          {posts.map((post) => (
            <BlogCard
              key={post.id}
              post={post}
              variant="list"
              formattedDate={formatPostDate(post.date, lang)}
            />
          ))}
        </div>
      ) : (
        <BlogGrid posts={posts} lang={lang} readMoreLabel={t.readMore} />
      )}

      <div ref={sentinelRef} className="flex justify-center py-6">
        {loadingMore && <Spinner size={28} />}
      </div>
    </div>
  );
}

function formatPostDate(date: string | null, lang: "zh" | "en") {
  return date
    ? new Date(date).toLocaleDateString(lang === "zh" ? "zh-TW" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
}

// Newest post large on the top-left, next two smaller stacked on the
// top-right, everything older filling in below — left to right, top to
// bottom, three per row (per yicheng) — the original grid design, kept
// as an alternative to the Medium-style list above.
function BlogGrid({
  posts,
  lang,
  readMoreLabel,
}: {
  posts: BlogPost[];
  lang: "zh" | "en";
  readMoreLabel: string;
}) {
  const [newest, second, third, ...rest] = posts;

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:grid-rows-2 sm:gap-6">
        <BlogCard
          post={newest}
          variant="grid"
          size="large"
          className="sm:row-span-2"
          readMoreLabel={readMoreLabel}
          formattedDate={formatPostDate(newest.date, lang)}
        />
        {second && (
          <BlogCard
            post={second}
            variant="grid"
            size="small"
            readMoreLabel={readMoreLabel}
            formattedDate={formatPostDate(second.date, lang)}
          />
        )}
        {third && (
          <BlogCard
            post={third}
            variant="grid"
            size="small"
            readMoreLabel={readMoreLabel}
            formattedDate={formatPostDate(third.date, lang)}
          />
        )}
      </div>

      {rest.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          {rest.map((post) => (
            <BlogCard
              key={post.id}
              post={post}
              variant="grid"
              size="small"
              readMoreLabel={readMoreLabel}
              formattedDate={formatPostDate(post.date, lang)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
