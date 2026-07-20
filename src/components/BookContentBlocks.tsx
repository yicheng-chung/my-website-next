import type { ReactNode } from "react";
import type { ContentBlock, ContentSpan } from "@/lib/notion";

function Spans({ spans }: { spans: ContentSpan[] }) {
  return (
    <>
      {spans.map((s, i) => {
        let node: ReactNode = s.text;
        if (s.code) {
          node = (
            <code className="rounded bg-neutral-100 px-1 py-0.5 text-[0.9em] dark:bg-neutral-800">
              {node}
            </code>
          );
        }
        if (s.bold) node = <strong>{node}</strong>;
        if (s.italic) node = <em>{node}</em>;
        if (s.strikethrough) node = <s>{node}</s>;
        if (s.href) {
          node = (
            <a
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="text-[#577E89] underline underline-offset-2 dark:text-[#9BB8C2]"
            >
              {node}
            </a>
          );
        }
        return <span key={i}>{node}</span>;
      })}
    </>
  );
}

// Medium-ish typography: roomy serif-adjacent line length, generous
// leading, no boxes around ordinary text — the page's own container
// already frames the article, blocks shouldn't add another layer of
// borders on top of that.
function SingleBlock({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "heading_1":
      return (
        <h2 className="mt-10 mb-4 text-2xl font-bold text-neutral-900 first:mt-0 dark:text-neutral-100">
          <Spans spans={block.spans} />
        </h2>
      );
    case "heading_2":
      return (
        <h3 className="mt-8 mb-3 text-xl font-bold text-neutral-900 first:mt-0 dark:text-neutral-100">
          <Spans spans={block.spans} />
        </h3>
      );
    case "heading_3":
      return (
        <h4 className="mt-6 mb-2 text-lg font-bold text-neutral-900 first:mt-0 dark:text-neutral-100">
          <Spans spans={block.spans} />
        </h4>
      );
    case "paragraph":
      return block.spans.length > 0 ? (
        <p className="mb-5 text-lg leading-loose text-neutral-800 dark:text-neutral-200">
          <Spans spans={block.spans} />
        </p>
      ) : (
        <div className="h-4" aria-hidden />
      );
    case "quote":
      return (
        <blockquote className="mb-5 border-l-2 border-neutral-300 pl-5 text-xl leading-relaxed text-neutral-600 italic dark:border-neutral-600 dark:text-neutral-400">
          <Spans spans={block.spans} />
        </blockquote>
      );
    case "callout":
      return (
        <div className="mb-5 rounded-lg bg-neutral-50 p-4 text-base text-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-200">
          <div className="flex gap-2">
            {block.icon && <span aria-hidden>{block.icon}</span>}
            <span>
              <Spans spans={block.spans} />
            </span>
          </div>
          {block.children.length > 0 && (
            <div className="mt-2">
              <BlockList blocks={block.children} />
            </div>
          )}
        </div>
      );
    case "toggle":
      return (
        <details className="mb-5 border-b border-neutral-200 pb-4 dark:border-neutral-700">
          <summary className="cursor-pointer text-lg font-semibold text-neutral-800 dark:text-neutral-100">
            <Spans spans={block.spans} />
          </summary>
          <div className="mt-3 pl-1">
            <BlockList blocks={block.children} />
          </div>
        </details>
      );
    case "divider":
      return <hr className="my-8 border-neutral-200 dark:border-neutral-700" />;
    case "image":
      return (
        <figure className="mb-5">
          {/* Notion-hosted image, same pattern as BookCard's covers. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.url} alt="" className="rounded-lg" />
          {block.caption.length > 0 && (
            <figcaption className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              <Spans spans={block.caption} />
            </figcaption>
          )}
        </figure>
      );
    default:
      return null;
  }
}

// Notion returns list items as a flat sequence of individually-typed blocks
// — group consecutive bulleted/numbered items into one <ul>/<ol> so they
// render as an actual list instead of one bare <li> per line.
export default function BlockList({ blocks }: { blocks: ContentBlock[] }) {
  const nodes: ReactNode[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];

    if (block.type === "bulleted_list_item" || block.type === "numbered_list_item") {
      const listType = block.type;
      const items: Extract<
        ContentBlock,
        { type: "bulleted_list_item" | "numbered_list_item" }
      >[] = [];
      while (i < blocks.length && blocks[i].type === listType) {
        items.push(
          blocks[i] as Extract<ContentBlock, { type: "bulleted_list_item" | "numbered_list_item" }>
        );
        i += 1;
      }
      const ListTag = listType === "bulleted_list_item" ? "ul" : "ol";
      nodes.push(
        <ListTag
          key={`list-${i}`}
          className={`mb-5 space-y-2 pl-6 text-lg leading-loose text-neutral-800 dark:text-neutral-200 ${
            listType === "bulleted_list_item" ? "list-disc" : "list-decimal"
          }`}
        >
          {items.map((item, idx) => (
            <li key={idx}>
              <Spans spans={item.spans} />
            </li>
          ))}
        </ListTag>
      );
    } else {
      nodes.push(<SingleBlock key={i} block={block} />);
      i += 1;
    }
  }

  return <>{nodes}</>;
}
