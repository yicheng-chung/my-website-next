"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import type { QuestionEntry } from "@/lib/questions";
import { layoutStars, type StarPosition } from "@/lib/starfield";
import PlanetQuestion from "@/components/PlanetQuestion";
import StarfieldGuide from "@/components/StarfieldGuide";
import StarLoading from "@/components/StarLoading";

const QUESTIONS_PER_REGION = 3;
const REGION_HEIGHT = 320;
// Cards anchor at their star's y and grow downward — without this, a card
// seeded near the bottom of the last region can extend past the field's
// height and get clipped by its overflow-hidden edge.
const BOTTOM_PADDING = 160;

// A star only gets a constellation line to its single nearest neighbor, and
// only if that neighbor is within this distance — keeps the sky sparse rather
// than a tangle of lines.
const MAX_LINE_DISTANCE = 260;
const LINE_GAP = 16;

type Position = { x: number; y: number };

// sessionStorage (not a module-level variable — Next.js can re-evaluate this
// module across client-side route transitions, which silently discarded a
// plain in-memory cache) so dragged positions survive navigating away and
// back. Cleared explicitly on an actual page reload via the Navigation Timing
// check below, since sessionStorage itself would otherwise survive that too.
const OFFSETS_KEY = "questions-star-offsets";

function loadStoredOffsets(): Record<string, Position> {
  if (typeof window === "undefined") return {};
  try {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (nav?.type === "reload") {
      sessionStorage.removeItem(OFFSETS_KEY);
      return {};
    }
    const raw = sessionStorage.getItem(OFFSETS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredOffsets(offsets: Record<string, Position>) {
  try {
    sessionStorage.setItem(OFFSETS_KEY, JSON.stringify(offsets));
  } catch {
    // ignore (private browsing, storage full, etc.)
  }
}

// Layered low-opacity blobs standing in for nebula clouds, plus fine star dust —
// self-contained CSS so there's no dependency on an external image asset.
const NEBULA = {
  backgroundImage: [
    "radial-gradient(600px 500px at 15% 10%, rgba(87,126,137,0.35), transparent 60%)",
    "radial-gradient(700px 600px at 85% 30%, rgba(111,159,156,0.28), transparent 60%)",
    "radial-gradient(650px 550px at 30% 80%, rgba(143,110,169,0.22), transparent 60%)",
    "radial-gradient(500px 500px at 75% 90%, rgba(155,184,194,0.25), transparent 60%)",
  ].join(", "),
  backgroundRepeat: "no-repeat",
};

const FAR_DUST = {
  backgroundImage: [
    "radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.35), transparent)",
    "radial-gradient(1px 1px at 60% 70%, rgba(255,255,255,0.25), transparent)",
    "radial-gradient(1.5px 1.5px at 80% 10%, rgba(255,255,255,0.3), transparent)",
    "radial-gradient(1px 1px at 30% 85%, rgba(255,255,255,0.2), transparent)",
  ].join(", "),
  backgroundSize: "260px 260px",
  backgroundRepeat: "repeat",
};

const NEAR_DUST = {
  backgroundImage: [
    "radial-gradient(2px 2px at 25% 40%, rgba(155,184,194,0.5), transparent)",
    "radial-gradient(1.5px 1.5px at 75% 60%, rgba(255,255,255,0.4), transparent)",
    "radial-gradient(2px 2px at 50% 15%, rgba(255,255,255,0.35), transparent)",
  ].join(", "),
  backgroundSize: "380px 380px",
  backgroundRepeat: "repeat",
};

const TEXT = {
  zh: {
    title: "我的宇宙裡有好多問題",
    subtitle: "The Universe of Questions",
    intro: "我有好多問題，想要把這些一閃而過都保留下來。",
  },
  en: {
    title: "So Many Questions",
    subtitle: "The Universe of Questions",
    intro: "I have so many questions. I want to hold onto these fleeting sparks before they disappear.",
  },
};

function computeBasePositions(
  starPositions: StarPosition[],
  fieldWidth: number,
): Record<string, Position> {
  const map: Record<string, Position> = {};
  starPositions.forEach((pos) => {
    const topPx = pos.regionIndex * REGION_HEIGHT + (pos.yPercent / 100) * REGION_HEIGHT;
    const leftPx = (pos.xPercent / 100) * fieldWidth;
    map[pos.id] = { x: leftPx, y: topPx };
  });
  return map;
}

export default function QuestionsPage() {
  const { lang } = useLanguage();
  const { forceDark, clearForceDark } = useTheme();
  const t = TEXT[lang];
  const fieldRef = useRef<HTMLDivElement>(null);
  // null while the Notion-backed fetch is in flight.
  const [questions, setQuestions] = useState<QuestionEntry[] | null>(null);
  // The stars' original, non-dragged layout — stable unless the field is remeasured.
  const [basePositions, setBasePositions] = useState<Record<string, Position>>({});
  // Cumulative drag offset per star, mirrored up from each PlanetQuestion's own
  // Framer Motion drag transform (see the comment in that component for why).
  // Seeded from sessionStorage so drags survive leaving and returning to this page.
  const [offsets, setOffsets] = useState<Record<string, Position>>(() => loadStoredOffsets());
  // Bumping this tells every star to animate its own offset back to zero.
  const [resetSignal, setResetSignal] = useState(0);

  // This page is an immersive space — force the whole site dark while it's open,
  // regardless of the light/dark toggle, and restore the prior state on leaving.
  useEffect(() => {
    forceDark();
    return () => clearForceDark();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/questions")
      .then((res) => res.json())
      .then((json: { questions: QuestionEntry[] }) => {
        if (!cancelled) setQuestions(json.questions ?? []);
      })
      .catch(() => {
        if (!cancelled) setQuestions([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const regionCount = questions ? Math.max(1, Math.ceil(questions.length / QUESTIONS_PER_REGION)) : 1;
  const fieldHeight = questions ? regionCount * REGION_HEIGHT + BOTTOM_PADDING : 480;
  const starPositions = useMemo(
    () => (questions ? layoutStars(questions, QUESTIONS_PER_REGION, 42) : []),
    [questions],
  );

  // Measure before paint so stars don't flash at x:0 before spreading out.
  // Field width is stable regardless of loading state since the field container
  // always renders (the loading state overlays it rather than replacing it).
  useLayoutEffect(() => {
    if (!fieldRef.current || starPositions.length === 0) return;
    setBasePositions(computeBasePositions(starPositions, fieldRef.current.clientWidth));
  }, [starPositions]);

  const resetPositions = () => {
    saveStoredOffsets({});
    setOffsets({});
    setResetSignal((s) => s + 1);
  };

  const handlePositionChange = (id: string, offsetX: number, offsetY: number) => {
    setOffsets((prev) => {
      const next = { ...prev, [id]: { x: offsetX, y: offsetY } };
      saveStoredOffsets(next);
      return next;
    });
  };

  const positions = useMemo(() => {
    const map: Record<string, Position> = {};
    Object.entries(basePositions).forEach(([id, base]) => {
      const offset = offsets[id] ?? { x: 0, y: 0 };
      map[id] = { x: base.x + offset.x, y: base.y + offset.y };
    });
    return map;
  }, [basePositions, offsets]);

  // Each star connects to its single nearest neighbor, "constellation" style,
  // recomputed whenever a star is dragged to a new spot.
  const lines = useMemo(() => {
    const ids = Object.keys(positions);
    const seen = new Set<string>();
    const result: { key: string; x1: number; y1: number; x2: number; y2: number }[] = [];

    ids.forEach((id) => {
      const p = positions[id];
      let nearestId: string | null = null;
      let nearestDist = Infinity;
      ids.forEach((otherId) => {
        if (otherId === id) return;
        const q = positions[otherId];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < nearestDist) {
          nearestDist = d;
          nearestId = otherId;
        }
      });
      if (nearestId && nearestDist <= MAX_LINE_DISTANCE) {
        const key = [id, nearestId].sort().join("~");
        if (seen.has(key)) return;
        seen.add(key);
        const q = positions[nearestId];
        const dx = q.x - p.x;
        const dy = q.y - p.y;
        const dist = Math.hypot(dx, dy) || 1;
        const ux = dx / dist;
        const uy = dy / dist;
        result.push({
          key,
          x1: p.x + 12 + ux * LINE_GAP,
          y1: p.y + 12 + uy * LINE_GAP,
          x2: q.x + 12 - ux * LINE_GAP,
          y2: q.y + 12 - uy * LINE_GAP,
        });
      }
    });

    return result;
  }, [positions]);

  const { scrollYProgress } = useScroll({ target: fieldRef, offset: ["start start", "end end"] });
  const nebulaY = useTransform(scrollYProgress, (v) => `${v * fieldHeight * 0.08}px`);
  const farY = useTransform(scrollYProgress, (v) => `${v * fieldHeight * 0.15}px`);
  const nearY = useTransform(scrollYProgress, (v) => `${v * fieldHeight * 0.32}px`);

  const answeredCount = (questions ?? []).filter((q) => q.answer || q.answerEn).length;

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 dark:border-neutral-700 dark:bg-neutral-800">
        <h1 className="text-2xl font-bold text-[#577E89] sm:text-3xl dark:text-[#9BB8C2]">{t.title}</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{t.subtitle}</p>
        <p className="mt-4 text-base leading-relaxed sm:text-lg">{t.intro}</p>
      </div>

      <div
        ref={fieldRef}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#05080a]"
        style={{ height: fieldHeight }}
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ ...NEBULA, backgroundPositionY: nebulaY }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ ...FAR_DUST, backgroundPositionY: farY }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ ...NEAR_DUST, backgroundPositionY: nearY }}
        />

        {questions === null ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <StarLoading lang={lang} />
          </div>
        ) : (
          <>
            <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full">
              {lines.map((line) => (
                <line
                  key={line.key}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="rgba(155,184,194,0.35)"
                  strokeWidth={1}
                  strokeDasharray="2 5"
                  strokeLinecap="round"
                />
              ))}
            </svg>

            <div className="absolute inset-0">
              {starPositions.map((pos, index) => {
                const question = questions.find((q) => q.id === pos.id);
                const base = basePositions[pos.id];
                if (!question || !base) return null;
                const seed = offsets[pos.id] ?? { x: 0, y: 0 };
                return (
                  <PlanetQuestion
                    key={pos.id}
                    question={question}
                    x={base.x}
                    y={base.y}
                    index={index}
                    lang={lang}
                    initialOffsetX={seed.x}
                    initialOffsetY={seed.y}
                    resetSignal={resetSignal}
                    onPositionChange={handlePositionChange}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>

      <StarfieldGuide
        total={(questions ?? []).length}
        answered={answeredCount}
        exploring={(questions ?? []).length - answeredCount}
        lang={lang}
        onReset={resetPositions}
      />
    </div>
  );
}
