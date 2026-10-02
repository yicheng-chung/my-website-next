import { NextResponse } from "next/server";
import { getPageContent } from "@/lib/notion";
import { getAdjacentPosts, getBlogPostById } from "@/lib/blog";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [content, post, adjacent] = await Promise.all([
      getPageContent(id),
      getBlogPostById(id),
      getAdjacentPosts(id),
    ]);
    return NextResponse.json({ content, post, adjacent });
  } catch {
    return NextResponse.json({ content: [], post: null, adjacent: { prev: null, next: null } }, { status: 200 });
  }
}
