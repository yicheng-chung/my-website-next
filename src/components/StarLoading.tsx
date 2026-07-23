"use client";

import { motion } from "framer-motion";
import { Sparkle } from "lucide-react";

const GLOW_HEX = "#F6B45E";
const GLOW_FILTER =
  "drop-shadow(0 0 6px rgba(246,180,94,0.7)) drop-shadow(0 0 12px rgba(246,180,94,0.4))";

// A loose triangle of three twinkling sparkles, pulsing out of phase —
// this page's own loading motif, distinct from the site-wide Spinner.
const STARS = [
  { size: 36, left: 22, top: 12, delay: 0 },
  { size: 16, left: 2, top: 52, delay: 0.35 },
  { size: 16, left: 58, top: 52, delay: 0.7 },
];

const TEXT = {
  zh: "正在探索宇宙裡的問題...",
  en: "Exploring questions across the universe...",
};

export default function StarLoading({ lang = "zh" }: { lang?: "zh" | "en" }) {
  return (
    <div
      role="status"
      aria-label={TEXT[lang]}
      className="flex flex-col items-center justify-center gap-4 py-20"
    >
      <div className="relative h-20 w-20">
        {STARS.map((star, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: star.left, top: star.top, width: star.size, height: star.size }}
            animate={{ scale: [0.55, 1, 0.55], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: star.delay }}
          >
            <Sparkle
              width="100%"
              height="100%"
              fill={GLOW_HEX}
              stroke={GLOW_HEX}
              strokeWidth={1}
              style={{ filter: GLOW_FILTER }}
            />
          </motion.div>
        ))}
      </div>
      <p className="text-sm text-neutral-400">{TEXT[lang]}</p>
    </div>
  );
}
