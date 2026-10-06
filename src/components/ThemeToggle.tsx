"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme, type Theme } from "@/context/ThemeContext";
import { useTranslations } from "@/lib/useTranslations";
import common from "@/content/common.json";

const OPTIONS: { value: Theme; Icon: typeof Sun }[] = [
  { value: "light", Icon: Sun },
  { value: "dark", Icon: Moon },
];

// fullWidth: the mobile menu's version — a two-option pill laid out the
// same way as LanguageToggle's fullWidth one, so the two read as a pair.
export default function ThemeToggle({ fullWidth = false }: { fullWidth?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const t = useTranslations(common);
  const isDark = theme === "dark";

  if (fullWidth) {
    return (
      <div
        className="flex w-full items-center rounded-full bg-white/15 p-1 dark:bg-black/10"
        role="group"
        aria-label="Theme"
      >
        {OPTIONS.map(({ value, Icon }) => {
          const active = theme === value;
          return (
            <button
              key={value}
              type="button"
              disabled={active}
              onClick={toggleTheme}
              className={
                active
                  ? "flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white py-2 text-sm font-semibold text-[#F2A341] dark:bg-black dark:text-[#F6B45E]"
                  : "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold text-white/70 hover:text-white dark:text-black/60 dark:hover:text-black"
              }
            >
              <Icon size={15} />
              {t.themeSwitch[value]}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-7 w-7 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 dark:bg-black/10 dark:text-black dark:hover:bg-black/20"
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
