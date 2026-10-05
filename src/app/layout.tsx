import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Script from "next/script";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider, type Theme } from "@/context/ThemeContext";
import { LanguageProvider, type Lang } from "@/context/LanguageContext";
import { HTML_LANG, LANGUAGE_STORAGE_KEY } from "@/lib/languageCookie";
import { THEME_STORAGE_KEY } from "@/lib/themeCookie";
import ChromeLayout from "@/components/ChromeLayout";

// Reading the raw cookie header and parsing it by hand, rather than using
// next/headers' cookies() — both work fine once the key constants come
// from a plain (non-'use client') module, but this was already written
// and tested against the raw header, so kept as-is.
function readCookie(cookieHeader: string | null, key: string): string | undefined {
  if (!cookieHeader) return undefined;
  for (const pair of cookieHeader.split(";")) {
    const [k, ...rest] = pair.trim().split("=");
    if (k === key) return rest.join("=");
  }
  return undefined;
}

// Migration fallback only, for a visitor from before the theme cookie
// existed: the server already bakes the right "dark" class into <html>
// below when the cookie is present, so this script only has work to do
// when it isn't (no cookie yet, but an old localStorage-only preference
// might still be sitting there) — matching the language cookie's own
// one-time migration path in ThemeContext.tsx.
const THEME_INIT_SCRIPT = `
  (function () {
    try {
      if (document.cookie.indexOf("my-website-theme=") !== -1) return;
      var stored = localStorage.getItem("my-website-theme");
      var isDark = stored !== "light";
      document.documentElement.classList.toggle("dark", isDark);
    } catch (e) {}
  })();
`;

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const SITE_DESCRIPTION =
  "貽丞的個人網站。前軟體工程師，正在成為心理師的路上。這裡放我讀的書、寫的字，和想不通的問題。";

// Share previews need absolute image URLs. Vercel sets this env var to the
// production domain on every deployment; locally it falls back to dev.
const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "YiCheng", template: "%s · YiCheng" },
  description: SITE_DESCRIPTION,
  openGraph: {
    siteName: "YiCheng",
    title: "YiCheng",
    description: SITE_DESCRIPTION,
    locale: "zh_TW",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Computed once per full page load (layout instances persist across
  // client-side navigations — unlike a template, which would remount and
  // reset this on every nav), so a returning visitor's cached language
  // is already correct in the server's very first HTML byte, with no
  // flash, and no reset when clicking between pages afterwards.
  const cookieHeader = (await headers()).get("cookie");
  const cookieLang = readCookie(cookieHeader, LANGUAGE_STORAGE_KEY);
  const initialLang: Lang = cookieLang === "zh" ? "zh" : "en";
  // No stored cookie yet (brand-new visitor, or one from before this cookie
  // existed) defaults to dark — matches the previous localStorage-only
  // default and the migration script above.
  const cookieTheme = readCookie(cookieHeader, THEME_STORAGE_KEY);
  const initialTheme: Theme = cookieTheme === "light" ? "light" : "dark";

  return (
    <html
      lang={HTML_LANG[initialLang]}
      className={`${montserrat.variable} h-full overflow-x-hidden antialiased${initialTheme === "dark" ? " dark" : ""}`}
      suppressHydrationWarning
    >
      <head>
        {/* Chinese text's actual font — Montserrat above has no CJK glyphs,
            so without this it was falling back to whatever Chinese font
            the visitor's OS happens to ship. next/font/google can't self-
            host this one (its typed subset list for Noto Sans TC only
            covers latin/cyrillic/vietnamese, not the Chinese glyphs this
            site actually needs), hence a plain stylesheet link instead. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap"
        />
      </head>
      <body className="min-h-full overflow-x-hidden bg-[#F5EFE4] font-sans text-neutral-900 dark:bg-black dark:text-neutral-100">
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <ThemeProvider initialTheme={initialTheme}>
          <LanguageProvider initialLang={initialLang}>
            <ChromeLayout>{children}</ChromeLayout>
          </LanguageProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
