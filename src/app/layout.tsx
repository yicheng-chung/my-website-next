import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ChromeLayout from "@/components/ChromeLayout";

const THEME_INIT_SCRIPT = `
  (function () {
    try {
      var stored = localStorage.getItem("my-website-theme");
      var isDark = stored === "dark" || (!stored && matchMedia("(prefers-color-scheme: dark)").matches);
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
      <body className="min-h-full bg-neutral-100 font-sans text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <ThemeProvider>
          <LanguageProvider>
            <ChromeLayout>{children}</ChromeLayout>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
