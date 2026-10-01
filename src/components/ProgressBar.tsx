'use client'

import { useEffect, useState } from 'react'

export default function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent))
  const [width, setWidth] = useState(0)

  useEffect(() => {
    // Mount at 0% first, then animate to the real value a frame later —
    // setting it in the same frame as the initial paint would skip the
    // CSS transition and just snap straight to the final width.
    const id = requestAnimationFrame(() => setWidth(clamped))
    return () => cancelAnimationFrame(id)
  }, [clamped])

  return (
    <div className='flex items-center gap-2'>
      <span className='text-xs text-neutral-500 dark:text-neutral-400'>
        {percent}%
      </span>
      <div className='h-1.5 min-w-8 flex-1 rounded-full bg-neutral-200 dark:bg-neutral-700'>
        <div
          className='h-full rounded-full bg-[#F2A341] transition-[width] duration-800 ease-out dark:bg-[#F6B45E]'
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}
