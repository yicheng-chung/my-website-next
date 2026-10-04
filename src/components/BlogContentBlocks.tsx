import { useState, type ReactNode } from 'react'
import type { ContentBlock, ContentSpan } from '@/lib/notion'
import { toDisplayableImageSrc } from '@/lib/notion'

// Notion doesn't expose the resized width (see the comment below), but the
// browser can measure the image itself once loaded — portrait photos get
// capped to a fixed height instead of the usual 65%-width treatment, since
// at 65% width a tall portrait photo would tower over the surrounding text.
function BlogImage({ src, alt }: { src: string; alt: string }) {
  const [portrait, setPortrait] = useState(false)

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={toDisplayableImageSrc(src)}
      alt={alt}
      onLoad={(e) => {
        const img = e.currentTarget
        setPortrait(img.naturalHeight > img.naturalWidth)
      }}
      className={
        portrait
          ? 'max-h-[550px] w-auto rounded-lg'
          : 'w-full rounded-lg sm:w-[65%]'
      }
    />
  )
}

// Blog-specific rendering of the same ContentBlock tree used for book
// reflections (see BookContentBlocks.tsx) — kept as its own component rather
// than a shared variant because the two are deliberately tuned differently:
// this one aims to read close to Notion's own default page typography
// (smaller body text, tighter block spacing, more moderate heading sizes)
// rather than the book page's roomier "Medium-ish" style.
function Spans({ spans }: { spans: ContentSpan[] }) {
  return (
    <>
      {spans.map((s, i) => {
        let node: ReactNode = s.text
        if (s.code) {
          node = (
            <code className='rounded bg-neutral-100 px-1 py-0.5 text-[0.9em] dark:bg-neutral-800'>
              {node}
            </code>
          )
        }
        if (s.bold) node = <strong>{node}</strong>
        if (s.italic) node = <em>{node}</em>
        if (s.strikethrough) node = <s>{node}</s>
        if (s.href) {
          node = (
            <a
              href={s.href}
              target='_blank'
              rel='noreferrer'
              className='text-[#F2A341] underline underline-offset-2 dark:text-[#F6B45E]'
            >
              {node}
            </a>
          )
        }
        return <span key={i}>{node}</span>
      })}
    </>
  )
}

// Notion's own defaults: ~16px body text, line-height around 1.5, and only
// a few pixels of gap between consecutive blocks — noticeably tighter than
// a typical article layout, which is what yicheng asked to match here.
function SingleBlock({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'heading_1':
      return (
        <h2 className='mt-6 mb-1 text-3xl font-bold text-neutral-900 first:mt-0 dark:text-neutral-100'>
          <Spans spans={block.spans} />
        </h2>
      )
    case 'heading_2':
      return (
        <h3 className='mt-5 mb-1 text-2xl font-bold text-neutral-900 first:mt-0 dark:text-neutral-100'>
          <Spans spans={block.spans} />
        </h3>
      )
    case 'heading_3':
      return (
        <h4 className='mt-4 mb-1 text-xl font-bold text-neutral-900 first:mt-0 dark:text-neutral-100'>
          <Spans spans={block.spans} />
        </h4>
      )
    case 'paragraph':
      return block.spans.length > 0 ? (
        <p className='mb-3 text-base leading-relaxed text-neutral-800 dark:text-neutral-200'>
          <Spans spans={block.spans} />
        </p>
      ) : (
        <div className='h-3' aria-hidden />
      )
    case 'quote':
      return (
        <blockquote className='mb-3 border-l-2 border-neutral-300 pl-4 text-lg leading-relaxed text-neutral-600 italic dark:border-neutral-600 dark:text-neutral-400'>
          <Spans spans={block.spans} />
        </blockquote>
      )
    case 'callout':
      return (
        <div className='mb-3 rounded-lg bg-neutral-50 p-4 text-base text-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-200'>
          <div className='flex gap-2'>
            {block.icon && <span aria-hidden>{block.icon}</span>}
            <span>
              <Spans spans={block.spans} />
            </span>
          </div>
          {block.children.length > 0 && (
            <div className='mt-2'>
              <BlockList blocks={block.children} />
            </div>
          )}
        </div>
      )
    case 'toggle':
      return (
        <details className='mb-3 border-b border-neutral-200 pb-3 dark:border-neutral-700'>
          <summary className='cursor-pointer text-base font-semibold text-neutral-800 dark:text-neutral-100'>
            <Spans spans={block.spans} />
          </summary>
          <div className='mt-2 pl-1'>
            <BlockList blocks={block.children} />
          </div>
        </details>
      )
    case 'divider':
      return <hr className='my-6 border-neutral-200 dark:border-neutral-700' />
    case 'image':
      // Notion's API doesn't expose the width a user drags an image block
      // to, so the exact resize ratio can't be reproduced — this shrinks
      // every image to a fixed, centered width with margin on both sides
      // instead (per yicheng), rather than the book page's full-bleed image.
      return (
        <figure className='mb-3 mt-15 flex flex-col items-center'>
          <BlogImage src={block.url} alt='' />
          {block.caption.length > 0 && (
            <figcaption className='mt-2 text-center text-sm text-neutral-500 dark:text-neutral-400'>
              <Spans spans={block.caption} />
            </figcaption>
          )}
        </figure>
      )
    default:
      return null
  }
}

// Notion returns list items as a flat sequence of individually-typed blocks
// — group consecutive bulleted/numbered items into one <ul>/<ol> so they
// render as an actual list instead of one bare <li> per line.
export default function BlockList({ blocks }: { blocks: ContentBlock[] }) {
  const nodes: ReactNode[] = []
  let i = 0

  while (i < blocks.length) {
    const block = blocks[i]

    if (
      block.type === 'bulleted_list_item' ||
      block.type === 'numbered_list_item'
    ) {
      const listType = block.type
      const items: Extract<
        ContentBlock,
        { type: 'bulleted_list_item' | 'numbered_list_item' }
      >[] = []
      while (i < blocks.length && blocks[i].type === listType) {
        items.push(
          blocks[i] as Extract<
            ContentBlock,
            { type: 'bulleted_list_item' | 'numbered_list_item' }
          >
        )
        i += 1
      }
      const ListTag = listType === 'bulleted_list_item' ? 'ul' : 'ol'
      nodes.push(
        <ListTag
          key={`list-${i}`}
          className={`mb-3 space-y-1 pl-6 text-base leading-relaxed text-neutral-800 dark:text-neutral-200 ${
            listType === 'bulleted_list_item' ? 'list-disc' : 'list-decimal'
          }`}
        >
          {items.map((item, idx) => (
            <li key={idx}>
              <Spans spans={item.spans} />
            </li>
          ))}
        </ListTag>
      )
    } else {
      nodes.push(<SingleBlock key={i} block={block} />)
      i += 1
    }
  }

  return <>{nodes}</>
}
