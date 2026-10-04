// A thin streak of light that occasionally sweeps along whatever edge this
// sits on — meant for the Hero/About seam on Home, where the two bands are
// plain adjacent siblings meeting at a straight line (no wave shape there
// to reuse WaveDivider's own trick). Mostly idle, with a brief sweep every
// few seconds, rather than a constant moving line — a shimmer, not a scan.
export default function SeamShimmer() {
  return (
    <div
      aria-hidden
      className='animate-seam-shimmer pointer-events-none absolute bottom-0 left-0 h-[2px] w-64 blur-[0.5px]'
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent)',
      }}
    />
  )
}
