const SPOKE_COUNT = 12;

export default function Spinner({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`relative inline-block text-neutral-400 dark:text-neutral-500 ${className}`}
      style={{ width: size, height: size }}
    >
      {Array.from({ length: SPOKE_COUNT }).map((_, i) => (
        <span
          key={i}
          className="spinner-spoke"
          style={{
            transform: `rotate(${i * (360 / SPOKE_COUNT)}deg)`,
            animationDelay: `${(i * 1) / SPOKE_COUNT - 1}s`,
          }}
        />
      ))}
    </div>
  );
}
