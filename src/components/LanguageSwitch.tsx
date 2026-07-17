"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useTranslations } from "@/lib/useTranslations";
import common from "@/content/common.json";

export default function LanguageSwitch() {
  const { lang, setLang } = useLanguage();
  const t = useTranslations(common);

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col overflow-hidden rounded-lg shadow-lg">
      <button
        type="button"
        disabled={lang === "zh"}
        onClick={() => setLang("zh")}
        className="px-4 py-2 text-sm font-semibold bg-slate-800 text-white disabled:bg-slate-500 disabled:cursor-default hover:bg-slate-700 disabled:hover:bg-slate-500"
      >
        {t.languageSwitch.zh}
      </button>
      <button
        type="button"
        disabled={lang === "en"}
        onClick={() => setLang("en")}
        className="px-4 py-2 text-sm font-semibold bg-white text-slate-800 disabled:bg-slate-200 disabled:cursor-default hover:bg-slate-100 disabled:hover:bg-slate-200"
      >
        {t.languageSwitch.en}
      </button>
    </div>
  );
}
