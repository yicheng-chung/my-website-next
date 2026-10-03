import type { CSSProperties } from 'react'

// Same "one element per streak, own randomized duration/delay" approach as
// OceanCurrents.tsx, adapted for a quick diagonal flash-and-fade instead of
// a continuous drift — each bar is mostly invisible for most of its own
// cycle (see the keyframe in globals.css), so staggering several
// differently-timed instances reads as meteors appearing at random rather
// than one obviously looping animation.
//
// `top` is spread across the full 0-95% range (not clustered near the top)
// so this looks right regardless of which container it's dropped into — the
// header band, the much taller desktop stars field, or the mobile list —
// since each renders its own full set scaled to its own height. `angle`/
// `dx`/`dy` vary per meteor too (steep, shallow, left- and right-leaning)
// rather than one fixed diagonal repeated everywhere.
const METEORS = [
  { top: '3%', left: '8%', length: 90, angle: 115, dx: 160, dy: 90, duration: 7, delay: -1 },
  { top: '12%', left: '75%', length: 70, angle: 140, dx: 120, dy: 150, duration: 9, delay: -5 },
  { top: '22%', left: '40%', length: 60, angle: 95, dx: -140, dy: 60, duration: 6, delay: -3 },
  { top: '33%', left: '90%', length: 110, angle: 150, dx: 90, dy: 170, duration: 11, delay: -8 },
  { top: '44%', left: '15%', length: 80, angle: 70, dx: -150, dy: 40, duration: 8, delay: -2 },
  { top: '55%', left: '60%', length: 70, angle: 160, dx: 60, dy: 180, duration: 10, delay: -6.5 },
  { top: '66%', left: '25%', length: 100, angle: 110, dx: -130, dy: 100, duration: 9.5, delay: -4 },
  { top: '77%', left: '80%', length: 65, angle: 130, dx: 140, dy: 110, duration: 7.5, delay: -9 },
  { top: '86%', left: '50%', length: 85, angle: 100, dx: -100, dy: 130, duration: 8.5, delay: -7 },
  { top: '92%', left: '5%', length: 75, angle: 145, dx: 100, dy: 160, duration: 10.5, delay: -3.5 },
]

export default function ShootingStars() {
  return (
    <div aria-hidden className='pointer-events-none absolute inset-0 overflow-hidden'>
      {METEORS.map((m, i) => (
        <span
          key={i}
          className='animate-shooting-star absolute origin-top rounded-full bg-gradient-to-t from-white to-transparent'
          style={{
            top: m.top,
            left: m.left,
            width: '2px',
            height: `${m.length}px`,
            animationDuration: `${m.duration}s`,
            animationDelay: `${m.delay}s`,
            ['--meteor-angle' as string]: `${m.angle}deg`,
            ['--meteor-dx' as string]: `${m.dx}px`,
            ['--meteor-dy' as string]: `${m.dy}px`,
          } as CSSProperties}
        />
      ))}
    </div>
  )
}
