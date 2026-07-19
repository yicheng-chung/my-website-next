"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

// Reveals `text` one character at a time. Restarts whenever `text` itself
// changes (e.g. a language switch), so it retypes in the new language.
// Pass `start: false` to hold it at zero characters — e.g. to chain a
// second typewriter so it only begins once an earlier one finishes.
export function useTypewriter(text: string, speedMs = 45, start = true) {
  const reduceMotion = useReducedMotion();
  const [length, setLength] = useState(0);
  const [typedFor, setTypedFor] = useState<string | null>(null);

  // Reset progress the moment `text` changes — adjusting state during
  // render (rather than in an effect) avoids an extra wasted render.
  if (typedFor !== text) {
    setTypedFor(text);
    setLength(reduceMotion ? text.length : 0);
  }

  useEffect(() => {
    if (reduceMotion || !start) return;
    const id = setInterval(() => {
      setLength((prev) => {
        if (prev >= text.length) {
          clearInterval(id);
          return prev;
        }
        return prev + 1;
      });
    }, speedMs);
    return () => clearInterval(id);
  }, [text, speedMs, reduceMotion, start]);

  return {
    text: text.slice(0, length),
    done: length >= text.length,
  };
}
