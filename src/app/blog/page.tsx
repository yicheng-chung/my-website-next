"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/lib/useTranslations";
import { useLanguage } from "@/context/LanguageContext";
import content from "@/content/blog.json";
import BlogCard from "@/components/BlogCard";
import Spinner from "@/components/Spinner";
import { readBlogCache, writeBlogCache } from "@/lib/blogCache";
import type { BlogPost } from "@/lib/blog";

export default function BlogPage() {
  const t = useTranslations(content);
  const { lang } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[] | null>(null);

  useEffect(() => {
    const cached = readBlogCache();
    if (cached) {
      setPosts(cached);
      return;
    }
    let cancelled = false;
    fetch("/api/blog")
      .then((res) => res.json())
      .then((json: { posts: BlogPost[] }) => {
        if (!cancelled) {
          setPosts(json.posts ?? []);
          writeBlogCache(json.posts ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {posts === null ? (
        <div className="flex justify-center py-16">
          <Spinner size={36} />
        </div>
      ) : posts.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{t.emptyList}</p>
      ) : (
        <BlogGrid posts={posts} lang={lang} readMoreLabel={t.readMore} />
      )}
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
// bottom, three per row (per yicheng).
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
          size="large"
          className="sm:row-span-2"
          readMoreLabel={readMoreLabel}
          formattedDate={formatPostDate(newest.date, lang)}
        />
        {second && (
          <BlogCard
            post={second}
            size="small"
            readMoreLabel={readMoreLabel}
            formattedDate={formatPostDate(second.date, lang)}
          />
        )}
        {third && (
          <BlogCard
            post={third}
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
