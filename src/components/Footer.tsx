"use client";

import { useTranslations } from "@/lib/useTranslations";
import common from "@/content/common.json";

export default function Footer() {
  const t = useTranslations(common);
  const year = new Date().getFullYear();

  return (
    <footer className="py-6 text-center text-sm text-slate-600">
      <p>{t.footer.copyright.replace("{year}", String(year))}</p>
    </footer>
  );
}
