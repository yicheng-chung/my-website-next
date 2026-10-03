"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { THEME_STORAGE_KEY } from "@/lib/themeCookie";

export type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  forceDark: () => void;
  clearForceDark: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function writeCookie(value: Theme) {
  document.cookie = `${THEME_STORAGE_KEY}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: ReactNode;
  initialTheme: Theme;
}) {
  // Seeded from the server's cookie read (see layout.tsx) so this already
  // matches the SSR'd <html> class on the very first render — no separate
  // "read localStorage and correct it" effect racing against the class-sync
  // effect below, which is what caused a visible dark<->light flash on
  // every load for a returning visitor (the class-sync effect's first run
  // used to fire with this still at its old hardcoded "dark" default,
  // stomping the cookie/script-correct class before the migration effect's
  // update could land).
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  // Counter, not a boolean, so nested/overlapping forcers (or React StrictMode's
  // double-invoked effects in dev) can't clear each other's force prematurely.
  const [forceCount, setForceCount] = useState(0);

  // One-time migration: a visitor from before the theme cookie existed may
  // have a preference sitting only in localStorage, which the server can't
  // see. Adopt it and write the cookie so every future load is correct from
  // the server's first HTML byte — same pattern as LanguageContext's own
  // migration effect.
  useLayoutEffect(() => {
    if (document.cookie.includes(`${THEME_STORAGE_KEY}=`)) return;
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
      writeCookie(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", forceCount > 0 || theme === "dark");
  }, [theme, forceCount]);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
      writeCookie(next);
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
