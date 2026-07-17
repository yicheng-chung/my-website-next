"use client";

import Image from "next/image";
import { useTranslations } from "@/lib/useTranslations";
import content from "@/content/portofolio.json";

export default function Portofolio() {
  const t = useTranslations(content);

  return (
    <div className="rounded-3xl bg-white p-8 shadow-lg">
      <h1 className="mb-2 text-3xl font-bold text-[#ca4141]">{t.heading}</h1>
      <p className="text-lg">{t.body}</p>
      <Image
        src="/images/portofolio/portofolio.png"
        alt="portofolio"
        width={400}
        height={300}
        className="mx-auto mt-8"
      />
    </div>
  );
}
