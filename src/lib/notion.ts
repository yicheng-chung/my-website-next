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
