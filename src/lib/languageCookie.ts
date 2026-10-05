// Plain constant, no 'use client' — needs to be importable by both the
// server (template.tsx, reading the request's cookie) and the client
// (LanguageContext.tsx, writing it). A 'use client' module can't be used
// this way: Next.js turns every one of its exports into an opaque
// client-reference stub when a Server Component imports it, even a plain
// string constant.
export const LANGUAGE_STORAGE_KEY = 'my-website-lang'

// Value for <html lang> per site language — set by the server on first load
// (layout.tsx) and kept in sync by LanguageContext when the visitor toggles.
export const HTML_LANG = { zh: 'zh-TW', en: 'en' } as const
