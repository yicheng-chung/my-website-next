"use client";

import { CalendarDays, Clock, MapPin } from "lucide-react";

// The reading event's look, shared by the Activities page and the
// homepage's activity card: its palette and the slow "breathing" glow on
// its sage bands.

export const ORANGE = "#F2A341";
// A darker orange for small text/icons on light backgrounds, where the
// site orange itself is too light to read.
export const ORANGE_DEEP = "#B86A0B";
// The dark bands: a muted sage green (per yicheng: not the homepage's
// blue here — something low-saturation). Dark enough for cream body text
// (contrast 5.1:1) and the orange headings (3.05:1, large text).
export const SAGE = "#566354";
export const CREAM = "#F3E4DC";
export const PAPER = "#F5EFE4";

// In the order of `details` in activities.json: where, when, how long.
export const DETAIL_ICONS = [MapPin, CalendarDays, Clock];

// Soft glows that slowly drift and swell behind a sage band's content —
// see .animate-breathe in globals.css. Each has its own size, spot, drift
// and pace so they never pulse in step.
const GLOWS = [
  {
    size: 520,
    left: "-8%",
    top: "-20%",
    x: "40px",
    y: "30px",
    duration: "11s",
    delay: "0s",
  },
  {
    size: 420,
    left: "62%",
    top: "35%",
    x: "-50px",
    y: "-25px",
    duration: "9s",
    delay: "-4s",
  },
  {
    size: 360,
    left: "30%",
    top: "70%",
    x: "30px",
    y: "-40px",
    duration: "13s",
    delay: "-7s",
  },
];

export function BreathingGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {GLOWS.map((g, i) => (
        <span
          key={i}
          className="animate-breathe absolute rounded-full blur-3xl"
          style={
            {
              width: g.size,
              height: g.size,
              left: g.left,
              top: g.top,
              background:
                "radial-gradient(circle, rgba(243,228,220,0.16), rgba(243,228,220,0) 70%)",
              "--breathe-x": g.x,
              "--breathe-y": g.y,
              "--breathe-duration": g.duration,
              animationDelay: g.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

