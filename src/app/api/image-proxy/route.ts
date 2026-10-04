import { NextRequest, NextResponse } from "next/server";
import convert from "heic-convert";
import { isHeicUrl } from "@/lib/notion";

export const dynamic = "force-dynamic";

// The pure-JS HEIC decoder is what makes this work at all without a
// libheif-enabled sharp build, but it's slow — a few seconds for a typical
// iPhone photo. Converting it once and reusing that is what actually fixes
// the speed, not the output format, which was never the slow part: this
// in-memory cache keyed by the stable S3 object path (not the full url,
// whose presigned query string changes every time Notion re-signs it, but
// whose path doesn't) means a given photo only ever pays that cost once per
// server lifetime, not once per page view. It won't survive a cold start or
// land on a different warm instance, but for how little this site's blog
// images change, that's a fine trade against adding a persistent store.
const MAX_CACHE_ENTRIES = 50;
const convertedCache = new Map<string, Buffer>();

function cacheKeyFor(url: string): string {
  return url.split("?")[0];
}

// Only ever meant to be called with the HEIC/HEIF urls toDisplayableImageSrc
// (src/lib/notion.ts) builds — this is a public GET route, so the isHeicUrl
// + https-only check below also keeps it from doubling as a general
// fetch-any-url proxy.
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url || !url.startsWith("https://") || !isHeicUrl(url)) {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  const key = cacheKeyFor(url);
  const cached = convertedCache.get(key);
  if (cached) {
    return new NextResponse(new Uint8Array(cached), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Image-Proxy-Cache": "hit",
      },
    });
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
    const jpeg = Buffer.from(await convert({ buffer, format: "JPEG", quality: 0.85 }));

    if (convertedCache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = convertedCache.keys().next().value;
      if (oldestKey !== undefined) convertedCache.delete(oldestKey);
    }
    convertedCache.set(key, jpeg);

    return new NextResponse(jpeg, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Image-Proxy-Cache": "miss",
      },
    });
  } catch {
    return NextResponse.json({ error: "Conversion failed" }, { status: 500 });
  }
}
