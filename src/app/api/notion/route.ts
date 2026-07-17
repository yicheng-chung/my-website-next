import { NextResponse } from "next/server";
import { getReadingBooks, getFinishedBooks } from "@/lib/notion";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [reading, finished] = await Promise.all([getReadingBooks(), getFinishedBooks()]);
    return NextResponse.json({ reading, finished });
  } catch {
    return NextResponse.json({ reading: [], finished: [] }, { status: 200 });
  }
}
