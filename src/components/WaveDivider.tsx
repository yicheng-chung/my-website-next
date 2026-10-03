// Sits at the bottom of a section, overlapping its last bit of height with a
// wavy shape filled in the *next* section's color — same "duplicate the
// track and slide by exactly half its width" seamless-loop trick as
// Marquee.tsx, just horizontal and much slower, since this is a background
// flourish, not something meant to draw the eye like the marquee text.
const WAVE_PATH = "M0,75 Q100,15 200,75 T400,75 T600,75 T800,75 L800,150 L0,150 Z";

export default function WaveDivider({ className }: { className: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-14 overflow-hidden sm:h-20"
    >
      <div className="animate-wave flex h-full w-[200%]">
        <svg viewBox="0 0 800 150" preserveAspectRatio="none" className="h-full w-1/2 flex-shrink-0">
          <path d={WAVE_PATH} className={className} />
        </svg>
        <svg viewBox="0 0 800 150" preserveAspectRatio="none" className="h-full w-1/2 flex-shrink-0">
          <path d={WAVE_PATH} className={className} />
        </svg>
      </div>
    </div>
  );
}
