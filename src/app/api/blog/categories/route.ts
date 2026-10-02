import { NextResponse } from "next/server";
import { getBlogCategories } from "@/lib/blog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await getBlogCategories();
    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ categories: [] }, { status: 200 });
  }
}
