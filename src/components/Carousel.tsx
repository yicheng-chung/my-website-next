"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type Slide = {
  src: string;
  alt: string;
  title?: string;
  caption?: string;
};

export default function Carousel({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const current = slides[index];

  const goTo = (next: number) => {
    setIndex((next + slides.length) % slides.length);
  };

  return (
    <div className="relative mx-auto w-full overflow-hidden rounded-2xl">
      <div className="relative aspect-[4/3] w-full md:aspect-[16/9]">
        <Image
          src={current.src}
          alt={current.alt}
          fill
          className="object-cover"
          priority={index === 0}
        />
        {(current.title || current.caption) && (
          <div className="absolute inset-x-0 bottom-0 hidden bg-black/50 p-4 text-white md:block">
            {current.title && <h5 className="text-lg font-semibold">{current.title}</h5>}
            {current.caption && <p className="text-sm">{current.caption}</p>}
          </div>
        )}
      </div>

      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => goTo(index - 1)}
        className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/30 p-1 text-white hover:bg-black/50 transition-colors"
      >
        <ChevronLeft size={28} />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => goTo(index + 1)}
        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/30 p-1 text-white hover:bg-black/50 transition-colors"
      >
        <ChevronRight size={28} />
      </button>

      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === index ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
