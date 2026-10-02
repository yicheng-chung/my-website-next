import { getFirstImageUrl, getPlainTextExcerpt } from "./notion";

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  date: string | null;
  category: string | null;
  cover: string | null;
  // True only when `cover` was pulled from the post's own content (see
  // getBlogPosts below) rather than a real Notion page cover — the detail
  // page uses this to skip re-showing it below the article, since it's
  // already sitting there as part of the content itself.
  coverFromContent: boolean;
};

type NotionRichText = { plain_text: string };

type NotionBlogPage = {
  id: string;
  created_time: string;
  cover?: { type: "external" | "file"; external?: { url: string }; file?: { url: string } } | null;
  properties: {
    標題?: { title?: NotionRichText[] };
    狀態?: { status?: { name: string } | null };
    類型?: { select?: { name: string } | null };
  };
};

function plainText(rich: NotionRichText[] | undefined): string {
  return (rich ?? []).map((t) => t.plain_text).join("");
}

function parseBlogPostBase(page: NotionBlogPage): Omit<BlogPost, "excerpt"> {
  const props = page.properties;
  const cover =
    page.cover?.type === "external" ? page.cover.external?.url ?? null : page.cover?.file?.url ?? null;

  return {
    id: page.id,
    title: plainText(props.標題?.title).trim(),
    date: page.created_time ?? null,
    category: props.類型?.select?.name ?? null,
    cover,
    coverFromContent: false,
  };
}

export type BlogPostPage = {
  posts: BlogPost[];
  nextCursor: string | null;
  hasMore: boolean;
};

// Only 狀態 = 已發布 posts are returned — everything else (靈感/草稿/修稿中/封存)
// stays a draft that isn't visible on the site. Paginated (default 5 at a
// time) rather than fetching everything up front — each post without its
// own Notion cover costs an extra content-scanning request (getFirstImageUrl
// below), so pulling the whole list in one go gets expensive as the blog
// grows. The client fetches more pages as the reader scrolls.
export async function getBlogPosts(options?: {
  pageSize?: number;
  cursor?: string | null;
}): Promise<BlogPostPage> {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_BLOG_DATABASE_ID;
  if (!token || !databaseId) return { posts: [], nextCursor: null, hasMore: false };

  const pageSize = options?.pageSize ?? 5;

  const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filter: { property: "狀態", status: { equals: "已發布" } },
      sorts: [{ timestamp: "created_time", direction: "descending" }],
      page_size: pageSize,
      ...(options?.cursor ? { start_cursor: options.cursor } : {}),
    }),
    cache: "no-store",
  });

  if (!res.ok) return { posts: [], nextCursor: null, hasMore: false };
  const data = await res.json();
  const pages = (data.results as NotionBlogPage[]).filter(
    (p) => plainText(p.properties.標題?.title).trim()
  );

  const posts = await Promise.all(
    pages.map(async (page) => {
      const base = parseBlogPostBase(page);
      const excerpt = await getPlainTextExcerpt(page.id);

      // Falls back to a photo pulled from the post's own content when it
      // has no Notion page cover set — every post gets this, so each one
      // can show a thumbnail if it actually has an image somewhere in it.
      // Stays null (no thumbnail) otherwise.
      if (!base.cover) {
        base.cover = await getFirstImageUrl(page.id);
        base.coverFromContent = base.cover !== null;
      }

      return { ...base, excerpt };
    })
  );

  return {
    posts,
    nextCursor: data.next_cursor ?? null,
    hasMore: Boolean(data.has_more),
  };
}

// Looks up one post's own metadata directly by page id, rather than paging
// through the list — needed because the list is now paginated, so a post
// the reader hasn't scrolled to yet (or opened via a direct link) won't be
// sitting in the client's already-loaded posts.
export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const token = process.env.NOTION_TOKEN;
  if (!token) return null;

  const res = await fetch(`https://api.notion.com/v1/pages/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
    },
    cache: "no-store",
  });

  if (!res.ok) return null;
  const page = (await res.json()) as NotionBlogPage;
  if (!plainText(page.properties.標題?.title).trim()) return null;

  const base = parseBlogPostBase(page);
  const excerpt = await getPlainTextExcerpt(id);
  if (!base.cover) {
    base.cover = await getFirstImageUrl(id);
    base.coverFromContent = base.cover !== null;
  }

  return { ...base, excerpt };
}
