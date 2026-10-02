import { NextRequest, NextResponse } from "next/server";
import { getBlogPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const cursor = request.nextUrl.searchParams.get("cursor");
    const result = await getBlogPosts({ pageSize: 5, cursor });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ posts: [], nextCursor: null, hasMore: false }, { status: 200 });
  }
}
