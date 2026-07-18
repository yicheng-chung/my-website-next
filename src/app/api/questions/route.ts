import { NextResponse } from "next/server";
import { getQuestions } from "@/lib/questions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const questions = await getQuestions();
    return NextResponse.json({ questions });
  } catch {
    return NextResponse.json({ questions: [] }, { status: 200 });
  }
}
