export interface QuestionEntry {
  id: string;
  title: string;
  titleEn?: string;
  date?: string;
  thoughts?: string;
  thoughtsEn?: string;
  answer?: string;
  answerEn?: string;
  favorite?: boolean;
}

type NotionRichText = { plain_text: string };

type NotionQuestionPage = {
  id: string;
  properties: {
    問題?: { title?: NotionRichText[] };
    英文版問題?: { rich_text?: NotionRichText[] };
    答案?: { rich_text?: NotionRichText[] };
    英文版答案?: { rich_text?: NotionRichText[] };
    想法?: { rich_text?: NotionRichText[] };
    英文版想法?: { rich_text?: NotionRichText[] };
    特別喜歡的問題?: { checkbox?: boolean };
    建立時間?: { created_time?: string };
  };
};

function plainText(rich: NotionRichText[] | undefined): string {
  return (rich ?? []).map((t) => t.plain_text).join("");
}

function parseQuestion(page: NotionQuestionPage): QuestionEntry {
  const props = page.properties;
  const title = plainText(props.問題?.title).trim();
  const titleEn = plainText(props.英文版問題?.rich_text).trim() || undefined;
  const answer = plainText(props.答案?.rich_text).trim() || undefined;
  const answerEn = plainText(props.英文版答案?.rich_text).trim() || undefined;
  const thoughts = plainText(props.想法?.rich_text).trim() || undefined;
  const thoughtsEn = plainText(props.英文版想法?.rich_text).trim() || undefined;
  const createdTime = props.建立時間?.created_time;

  return {
    id: page.id,
    title,
    titleEn,
    date: createdTime ? createdTime.slice(0, 10) : undefined,
    thoughts,
    thoughtsEn,
    answer,
    answerEn,
    favorite: props.特別喜歡的問題?.checkbox ?? false,
  };
}

export async function getQuestions(): Promise<QuestionEntry[]> {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_QUESTIONS_DATABASE_ID;
  if (!token || !databaseId) return [];

  const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sorts: [{ property: "建立時間", direction: "descending" }],
      page_size: 100,
    }),
    cache: "no-store",
  });

  if (!res.ok) return [];
  const data = await res.json();
  return (data.results as NotionQuestionPage[]).map(parseQuestion).filter((q) => q.title);
}
