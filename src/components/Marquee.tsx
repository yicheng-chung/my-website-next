// Scrolling ticker band — black strip, bold uppercase text, a divider
// between repeats. The text is rendered twice back to back (one `track`)
// and that whole thing rendered twice more side by side, so the CSS
// animation (translateX from 0 to -50%, see globals.css) always has a
// matching copy sliding in as the other slides out.
function Track({ text }: { text: string }) {
  return (
    <span className="flex shrink-0 items-center gap-8 pr-8 text-sm font-black tracking-widest text-white sm:text-base">
      {Array.from({ length: 6 }).map((_, i) => (
        <span key={i} className="flex items-center gap-8">
          {text}
          <span aria-hidden>✦</span>
        </span>
      ))}
    </span>
  );
}

export default function Marquee({ text }: { text: string }) {
  return (
    <div className="overflow-hidden border-y-4 border-black bg-black py-2">
      <div className="flex w-max animate-marquee">
        <Track text={text} />
        <Track text={text} />
      </div>
    </div>
  );
}

// Same idea, rotated — each repeat is laid out top-to-bottom (writing-mode,
// not a rotated transform, so the glyphs themselves stay upright reading
// vertically) and the whole stack scrolls along Y instead of X. `reverse`
// flips the scroll direction via animation-direction rather than a second
// keyframe, so the left/right sides of a box can run opposite ways.
function VerticalTrack({ text }: { text: string }) {
  return (
    <span className="flex shrink-0 flex-col items-center gap-8 pb-8 text-sm font-black tracking-widest text-white sm:text-base">
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className="flex flex-col items-center gap-8"
          style={{ writingMode: "vertical-rl" }}
        >
          {text}
          <span aria-hidden>✦</span>
        </span>
      ))}
    </span>
  );
}

export function VerticalMarquee({ text, reverse = false }: { text: string; reverse?: boolean }) {
  return (
    <div className="h-full overflow-hidden border-x-4 border-black bg-black px-2">
      <div
        className={`flex h-max flex-col ${reverse ? "animate-marquee-vertical-reverse" : "animate-marquee-vertical"}`}
      >
        <VerticalTrack text={text} />
        <VerticalTrack text={text} />
      </div>
    </div>
  );
}
