"use client";

import { useLanguage, type Lang } from "@/context/LanguageContext";
import { useTranslations } from "@/lib/useTranslations";
import common from "@/content/common.json";

const OPTIONS: Lang[] = ["zh", "en"];

// fullWidth: the mobile menu's version — stretches to the menu's width,
// with each option taking an equal half (see ThemeToggle's matching one).
export default function LanguageToggle({ fullWidth = false }: { fullWidth?: boolean }) {
  const { lang, setLang } = useLanguage();
  const t = useTranslations(common);

  return (
    <div
      className={`${fullWidth ? "flex w-full" : "flex"} items-center rounded-full bg-white/15 p-1 dark:bg-black/10`}
      role="group"
      aria-label="Language"
    >
      {OPTIONS.map((option) => {
        const active = lang === option;
        return (
          <button
            key={option}
            type="button"
            disabled={active}
            onClick={() => setLang(option)}
            className={`${
              fullWidth ? "flex-1 py-2 text-sm" : "px-3 py-1 text-xs"
            } ${
              active
                ? "rounded-full bg-white font-semibold text-[#F2A341] dark:bg-black dark:text-[#F6B45E]"
                : "cursor-pointer rounded-full font-semibold text-white/70 hover:text-white dark:text-black/60 dark:hover:text-black"
            }`}
          >
            {t.languageSwitch[option]}
          </button>
        );
      })}
    </div>
  );
}
