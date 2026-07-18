"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-7 w-7 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
