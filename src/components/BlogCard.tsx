import Link from "next/link";
import type { BlogPost } from "@/lib/blog";

// Single-column editorial style (per yicheng, referencing a Webnode travel
// blog template): full-width cover, then a centered title/date/excerpt block.
// `size` scales the whole thing down for the smaller slots in the featured
// layout (see blog/page.tsx) — same shape, less real estate.
// The whole card is the click target (not just the "read more" text), with
// a slight scale-up on hover as the affordance for that.
export default function BlogCard({
  post,
  formattedDate,
  readMoreLabel,
  size = "large",
  className = "",
}: {
  post: BlogPost;
  formattedDate: string | null;
  readMoreLabel: string;
  size?: "large" | "small";
  className?: string;
}) {
  const isLarge = size === "large";

  return (
    <Link
      href={`/blog/${post.id}`}
      className={`flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-800 ${className}`}
    >
      {post.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover}
          alt=""
          className={isLarge ? "aspect-[3/2] w-full object-cover sm:aspect-[2/1]" : "aspect-[3/2] w-full object-cover"}
        />
      ) : (
        // The large/featured slot always gets an image treatment, even with
        // no Notion cover and nothing usable in the post body (see blog.ts) —
        // a brand-colored placeholder rather than leaving it blank.
        isLarge && (
          <div className="aspect-[3/2] w-full bg-gradient-to-br from-[#F2A341] to-[#F6B45E] sm:aspect-[2/1]" />
        )
      )}
      <div
        className={`flex flex-1 flex-col items-center gap-2 text-center ${!isLarge || !post.cover ? "justify-center" : ""} ${isLarge ? "p-6 sm:p-10" : "p-4 sm:p-5"}`}
      >
        {post.category && (
          <span className="rounded-full bg-black px-2.5 py-0.5 text-xs font-medium text-[#F2A341] dark:bg-[#F2A341] dark:text-black">
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
        <span className="mt-auto pt-1 text-sm font-medium text-[#F2A341] dark:text-[#F6B45E]">
          {readMoreLabel}
        </span>
      </div>
    </Link>
  );
}
