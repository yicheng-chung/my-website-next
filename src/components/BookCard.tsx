import type { Book } from "@/lib/notion";
import ProgressBar from "./ProgressBar";

export default function BookCard({ book }: { book: Book }) {
  return (
    <a
      href={book.url}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
    >
      <div className="aspect-[3/4] w-full overflow-hidden bg-neutral-100 p-[5%] dark:bg-neutral-700">
        {book.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.cover}
            alt={book.title}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <p className="line-clamp-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
          {book.title}
        </p>
        <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{book.author}</p>
        {book.progress !== null && <ProgressBar percent={book.progress} />}
      </div>
    </a>
  );
}
