"use client";

import { useTranslations } from "@/lib/useTranslations";
import content from "@/content/about.json";
import Carousel, { type Slide } from "@/components/Carousel";

const IMAGES = [
  "/images/aboutMe/about_me_1.jpeg",
  "/images/aboutMe/about_me_2.jpg",
  "/images/aboutMe/about_me_3.jpeg",
  "/images/aboutMe/about_me_4.jpg",
  "/images/aboutMe/about_me_5.jpg",
  "/images/aboutMe/about_me_6.jpg",
];

export default function About() {
  const t = useTranslations(content);

  const slides: Slide[] = t.slides.map((slide, i) => ({
    src: IMAGES[i],
    alt: `about_me_${i + 1}`,
    title: slide.title || undefined,
    caption: slide.caption || undefined,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl bg-white p-8 shadow-lg">
        <h1 className="mb-4 text-3xl font-bold text-[#ca4141]">{t.heading}</h1>
        <p className="mb-4 whitespace-pre-line text-lg leading-relaxed">{t.intro1}</p>
        <p className="whitespace-pre-line text-lg leading-relaxed">{t.intro2}</p>
      </div>

      <div className="rounded-3xl bg-[#ca4141] p-8 shadow-lg">
        <h1 className="mb-4 text-2xl font-bold text-white">{t.lifeHeading}</h1>
        <Carousel slides={slides} />
      </div>
    </div>
  );
}
