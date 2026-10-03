import { NextRequest, NextResponse } from "next/server";
import convert from "heic-convert";
import { isHeicUrl } from "@/lib/notion";

export const dynamic = "force-dynamic";

// Only ever meant to be called with the HEIC/HEIF urls toDisplayableImageSrc
// (src/lib/notion.ts) builds — this is a public GET route, so the isHeicUrl
// + https-only check below also keeps it from doubling as a general
// fetch-any-url proxy.
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url || !url.startsWith("https://") || !isHeicUrl(url)) {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, { cache: "no-store" });
  } catch {
    return NextResponse.json({ error: "Upstream fetch failed" }, { status: 502 });
  }
  if (!upstream.ok) {
    return NextResponse.json({ error: "Upstream fetch failed" }, { status: 502 });
  }

  try {
    const buffer = Buffer.from(await upstream.arrayBuffer());
    // This project's own sharp build has no libheif input support (so
    // routing through next/image's optimizer wouldn't help either) — this
    // pure-JS decoder works regardless of what's compiled into sharp.
    const jpeg = await convert({ buffer, format: "JPEG", quality: 0.85 });
    return new NextResponse(Buffer.from(jpeg), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Conversion failed" }, { status: 500 });
  }
}
