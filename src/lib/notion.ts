export type Book = {
  id: string;
  title: string;
  originalTitle: string | null;
  author: string;
  cover: string | null;
  status: string;
  progress: number | null;
  categories: string[];
  url: string;
  startDate: string | null;
  rating: string | null;
};

type NotionRichText = { plain_text: string };

type NotionPage = {
  id: string;
  url: string;
  properties: {
    書名?: { rich_text?: NotionRichText[] };
    名稱?: { title?: NotionRichText[] };
    作者?: { multi_select?: { name: string }[] };
    書本封面?: {
      files?: { external?: { url: string }; file?: { url: string } }[];
    };
    閱讀狀態?: { status?: { name: string } };
    "閱讀進度 (百分比)"?: { formula?: { type: string; number?: number } };
    類別?: { multi_select?: { name: string }[] };
    開始閱讀日期?: { date?: { start: string } | null };
    評分?: { select?: { name: string } | null };
  };
};

function plainText(rich: NotionRichText[] | undefined): string {
  return (rich ?? []).map((t) => t.plain_text).join("");
}

function parseBook(page: NotionPage): Book {
  const props = page.properties;
  const title = plainText(props.名稱?.title).trim();
  const bookNameLines = plainText(props.書名?.rich_text).split("\n");
  const originalTitle = bookNameLines[1]?.trim() || null;
  const author = (props.作者?.multi_select ?? []).map((a) => a.name).join("、");
  const cover =
    props.書本封面?.files?.[0]?.external?.url ?? props.書本封面?.files?.[0]?.file?.url ?? null;

  const formula = props["閱讀進度 (百分比)"]?.formula;
  const progress =
    formula?.type === "number" && typeof formula.number === "number"
      ? Math.round(formula.number * 1000) / 10
      : null;

  return {
    id: page.id,
    title,
    originalTitle,
    author,
    cover,
    status: props.閱讀狀態?.status?.name ?? "",
    progress,
    categories: (props.類別?.multi_select ?? []).map((c) => c.name),
    url: page.url,
    startDate: props.開始閱讀日期?.date?.start ?? null,
    rating: props.評分?.select?.name ?? null,
  };
}

async function queryByStatus(status: string, sortProperty: string): Promise<Book[]> {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!token || !databaseId) return [];

  const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filter: { property: "閱讀狀態", status: { equals: status } },
      sorts: [{ property: sortProperty, direction: "descending" }],
      page_size: 50,
    }),
    cache: "no-store",
  });

  if (!res.ok) return [];
  const data = await res.json();
  return (data.results as NotionPage[]).map(parseBook);
}

export async function getReadingBooks(): Promise<Book[]> {
  return queryByStatus("正在閱讀", "開始閱讀日期");
}

export async function getFinishedBooks(): Promise<Book[]> {
  return queryByStatus("已完成", "結束閱讀日期");
}

// A book's own reflection ("讀後心得") lives in the Notion *page's content*
// (blocks), not in the database row properties above. Empirically, every
// book page wraps its reflection in a single callout block (with an
// internal label heading like "回顧區" as its first child) — the site
// supplies its own "讀後心得" heading, so getBookReflection below targets
// that callout specifically and drops its leading label.
//
// Each page also has an inline "chapter notes" database nested in it
// (a child_database block) for granular per-chapter annotation. That's left
// alone here — it's a personal tool with its own ad-hoc structure, not
// something the site tries to render (see conversation with yicheng).

export type ContentSpan = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  href?: string | null;
};

export type ContentBlock =
  | { type: "heading_1" | "heading_2" | "heading_3"; spans: ContentSpan[] }
  | { type: "paragraph"; spans: ContentSpan[] }
  | { type: "bulleted_list_item" | "numbered_list_item"; spans: ContentSpan[] }
  | { type: "quote"; spans: ContentSpan[] }
  | { type: "callout"; spans: ContentSpan[]; icon: string | null; children: ContentBlock[] }
  | { type: "toggle"; spans: ContentSpan[]; children: ContentBlock[] }
  | { type: "divider" }
  | { type: "image"; url: string; caption: ContentSpan[] };

type NotionBlockRichText = {
  plain_text: string;
  href: string | null;
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    code?: boolean;
  };
};

type NotionBlock = {
  id: string;
  type: string;
  has_children: boolean;
  paragraph?: { rich_text: NotionBlockRichText[] };
  heading_1?: { rich_text: NotionBlockRichText[] };
  heading_2?: { rich_text: NotionBlockRichText[] };
  heading_3?: { rich_text: NotionBlockRichText[] };
  bulleted_list_item?: { rich_text: NotionBlockRichText[] };
  numbered_list_item?: { rich_text: NotionBlockRichText[] };
  quote?: { rich_text: NotionBlockRichText[] };
  callout?: { rich_text: NotionBlockRichText[]; icon?: { type: string; emoji?: string } };
  toggle?: { rich_text: NotionBlockRichText[] };
  image?: {
    type: "external" | "file";
    external?: { url: string };
    file?: { url: string };
    caption?: NotionBlockRichText[];
  };
};

