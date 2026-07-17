"use client";

import { useLanguage, type Lang } from "@/context/LanguageContext";
import { useTranslations } from "@/lib/useTranslations";
import common from "@/content/common.json";

const OPTIONS: Lang[] = ["zh", "en"];

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const t = useTranslations(common);

  return (
    <div className="flex items-center rounded-full bg-white/15 p-1" role="group" aria-label="Language">
      {OPTIONS.map((option) => {
        const active = lang === option;
        return (
          <button
            key={option}
            type="button"
            disabled={active}
            onClick={() => setLang(option)}
            className={
              active
                ? "rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#ca4141]"
                : "rounded-full px-3 py-1 text-xs font-semibold text-white/70 hover:text-white disabled:cursor-default"
            }
          >
            {t.languageSwitch[option]}
          </button>
        );
      })}
    </div>
  );
}
