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

// Only 狀態 = 已發布 posts are returned — everything else (靈感/草稿/修稿中/封存)
// stays a draft that isn't visible on the site.
export async function getBlogPosts(): Promise<BlogPost[]> {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_BLOG_DATABASE_ID;
  if (!token || !databaseId) return [];

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
      page_size: 100,
    }),
    cache: "no-store",
  });

  if (!res.ok) return [];
  const data = await res.json();
  const pages = (data.results as NotionBlogPage[]).filter(
    (p) => plainText(p.properties.標題?.title).trim()
  );

  const posts = await Promise.all(
    pages.map(async (page) => ({
      ...parseBlogPostBase(page),
      excerpt: await getPlainTextExcerpt(page.id),
    }))
  );

  // Only the newest post — the large, featured slot in the list layout —
  // falls back to a photo pulled from its own content when it has no Notion
  // page cover set. The rest render without an image rather than guessing.
  const [newest, ...others] = posts;
  if (newest && !newest.cover) {
    newest.cover = await getFirstImageUrl(newest.id);
    newest.coverFromContent = newest.cover !== null;
  }

  return newest ? [newest, ...others] : posts;
}