function toSpans(rich: NotionBlockRichText[] | undefined): ContentSpan[] {
  return (rich ?? []).map((t) => ({
    text: t.plain_text,
    bold: t.annotations?.bold,
    italic: t.annotations?.italic,
    strikethrough: t.annotations?.strikethrough,
    code: t.annotations?.code,
    href: t.href,
  }));
}

async function fetchBlockChildren(blockId: string, token: string): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = [];
  let cursor: string | undefined;

  do {
    const url = new URL(`https://api.notion.com/v1/blocks/${blockId}/children`);
    url.searchParams.set("page_size", "100");
    if (cursor) url.searchParams.set("start_cursor", cursor);

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
      },
      cache: "no-store",
    });
    if (!res.ok) break;

    const data = await res.json();
    blocks.push(...(data.results as NotionBlock[]));
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return blocks;
}

async function parseBlocks(blocks: NotionBlock[], token: string): Promise<ContentBlock[]> {
  const result: ContentBlock[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case "paragraph":
        result.push({ type: "paragraph", spans: toSpans(block.paragraph?.rich_text) });
        break;
      case "heading_1":
        result.push({ type: "heading_1", spans: toSpans(block.heading_1?.rich_text) });
        break;
      case "heading_2":
        result.push({ type: "heading_2", spans: toSpans(block.heading_2?.rich_text) });
        break;
      case "heading_3":
        result.push({ type: "heading_3", spans: toSpans(block.heading_3?.rich_text) });
        break;
      case "bulleted_list_item":
        result.push({
          type: "bulleted_list_item",
          spans: toSpans(block.bulleted_list_item?.rich_text),
        });
        break;
      case "numbered_list_item":
        result.push({
          type: "numbered_list_item",
          spans: toSpans(block.numbered_list_item?.rich_text),
        });
        break;
      case "quote":
        result.push({ type: "quote", spans: toSpans(block.quote?.rich_text) });
        break;
      case "callout": {
        const children = block.has_children
          ? await parseBlocks(await fetchBlockChildren(block.id, token), token)
          : [];
        result.push({
          type: "callout",
          spans: toSpans(block.callout?.rich_text),
          icon: block.callout?.icon?.emoji ?? null,
          children,
        });
        break;
      }
      case "toggle": {
        const children = block.has_children
          ? await parseBlocks(await fetchBlockChildren(block.id, token), token)
          : [];
        result.push({ type: "toggle", spans: toSpans(block.toggle?.rich_text), children });
        break;
      }
      case "divider":
        result.push({ type: "divider" });
        break;
      case "image": {
        const url =
          block.image?.type === "external" ? block.image.external?.url : block.image?.file?.url;
        if (url) {
          result.push({ type: "image", url, caption: toSpans(block.image?.caption) });
        }
        break;
      }
      default:
        // Unsupported block type (table, embed, etc.) — skip rather than break the page.
        break;
    }
  }

  return result;
}

function isEmptyParagraph(block: NotionBlock): boolean {
  return block.type === "paragraph" && (block.paragraph?.rich_text?.length ?? 0) === 0;
}

// The rule (per yicheng): everything on the page that isn't per-chapter
// content counts as the reflection. In practice that means every top-level
// block EXCEPT the nested chapter-notes database/page — some books keep
// their reflection inside the "回顧區"/"讀後心得" callout, others (mostly
// older ones, written before that callout convention existed) just have it
// sitting as ordinary blocks next to an otherwise-empty callout. Both are
// flattened into one stream, in page order, so neither pattern gets missed.
export async function getBookReflection(pageId: string): Promise<ContentBlock[]> {
  const token = process.env.NOTION_TOKEN;
  if (!token) return [];

  const topLevel = await fetchBlockChildren(pageId, token);
  const flattened: NotionBlock[] = [];

  for (const block of topLevel) {
    if (block.type === "child_database" || block.type === "child_page") {
      // Per-chapter notes (the inline database, or an old-style sub-page of
      // them) — not general reflection, deliberately excluded.
      continue;
    }
    if (isEmptyParagraph(block)) {
      // Bare spacing artifact from the template, not authored content.
      continue;
    }
    if (block.type === "callout") {
      const children = block.has_children ? await fetchBlockChildren(block.id, token) : [];
      // Drop a single leading heading — that's just the internal section
      // label ("回顧區"/"讀後心得"), and the site supplies its own heading.
      // Whatever's left (if the callout holds more than just that label)
      // still counts as reflection content.
      const rest =
        children[0] && /^heading_[123]$/.test(children[0].type) ? children.slice(1) : children;
      flattened.push(...rest.filter((b) => !isEmptyParagraph(b)));
      continue;
    }
    flattened.push(block);
  }

  return parseBlocks(flattened, token);
}
