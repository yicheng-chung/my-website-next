"use client";

import { useLanguage, type Lang } from "@/context/LanguageContext";

/**
 * Takes a `{ zh: {...}, en: {...} }` dictionary (as imported from a JSON
 * file in src/content/) and returns the slice matching the current language.
 */
export function useTranslations<T>(dict: Record<Lang, T>): T {
  const { lang } = useLanguage();
  return dict[lang];
}
