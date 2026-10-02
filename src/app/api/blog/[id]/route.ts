import { NextResponse } from "next/server";
import { getPageContent } from "@/lib/notion";
import { getBlogPostById } from "@/lib/blog";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [content, post] = await Promise.all([getPageContent(id), getBlogPostById(id)]);
    return NextResponse.json({ content, post });
  } catch {
    return NextResponse.json({ content: [], post: null }, { status: 200 });
  }
}
