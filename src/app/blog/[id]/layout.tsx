import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getBlogPostById } from "@/lib/blog";
import { toDisplayableImageSrc } from "@/lib/notion";

// The page itself is a client component (it fetches the post in the
// browser), so this server layout is what gives a shared link its title,
// excerpt and cover — LINE/Facebook/etc. only read the first HTML response
// and never run the page's JavaScript.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getBlogPostById(id).catch(() => null);
  if (!post) return {};

  const image = post.cover ? toDisplayableImageSrc(post.cover) : undefined;
  return {
    title: post.title,
    description: post.excerpt,
    // openGraph replaces the root layout's object rather than merging into it.
    openGraph: {
      siteName: "YiCheng",
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date ?? undefined,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: post.title,
      description: post.excerpt,
      images: image ? [image] : undefined,
    },
  };
}

export default function BlogPostLayout({ children }: { children: ReactNode }) {
  return children;
}
