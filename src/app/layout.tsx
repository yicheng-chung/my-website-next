import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import ChromeLayout from "@/components/ChromeLayout";

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
    <html lang="zh-TW" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full bg-neutral-100 font-sans">
        <LanguageProvider>
          <ChromeLayout>{children}</ChromeLayout>
        </LanguageProvider>
      </body>
    </html>
  );
}
