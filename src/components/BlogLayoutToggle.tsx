"use client";

import { motion } from "framer-motion";
import { List, LayoutGrid } from "lucide-react";

export type BlogLayout = "list" | "grid";

const OPTIONS: { key: BlogLayout; Icon: typeof List; label: string }[] = [
  { key: "list", Icon: List, label: "List view" },
  { key: "grid", Icon: LayoutGrid, label: "Grid view" },
];

export default function BlogLayoutToggle({
  layout,
  onChange,
}: {
  layout: BlogLayout;
  onChange: (layout: BlogLayout) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Blog layout"
      className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white p-1 shadow-md dark:border-neutral-700 dark:bg-neutral-800"
    >
      {OPTIONS.map(({ key, Icon, label }) => {
        const active = layout === key;
        return (
          <button
            key={key}
            type="button"
            aria-label={label}
            aria-pressed={active}
            onClick={() => onChange(key)}
            className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full"
          >
            {active && (
              <motion.span
                layoutId="blog-layout-pill"
                className="absolute inset-0 rounded-full bg-[#F2A341]"
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
              />
            )}
            <Icon
              size={16}
              className={`relative z-10 transition-colors ${
                active
                  ? "text-black"
                  : "text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
