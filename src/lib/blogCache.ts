import type { BlogPost } from "./blog";

// sessionStorage rather than a module-level variable — see notionCache.ts,
// same reasoning (module re-evaluation across client-side route transitions).
const CACHE_KEY = "blog-posts-cache";
const TTL_MS = 5 * 60 * 1000;

// Everything loaded so far (initial page plus any infinite-scroll pages),
// so navigating away and back doesn't re-fetch — and re-paginate — posts
// already on screen.
export type BlogCacheState = {
  posts: BlogPost[];
  nextCursor: string | null;
  hasMore: boolean;
};

export function readBlogCache(): BlogCacheState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: BlogCacheState; fetchedAt: number };
    if (Date.now() - parsed.fetchedAt > TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

export function writeBlogCache(data: BlogCacheState) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, fetchedAt: Date.now() }));
  } catch {
    // ignore (private browsing, storage full, etc.)
  }
}
