'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslations } from '@/lib/useTranslations'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { useLanguage } from '@/context/LanguageContext'
import content from '@/content/blog.json'
import common from '@/content/common.json'
import BlogCard from '@/components/BlogCard'
import BlogLayoutToggle, {
  type BlogLayout,
} from '@/components/BlogLayoutToggle'
import Spinner from '@/components/Spinner'
import {
  readBlogCache,
  readCategoriesCache,
  writeBlogCache,
  writeCategoriesCache,
} from '@/lib/blogCache'
import type { BlogPost, BlogPostPage } from '@/lib/blog'

const LAYOUT_KEY = 'blog-layout'

export default function BlogPage() {
  const t = useTranslations(content)
  const { lang } = useLanguage()
  const { nav, siteName } = useTranslations(common)
  useDocumentTitle(`${nav.blog} · ${siteName}`)
  const [posts, setPosts] = useState<BlogPost[] | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [layout, setLayout] = useState<BlogLayout>('list')
  const [categories, setCategories] = useState<string[] | null>(null)
  const [category, setCategory] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  // Mirrors the latest state into refs so the IntersectionObserver (set up
  // once, never torn down/recreated) can always act on current values
  // without needing to be recreated whenever they change.
  const stateRef = useRef({ hasMore, nextCursor, loadingMore, category })
  stateRef.current = { hasMore, nextCursor, loadingMore, category }

  // useLayoutEffect, not useEffect — this runs before the browser paints,
  // so switching away from the "list" default (when a different layout was
  // saved from a previous visit) doesn't flash the default on screen first.
  useLayoutEffect(() => {
    const stored = localStorage.getItem(LAYOUT_KEY)
    if (stored === 'list' || stored === 'grid') setLayout(stored)
  }, [])

  const handleLayoutChange = (next: BlogLayout) => {
    setLayout(next)
    localStorage.setItem(LAYOUT_KEY, next)
  }

  // The category pills need every category with at least one published
  // post, not just the ones among whatever page happens to be loaded —
  // fetched once, independent of pagination/filtering. Cached the same way
  // as the post list (and checked first) so a cache hit shows the pills
  // immediately alongside the posts instead of one request behind them.
  useEffect(() => {
    const cached = readCategoriesCache()
    if (cached) {
      setCategories(cached)
      return
    }
    let cancelled = false
    fetch('/api/blog/categories')
      .then((res) => res.json())
      .then((json: { categories: string[] }) => {
        if (cancelled) return
        const result = json.categories ?? []
        setCategories(result)
        writeCategoriesCache(result)
      })
      .catch(() => {
        if (!cancelled) setCategories([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Initial page load — 5 posts at a time, not the whole blog. Picks up a
  // cached, already-scrolled-further state if there is one, so coming back
  // to this page doesn't re-paginate from scratch. Also re-runs whenever the
  // category filter changes, starting that filtered view over from scratch
  // — the sessionStorage cache only ever holds the unfiltered ("all") list,
  // so a filtered view always fetches fresh rather than risk showing posts
  // from a different category.
  useEffect(() => {
    if (category === null) {
      const cached = readBlogCache()
      if (cached) {
        setPosts(cached.posts)
        setNextCursor(cached.nextCursor)
        setHasMore(cached.hasMore)
        return
      }
    } else {
      setPosts(null)
    }
    let cancelled = false
    const url =
      category === null
        ? '/api/blog'
        : `/api/blog?category=${encodeURIComponent(category)}`
    fetch(url)
      .then((res) => res.json())
      .then((json: BlogPostPage) => {
        if (cancelled) return
        const result = {
          posts: json.posts ?? [],
          nextCursor: json.nextCursor,
          hasMore: json.hasMore,
        }
        setPosts(result.posts)
        setNextCursor(result.nextCursor)
        setHasMore(result.hasMore)
        if (category === null) writeBlogCache(result)
      })
      .catch(() => {
        if (!cancelled) setPosts([])
      })
    return () => {
      cancelled = true
    }
  }, [category])

  // Infinite scroll: fetch the next page of 5 once the sentinel at the
  // bottom of the list comes into view — same feed pattern as scrolling
  // Facebook or Twitter, and it keeps each visit to this page cheap. Set up
  // once and never torn down/recreated (it reads stateRef for current
  // values instead) — recreating the observer on every state change was
  // tearing it down before it ever got a chance to report an intersection.
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { rootMargin: '600px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-checks the sentinel's actual on-screen position (rather than relying
  // on the observer's own callback, which only fires on a true/false
  // transition and can race with the fetch below) whenever a page finishes
  // loading. Needed because a short layout — e.g. the grid view's first 5
  // posts — can leave the sentinel inside the loaded margin from the start,
  // so no new intersection transition ever happens to ask for the next
  // page. Keeps loading until either the sentinel scrolls out of range or
  // hasMore turns false, at which point loadMore is a no-op.
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const rect = sentinel.getBoundingClientRect()
    const margin = 600
    const inView =
      rect.top < window.innerHeight + margin && rect.bottom > -margin
    if (inView) loadMore()
    // loadingMore is included so that once a fetch's .finally() clears it
    // (a separate microtask from the .then() that updates the other three,
    // so this effect can otherwise fire while loadingMore is still true and
    // bail out with nothing left to re-trigger it), this re-checks and
    // retries instead of getting stuck.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, hasMore, nextCursor, loadingMore])

  const loadMore = () => {
    const current = stateRef.current
    if (current.loadingMore || !current.hasMore || !current.nextCursor) return
    setLoadingMore(true)
    const categoryParam = current.category
      ? `&category=${encodeURIComponent(current.category)}`
      : ''
    fetch(`/api/blog?cursor=${encodeURIComponent(current.nextCursor)}${categoryParam}`)
      .then((res) => res.json())
      .then((json: BlogPostPage) => {
        setPosts((prev) => {
          const merged = [...(prev ?? []), ...(json.posts ?? [])]
          if (current.category === null) {
            writeBlogCache({
              posts: merged,
              nextCursor: json.nextCursor,
              hasMore: json.hasMore,
            })
          }
          return merged
        })
        setNextCursor(json.nextCursor)
        setHasMore(json.hasMore)
      })
      .catch(() => setHasMore(false))
      .finally(() => setLoadingMore(false))
  }

  return (
    <div className='flex flex-col gap-6 pt-2 sm:gap-8'>
      {/* Floats out of flow at every size — bottom-right on mobile (thumb
          reach, like the Questions page's guide planet), top-right on
          desktop. The inner div mirrors ChromeLayout's own main container
          (mx-auto max-w-7xl + the same px breakpoints) purely so its right
          edge lines up with the content column's right edge — i.e. flush
          with the grid cards — rather than an arbitrary offset. Outer div
          is pointer-events-none since it spans the full viewport width;
          only the button itself should be clickable. */}
      <div className='pointer-events-none fixed inset-x-0 bottom-4 z-30 md:top-22 md:bottom-auto'>
        <div className='mx-auto flex max-w-7xl justify-end px-4 sm:px-6 lg:px-10'>
          <div className='pointer-events-auto'>
            <BlogLayoutToggle layout={layout} onChange={handleLayoutChange} />
          </div>
        </div>
      </div>

      {categories !== null && categories.length > 0 && (
        <div className='flex flex-wrap justify-center gap-2'>
          <button
            type='button'
            onClick={() => setCategory(null)}
            className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              category === null
                ? 'bg-[#F2A341] text-black'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
            }`}
          >
            {t.allCategories}
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type='button'
              onClick={() => setCategory(c)}
              className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                category === c
                  ? 'bg-[#F2A341] text-black'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
              }`}
            >
              ＃{c}
            </button>
          ))}
        </div>
      )}

      {posts === null ? (
        <div className='flex justify-center py-16'>
          <Spinner size={36} />
        </div>
      ) : posts.length === 0 ? (
        <p className='text-sm text-neutral-500 dark:text-neutral-400'>
          {t.emptyList}
        </p>
      ) : layout === 'list' ? (
        // Matches the grid layout's md:mt-6 below, so switching between the
        // two doesn't shift where the first post starts.
        <div className='mx-auto flex w-full max-w-2xl flex-col md:mt-6'>
          {posts.map((post) => (
            <BlogCard
              key={post.id}
              post={post}
              variant='list'
              formattedDate={formatPostDate(post.date, lang)}
            />
          ))}
        </div>
      ) : (
        // Extra top margin on desktop only — the floating toggle sits fixed
        // at the same height the grid's featured card would otherwise start
        // at, so without this the two overlap on initial (unscrolled) load.
        <div className='md:mt-6'>
          <BlogGrid posts={posts} lang={lang} readMoreLabel={t.readMore} />
        </div>
      )}

      <div ref={sentinelRef} className='flex justify-center py-6'>
        {loadingMore && <Spinner size={28} />}
      </div>
    </div>
  )
}

function formatPostDate(date: string | null, lang: 'zh' | 'en') {
  return date
    ? new Date(date).toLocaleDateString(lang === 'zh' ? 'zh-TW' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null
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
  posts: BlogPost[]
  lang: 'zh' | 'en'
  readMoreLabel: string
}) {
  const [newest, second, third, ...rest] = posts

  return (
    <div className='flex flex-col gap-4 sm:gap-6'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:grid-rows-2 sm:gap-6'>
        <BlogCard
          post={newest}
          variant='grid'
          size='large'
          className='sm:row-span-2'
          readMoreLabel={readMoreLabel}
          formattedDate={formatPostDate(newest.date, lang)}
        />
        {second && (
          <BlogCard
            post={second}
            variant='grid'
            size='small'
            readMoreLabel={readMoreLabel}
            formattedDate={formatPostDate(second.date, lang)}
          />
        )}
        {third && (
          <BlogCard
            post={third}
            variant='grid'
            size='small'
            readMoreLabel={readMoreLabel}
            formattedDate={formatPostDate(third.date, lang)}
          />
        )}
      </div>

      {rest.length > 0 && (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6'>
          {rest.map((post) => (
            <BlogCard
              key={post.id}
              post={post}
              variant='grid'
              size='small'
              readMoreLabel={readMoreLabel}
              formattedDate={formatPostDate(post.date, lang)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
