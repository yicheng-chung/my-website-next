// Free, no-API-key translation via Google Translate's public "gtx" client —
// the same unofficial endpoint many free translate widgets use. Quality is
// serviceable, not literary, and there's no SLA — good enough for a personal
// blog's "read this in English" button (per yicheng, chose free over paying
// for a real translation API).
async function translateOne(text: string, target: string): Promise<string> {
  if (!text.trim()) return text;

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`translate request failed: ${res.status}`);

  const data = await res.json();
  const segments = data[0] as [string, string, ...unknown[]][] | null;
  if (!segments) return text;
  return segments.map((seg) => seg[0]).join("");
}

export async function translateTexts(texts: string[], target = "en"): Promise<string[]> {
  return Promise.all(texts.map((t) => translateOne(t, target)));
}
