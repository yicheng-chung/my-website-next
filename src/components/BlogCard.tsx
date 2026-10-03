import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/lib/blog";
import { canOptimizeCover, toDisplayableImageSrc } from "@/lib/notion";

export default function BlogCard({
  post,
  formattedDate,
  readMoreLabel,
  variant = "list",
  size = "large",
  className = "",
}: {
  post: BlogPost;
  formattedDate: string | null;
  readMoreLabel?: string;
  variant?: "list" | "grid";
  size?: "large" | "small";
  className?: string;
}) {
  // Routed through the HEIC-conversion proxy when needed (see
  // toDisplayableImageSrc) before either Image below ever sees it —
  // `unoptimized` is then based on *that* src, not the original Notion
  // url, so a converted cover (now a local /api/image-proxy url) is
  // treated like any other same-origin image instead of being judged by
  // the host it used to live at.
  const coverSrc = post.cover ? toDisplayableImageSrc(post.cover) : null;

  // Medium-style list row: title/excerpt/meta on the left, a small
  // thumbnail on the right if there's a cover. No card chrome — a thin
  // rule below separates it from the next post. The whole row is the
  // click target.
  if (variant === "list") {
    return (
      <Link
        href={`/blog/${post.id}`}
        className="group -mx-4 flex items-start justify-between gap-6 rounded-xl border-b border-neutral-200 px-4 py-6 first:pt-0 hover:bg-neutral-100/70 dark:border-neutral-700 dark:hover:bg-neutral-800/40"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {(formattedDate || post.category) && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {formattedDate}
              {formattedDate && post.category && " · "}
              {post.category && `＃${post.category}`}
            </p>
          )}
          <h2 className="relative inline-block self-start font-serif text-xl font-bold text-neutral-900 sm:text-2xl dark:text-neutral-100">
            {post.title}
            <span className="absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 bg-current transition-transform duration-150 ease-out group-hover:scale-x-100" />
          </h2>
          {post.excerpt && (
            <p className="line-clamp-2 text-base leading-relaxed text-neutral-500 dark:text-neutral-400">
              {post.excerpt}
            </p>
          )}
        </div>
        {coverSrc && (
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden sm:h-28 sm:w-28">
            {/* A post's cover can be an "external" Notion image pointing at
                an arbitrary host (pasted from the web) rather than Notion's
                own S3 bucket — unoptimized for anything but that one known
                host, same as book covers in NowReading/BookCard, since
                Next's image optimizer otherwise rejects unlisted hosts
                outright instead of just skipping optimization for them. */}
            <Image
              src={coverSrc}
              alt=""
              fill
              sizes="112px"
              unoptimized={!canOptimizeCover(coverSrc)}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
      </Link>
    );
  }

  // Grid/editorial style (the original design): full-width cover, then a
  // centered title/date/excerpt block. `size` scales the whole thing down
  // for the smaller slots in the featured layout (see blog/page.tsx).
  const isLarge = size === "large";

  return (
    <Link
      href={`/blog/${post.id}`}
      className={`group flex h-full flex-col overflow-hidden rounded-none border border-neutral-200 bg-white transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-800 ${className}`}
    >
      {isLarge &&
        (coverSrc ? (
          <div className="relative aspect-[3/2] w-full sm:aspect-[2/1]">
            <Image
              src={coverSrc}
              alt=""
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              unoptimized={!canOptimizeCover(coverSrc)}
              className="object-cover"
            />
          </div>
        ) : (
          <div className="aspect-[3/2] w-full bg-gradient-to-br from-[#F2A341] to-[#F6B45E] sm:aspect-[2/1]" />
        ))}
      <div
        className={`flex flex-1 flex-col items-center gap-2 text-center ${!isLarge ? "justify-center" : ""} ${isLarge ? "p-6 sm:p-10" : "p-4 sm:p-5"}`}
      >
        {post.category && (
          <span className="rounded-full bg-[#F2A341] px-2.5 py-0.5 text-xs font-medium text-black">
            ＃{post.category}
          </span>
        )}
        <h2
          className={`font-serif font-bold text-neutral-900 dark:text-neutral-100 ${
            isLarge ? "text-2xl sm:text-3xl" : "text-lg"
          }`}
        >
          {post.title}
        </h2>
        {formattedDate && (
          <p className="text-sm text-neutral-400 dark:text-neutral-500">{formattedDate}</p>
        )}
        {post.excerpt && (
          <p
            className={`max-w-xl text-neutral-600 dark:text-neutral-300 ${
              isLarge ? "line-clamp-2 text-base leading-relaxed" : "line-clamp-2 text-sm leading-relaxed"
            }`}
          >
            {post.excerpt}
          </p>
        )}
        {readMoreLabel && (
          <span className="relative mt-auto inline-block pt-1 text-sm font-medium text-[#F2A341] dark:text-[#F6B45E]">
            {readMoreLabel}
            <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-current transition-transform duration-150 ease-out group-hover:scale-x-100" />
          </span>
        )}
      </div>
    </Link>
  );
}
