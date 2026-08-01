import { NextResponse } from "next/server";
import { getPageContent } from "@/lib/notion";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const content = await getPageContent(id);
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ content: [] }, { status: 200 });
  }
}
