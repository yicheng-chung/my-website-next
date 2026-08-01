import { NextResponse } from "next/server";
import { translateTexts } from "@/lib/translate";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { texts } = (await req.json()) as { texts?: unknown };
    if (!Array.isArray(texts) || !texts.every((t) => typeof t === "string")) {
      return NextResponse.json({ error: "texts must be a string array" }, { status: 400 });
    }
    const translated = await translateTexts(texts, "en");
    return NextResponse.json({ texts: translated });
  } catch {
    return NextResponse.json({ error: "translation failed" }, { status: 502 });
  }
}
