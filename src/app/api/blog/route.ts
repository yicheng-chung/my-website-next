import { NextResponse } from "next/server";
import { getBlogPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const posts = await getBlogPosts();
    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ posts: [] }, { status: 200 });
  }
}
