"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  forceDark: () => void;
  clearForceDark: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "my-website-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Defaults to dark for first-time visitors (no stored preference) — matches
  // the inline THEME_INIT_SCRIPT in layout.tsx, which paints dark before this
  // ever mounts.
  const [theme, setThemeState] = useState<Theme>("dark");
  // Counter, not a boolean, so nested/overlapping forcers (or React StrictMode's
  // double-invoked effects in dev) can't clear each other's force prematurely.
  const [forceCount, setForceCount] = useState(0);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", forceCount > 0 || theme === "dark");
  }, [theme, forceCount]);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  const forceDark = () => setForceCount((c) => c + 1);
  const clearForceDark = () => setForceCount((c) => Math.max(0, c - 1));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, forceDark, clearForceDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
