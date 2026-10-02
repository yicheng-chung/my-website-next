import type { BlogPost } from "./blog";

// sessionStorage rather than a module-level variable — see notionCache.ts,
// same reasoning (module re-evaluation across client-side route transitions).
const CACHE_KEY = "blog-posts-cache";
const CATEGORIES_CACHE_KEY = "blog-categories-cache";
const TTL_MS = 5 * 60 * 1000;

function readCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: T; fetchedAt: number };
    if (Date.now() - parsed.fetchedAt > TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, fetchedAt: Date.now() }));
  } catch {
    // ignore (private browsing, storage full, etc.)
  }
}

// Everything loaded so far (initial page plus any infinite-scroll pages),
// so navigating away and back doesn't re-fetch — and re-paginate — posts
// already on screen.
export type BlogCacheState = {
  posts: BlogPost[];
  nextCursor: string | null;
  hasMore: boolean;
};

export function readBlogCache(): BlogCacheState | null {
  return readCache<BlogCacheState>(CACHE_KEY);
}

export function writeBlogCache(data: BlogCacheState) {
  writeCache(CACHE_KEY, data);
}

// Cached separately from the posts above (it's its own request on its own
// schedule) so the category pills can render immediately alongside a
// cache-hit post list, instead of lagging a beat behind for a fresh network
// round trip every single visit.
export function readCategoriesCache(): string[] | null {
  return readCache<string[]>(CATEGORIES_CACHE_KEY);
}

export function writeCategoriesCache(categories: string[]) {
  writeCache(CATEGORIES_CACHE_KEY, categories);
}
