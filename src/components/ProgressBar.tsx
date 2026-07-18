export default function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-neutral-500 dark:text-neutral-400">{percent}%</span>
      <div className="h-1.5 min-w-8 flex-1 rounded-full bg-neutral-200 dark:bg-neutral-700">
        <div
          className="h-full rounded-full bg-[#577E89] dark:bg-[#9BB8C2]"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
