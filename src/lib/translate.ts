// Free, no-API-key translation via Google Translate's public "gtx" client —
// the same unofficial endpoint many free translate widgets use. Quality is
// serviceable, not literary, and there's no SLA — good enough for a personal
// blog's "read this in English" button (per yicheng, chose free over paying
// for a real translation API).
//
// Runs in the visitor's browser, not on the server: Google answers
// server-side (Node) requests with a 429 "Sorry..." bot page — from Vercel
// and locally alike — while the same request from a browser goes through
// (the endpoint allows any origin). Each visitor also uses their own
// connection, rather than every request piling up on one server IP.

const ENDPOINT = "https://translate.googleapis.com/translate_a/single";

// Long paragraphs go out in pieces so the GET URL stays a sane length;
// split after sentence-ending punctuation where possible.
const MAX_CHUNK = 1500;
// A few requests at a time rather than one per block all at once.
const CONCURRENCY = 4;

function chunk(text: string): string[] {
  if (text.length <= MAX_CHUNK) return [text];
  const pieces: string[] = [];
  let rest = text;
  while (rest.length > MAX_CHUNK) {
    const head = rest.slice(0, MAX_CHUNK);
    const cut = Math.max(
      head.lastIndexOf("。"),
      head.lastIndexOf("！"),
      head.lastIndexOf("？"),
      head.lastIndexOf(". "),
      head.lastIndexOf("\n")
    );
    const at = cut > MAX_CHUNK / 2 ? cut + 1 : MAX_CHUNK;
    pieces.push(rest.slice(0, at));
    rest = rest.slice(at);
  }
  if (rest) pieces.push(rest);
  return pieces;
}

async function requestOnce(text: string, target: string): Promise<string> {
  const url = `${ENDPOINT}?client=gtx&sl=auto&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`translate request failed: ${res.status}`);
  const data = await res.json();
  const segments = data[0] as [string, string, ...unknown[]][] | null;
  if (!segments) return text;
  return segments.map((seg) => seg[0]).join("");
}

// One retry after a short pause — a single hiccup shouldn't fail the post.
async function requestWithRetry(text: string, target: string): Promise<string> {
  try {
    return await requestOnce(text, target);
  } catch {
    await new Promise((r) => setTimeout(r, 800));
    return requestOnce(text, target);
  }
}

async function translateOne(text: string, target: string): Promise<string> {
  if (!text.trim()) return text;
  const parts = await Promise.all(chunk(text).map((p) => requestWithRetry(p, target)));
  return parts.join("");
}

// Same order out as in. Runs at most CONCURRENCY at a time.
async function translateAll(texts: string[], target: string): Promise<string[]> {
  const out: string[] = new Array(texts.length);
  let next = 0;
  async function worker() {
    while (next < texts.length) {
      const i = next++;
      out[i] = await translateOne(texts[i], target);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, texts.length) }, worker));
  return out;
}

// Remembered per post in localStorage, so a post translated once comes
// back instantly on the next visit or reload. Keyed on the source text too
// (a cheap hash), so an edited post gets translated afresh. Storage can be
// unavailable or full — then it just translates every time.
const CACHE_PREFIX = "blog-translation:";

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return String(h);
}

export async function translateTexts(
  texts: string[],
  { cacheKey, target = "en" }: { cacheKey: string; target?: string }
): Promise<string[]> {
  const key = `${CACHE_PREFIX}${target}:${cacheKey}`;
  const source = hash(texts.join("\u0000"));
  try {
    const cached = JSON.parse(localStorage.getItem(key) ?? "null");
    if (cached?.source === source && Array.isArray(cached.texts)) return cached.texts;
  } catch {}

  const translated = await translateAll(texts, target);
  try {
    localStorage.setItem(key, JSON.stringify({ source, texts: translated }));
  } catch {}
  return translated;
}
