export interface StarPosition {
  id: string;
  xPercent: number;
  yPercent: number;
  regionIndex: number;
}

// Deterministic PRNG so star positions are stable across server/client render
// (no hydration mismatch) and don't reshuffle on every visit.
function mulberry32(seed: number) {
  let state = seed | 0;
  return function random() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Scatters items into vertical "regions" (for progressive reveal while scrolling).
// Within a region, each item gets its own horizontal "band" — a guaranteed slice
// of vertical space — so cards (whose height varies with title length) can't
// overlap a neighbor, unlike pure rejection sampling on a point distance.
// Items with a date are sorted most-recent-first and placed in the top regions;
// undated items fill the regions after them.
export function layoutStars<T extends { id: string; date?: string }>(
  items: T[],
  perRegion = 2,
  seed = 42,
): StarPosition[] {
  const rand = mulberry32(seed);
  const positions: StarPosition[] = [];

  const dated = items.filter((i) => i.date).sort((a, b) => (a.date! < b.date! ? 1 : -1));
  const undated = items.filter((i) => !i.date);
  const ordered = [...dated, ...undated];

  const regions: T[][] = [];
  for (let i = 0; i < ordered.length; i += perRegion) {
    regions.push(ordered.slice(i, i + perRegion));
  }

  const margin = 8;
  // Leave extra room on the right of each x position for the question card
  // that grows out from the planet, so cards don't clip the field's edges.
  const rightMargin = 42;

  regions.forEach((region, regionIndex) => {
    const bandHeight = 100 / region.length;
    region.forEach((item, i) => {
      const bandStart = i * bandHeight;
      // The very first star gets a tighter, top-biased band so it sits close
      // to the top edge of the field instead of drifting toward band center.
      const isVeryFirst = regionIndex === 0 && i === 0;
      const bandPad = bandHeight * (isVeryFirst ? 0.05 : 0.15);
      const bandSpan = isVeryFirst ? (bandHeight - bandPad * 2) * 0.4 : bandHeight - bandPad * 2;
      const y = bandStart + bandPad + rand() * bandSpan;
      const x = margin + rand() * (100 - margin - rightMargin);
      positions.push({ id: item.id, xPercent: x, yPercent: y, regionIndex });
    });
  });

  return positions;
}
