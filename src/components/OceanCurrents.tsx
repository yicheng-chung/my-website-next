// Decorative background streaks for the Life Timeline band — long, soft,
// varying-thickness lines drifting right-to-left like water rushing past a
// boat, to read as "sailing" rather than a plain flat color. Each streak is
// a single element sliding from off-screen-right to off-screen-left on its
// own loop (not the duplicate-track trick used elsewhere in this codebase,
// since these are meant to look like discrete currents with gaps between
// them, not a seamless repeating texture) with a negative animation-delay
// so they don't all start in sync.
//
// `shade` varies the streak's own brightness (not just opacity) — a mix of
// bright white "foam" highlights, mid cream streaks, and dimmer pale-blue
// ones reads more like real water at different depths than one flat color
// repeated at different strengths would.
const SHADES = {
  bright: '#FFFFFF',
  cream: '#F3E4DC',
  dim: '#9FB4C7',
};

const CURRENTS: {
  top: string;
  width: number;
  height: number;
  opacity: number;
  duration: number;
  delay: number;
  shade: keyof typeof SHADES;
}[] = [
  { top: '6%', width: 180, height: 2, opacity: 0.42, duration: 11, delay: -2, shade: 'bright' },
  { top: '16%', width: 360, height: 8, opacity: 0.18, duration: 20, delay: -14, shade: 'dim' },
  { top: '27%', width: 140, height: 3, opacity: 0.38, duration: 9, delay: -5, shade: 'cream' },
  { top: '36%', width: 420, height: 11, opacity: 0.15, duration: 23, delay: -1, shade: 'dim' },
  { top: '47%', width: 100, height: 2, opacity: 0.45, duration: 8, delay: -6, shade: 'bright' },
  { top: '55%', width: 260, height: 5, opacity: 0.26, duration: 15, delay: -10, shade: 'cream' },
  { top: '64%', width: 320, height: 9, opacity: 0.18, duration: 18, delay: -3, shade: 'dim' },
  { top: '73%', width: 150, height: 3, opacity: 0.38, duration: 10, delay: -8, shade: 'bright' },
  { top: '82%', width: 240, height: 6, opacity: 0.24, duration: 14, delay: -12, shade: 'cream' },
  { top: '91%', width: 380, height: 10, opacity: 0.17, duration: 21, delay: -4, shade: 'dim' },
];

export default function OceanCurrents() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {CURRENTS.map((c, i) => (
        <span
          key={i}
          className="animate-current absolute left-0 rounded-full blur-[1px]"
          style={{
            top: c.top,
            width: c.width,
            height: c.height,
            opacity: c.opacity,
            backgroundColor: SHADES[c.shade],
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
