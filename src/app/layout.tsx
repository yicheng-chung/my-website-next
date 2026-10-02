import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ChromeLayout from "@/components/ChromeLayout";

const THEME_INIT_SCRIPT = `
  (function () {
    try {
      var stored = localStorage.getItem("my-website-theme");
      var isDark = stored !== "light";
      if (isDark) document.documentElement.classList.add("dark");
    } catch (e) {}
  })();
`;

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "YiCheng's Page",
  description: "鍾貽丞 (Yi-Cheng Chung) — personal resume site",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-TW"
      className={`${montserrat.variable} h-full antialiased`}
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
      <body className="min-h-full bg-[#F5EFE4] font-sans text-neutral-900 dark:bg-black dark:text-neutral-100">
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <ThemeProvider>
          <LanguageProvider>
            <ChromeLayout>{children}</ChromeLayout>
          </LanguageProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
