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
// Within a region, each item gets a free random spot across the full width and
// height of that region — actual overlap avoidance happens later, at the page
// level, once real rendered card sizes are known (see resolveCollisions in
// questions/page.tsx). xPercent spans the full 0-100 range here; the page
// applies its own pixel margins when projecting onto the actual field width,
// since it knows how much room a card needs to grow into on the right.
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

  regions.forEach((region, regionIndex) => {
    region.forEach((item, i) => {
      // The very first star gets a tight, top-biased spot so it sits close to
      // the top edge of the field instead of landing anywhere in the region.
      const isVeryFirst = regionIndex === 0 && i === 0;
      const y = isVeryFirst ? rand() * 8 : 6 + rand() * 88;
      const x = rand() * 100;
      positions.push({ id: item.id, xPercent: x, yPercent: y, regionIndex });
    });
  });

  return positions;
}
