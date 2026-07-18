import type { Book } from "./notion";

export type NotionData = { reading: Book[]; finished: Book[] };

// sessionStorage rather than a module-level variable — this app re-evaluates
// page modules across client-side route transitions, which silently discards
// plain in-memory caches (confirmed empirically on the Questions page).
const CACHE_KEY = "notion-books-cache";
const TTL_MS = 5 * 60 * 1000;

export function readNotionCache(): NotionData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: NotionData; fetchedAt: number };
    if (Date.now() - parsed.fetchedAt > TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

export function writeNotionCache(data: NotionData) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, fetchedAt: Date.now() }));
  } catch {
    // ignore (private browsing, storage full, etc.)
  }
}
