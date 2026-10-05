import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getBookById, toDisplayableImageSrc } from "@/lib/notion";

// Same reason as blog/[id]/layout.tsx: the page renders in the browser, so
// the share preview has to come from here.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const book = await getBookById(id).catch(() => null);
  if (!book) return {};

  const description = [book.author, book.originalTitle].filter(Boolean).join(" · ");
  const image = book.cover ? toDisplayableImageSrc(book.cover) : undefined;
  return {
    title: book.title,
    description: description || undefined,
    // openGraph replaces the root layout's object rather than merging into it.
    openGraph: {
      siteName: "YiCheng",
      title: book.title,
      description: description || undefined,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: "summary",
      title: book.title,
      description: description || undefined,
      images: image ? [image] : undefined,
    },
  };
}

export default function BookLayout({ children }: { children: ReactNode }) {
  return children;
}
