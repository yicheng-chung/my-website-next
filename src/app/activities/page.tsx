"use client";

import { useId, useState } from "react";
import { useTranslations } from "@/lib/useTranslations";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import content from "@/content/activities.json";
import common from "@/content/common.json";
import Reveal from "@/components/Reveal";
import ActivitiesEmpty from "@/components/ActivitiesEmpty";
import {
  BreathingGlow,
  CREAM,
  DETAIL_ICONS,
  ORANGE,
  ORANGE_DEEP,
  PAPER,
  SAGE,
} from "@/components/EventTheme";

// The reading event page (per yicheng: the first real activity, run like a
// "reading party" — everyone brings their own book, reads quietly to
// music, and talks in the middle and at the end).
//
// The calm layout — light and dark bands taking turns, a timeline, an FAQ —
// came from an event site yicheng pointed to, but everything that makes it
// look like something is this site's own (per yicheng, so it doesn't read
// as a copy): headings with an orange half, its
// orange / cream palette, the rounded orange pills the blog and
// reading pages use for tags. No boxed cards, ticker, water streaks or
// waves here (per yicheng) — content sits openly on each band, which meet
// in straight edges, with a slow breathing glow on the sage ones. Fixed colors in light and dark mode alike, like Home's hero
// and timeline bands.
//
// Venue/date/fee aren't decided yet, so the copy says so, and sign-up is a
// disabled button until there's somewhere for it to go.
//
// With `hasEvent` off in activities.json, the page falls back to its
// original "nothing planned yet" design (ActivitiesEmpty) — as does the
// homepage's activity card.

const GUTTER = "px-4 sm:px-6 lg:px-10";
// Bands meet in straight edges (per yicheng: no waves here).
const BAND = `relative ${GUTTER} py-20 sm:py-28`;

// Type on this page (per yicheng, who liked the timeline's): headings,
// titles, numbers and key values in the blog's serif (font-serif); body
// copy, labels and buttons stay in the site's sans.
function Heading({
  lead,
  accent,
  className = "",
}: {
  lead: string;
  accent: string;
  className?: string;
}) {
  return (
    <h2
      className={`font-serif text-3xl leading-tight font-bold tracking-tight sm:text-5xl ${className}`}
    >
      {lead}
      <span style={{ color: ORANGE }}>{accent}</span>
    </h2>
  );
}

// Same rounded orange pill as the blog / reading category tags.
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wide text-black"
      style={{ backgroundColor: ORANGE }}
    >
      {children}
    </span>
  );
}

function SignUpButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      disabled
      className="cursor-not-allowed rounded-full bg-black px-7 py-3 text-sm font-bold text-white"
    >
      {label}
    </button>
  );
}

// One FAQ entry that opens and closes with a smooth slide (per yicheng) —
// a button + a grid row animating 0fr → 1fr, rather than a native
// <details>, whose open/close can't be animated in Safari. The + turns
// into an × as it opens.
function FaqItem({
  question,
  answer,
  first,
}: {
  question: string;
  answer: string;
  first: boolean;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={`border-b-2 border-[#F3E4DC]/25 ${first ? "pb-5" : "py-5"}`}>
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full cursor-pointer items-start justify-between gap-4 text-left font-serif text-lg font-semibold"
        >
          {question}
          <span
            aria-hidden
            className={`mt-0.5 shrink-0 text-2xl leading-none font-black transition-transform duration-300 ${
              open ? "rotate-45" : ""
            }`}
            style={{ color: ORANGE }}
          >
            +
          </span>
        </button>
      </h3>
      <div
        id={id}
        role="region"
        // Closed answers are out of reach of keyboard and screen readers
        // too, not just visually collapsed.
        inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="pt-3 text-sm leading-relaxed opacity-90">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function ActivitiesPage() {
  const t = useTranslations(content);
  const { siteName } = useTranslations(common);
  useDocumentTitle(`${t.title} · ${siteName}`);
  return content.hasEvent ? <EventPage /> : <ActivitiesEmpty />;
}

function EventPage() {
  const t = useTranslations(content);
  const e = t.event;

  return (
    <div className="flex flex-col text-black">
      {/* Hero — flush under the fixed navbar. */}
      <section
        className={`relative ${GUTTER} pt-[calc(var(--navbar-height,84px)+4rem)] pb-20 text-center sm:pt-[calc(var(--navbar-height,84px)+5rem)] sm:pb-28`}
        style={{ backgroundColor: PAPER }}
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center">
          <Tag>{e.eyebrow}</Tag>
          <h1 className="mt-6 font-serif text-4xl leading-[1.15] font-bold tracking-tight sm:text-6xl">
            {e.titleLead}
            <br className="sm:hidden" />
            <span style={{ color: ORANGE }}>{e.titleAccent}</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-balance text-neutral-600 sm:text-lg">
            {e.lede}
          </p>

          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
            <SignUpButton label={e.ctaDisabled} />
            <a
              href="#flow"
              className="rounded-full border-2 border-black px-7 py-[10px] text-sm font-bold transition-colors hover:bg-black hover:text-white"
            >
              {e.ctaFlow} ↓
            </a>
          </div>

          {/* Where / when / how long, each in a soft white card (per
              yicheng: boxed, but not the hard black-border kind) — an icon
              in an orange circle, a small label, the value, and a thin
              orange stripe along the top edge. All three the same width
              (per yicheng). Values only break where the copy allows it —
              keep-all, plus a zero-width space in the long Chinese one
              (台北的共享空間／或咖啡館) — so a line never splits a word. */}
          <dl className="mt-14 grid w-full gap-4 text-left sm:grid-cols-3 sm:gap-5">
            {e.details.map((d, i) => {
              const Icon = DETAIL_ICONS[i % DETAIL_ICONS.length];
              return (
                <div
                  key={d.label}
                  className="relative flex items-start gap-4 overflow-hidden rounded-2xl bg-white px-5 pt-6 pb-5 shadow-[0_10px_30px_-15px_rgba(60,70,58,0.3)] ring-1 ring-black/5"
                >
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-1"
                    style={{ backgroundColor: ORANGE }}
                  />
                  <span
                    aria-hidden
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: `${ORANGE}26`,
                      color: ORANGE_DEEP,
                    }}
                  >
                    <Icon size={18} strokeWidth={2.25} />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
                      {d.label}
                    </dt>
                    <dd className="mt-1 font-serif text-base leading-snug font-semibold [word-break:keep-all]">
                      {d.value}
                    </dd>
                  </div>
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      {/* What it is — the first sage band. Its contents fade up as they
          scroll into view (Reveal), the three points one after another. */}
      <section
        className={`${BAND} overflow-hidden`}
        style={{ backgroundColor: SAGE, color: CREAM }}
      >
        <BreathingGlow />
        <div className="relative mx-auto max-w-5xl">
          <Reveal>
            <Heading
              lead={e.aboutTitleLead}
              accent={e.aboutTitleAccent}
              className="text-center"
            />
          </Reveal>
          {/* Three points set straight on the band — a big orange number
              over each, no card around them. */}
          <div className="mt-14 grid gap-12 sm:grid-cols-3 sm:gap-10">
            {e.about.map((item, i) => (
              <Reveal
                key={item.title}
                delay={150 * (i + 1)}
                className="text-center sm:text-left"
              >
                <p
                  className="font-serif text-5xl leading-none font-bold"
                  style={{ color: ORANGE }}
                >
                  0{i + 1}
                </p>
                <p className="mt-4 font-serif text-xl font-semibold">
                  {item.title}
                </p>
                <p className="mt-3 text-sm leading-relaxed opacity-90 sm:text-base">
                  {item.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Flow — a quiet vertical timeline (per yicheng, in the spirit of
          the reference site's): times in the blog's serif, a hairline, small
          dark dots. */}
      <section
        id="flow"
        className={`${BAND} scroll-mt-[var(--navbar-height,84px)]`}
        style={{ backgroundColor: PAPER }}
      >
        <div className="mx-auto max-w-3xl">
          <Heading
            lead={e.flowTitleLead}
            accent={e.flowTitleAccent}
            className="text-center"
          />
          <p className="mt-4 text-center text-sm text-neutral-500">
            {e.flowNote}
          </p>
          <ol className="mt-12">
            {e.flow.map((step, i) => (
              <li
                key={step.time}
                className="relative flex gap-5 pb-9 last:pb-0 sm:gap-8"
              >
                {/* The line linking each dot to the next — centered on the
                    dot: time column (w-14 / sm:w-16) + gap (5 / sm:8) +
                    half the dot (0.3125rem). */}
                {i < e.flow.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute top-3 bottom-0 left-[5.0625rem] w-px -translate-x-1/2 sm:left-[6.3125rem]"
                    style={{ backgroundColor: "#D8CBB6" }}
                  />
                )}
                <span
                  className="w-14 shrink-0 pt-0.5 text-right font-serif text-sm tabular-nums sm:w-16 sm:text-base"
                  style={{ color: ORANGE_DEEP }}
                >
                  {step.time}
                </span>
                <span
                  aria-hidden
                  className="relative mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-neutral-900"
                />
                <div className="min-w-0">
                  <p className="font-serif text-lg font-semibold">
                    {step.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-600 sm:text-base">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What to bring + FAQ — sage again, two columns on desktop. */}
      <section
        className={`${BAND} overflow-hidden`}
        style={{ backgroundColor: SAGE, color: CREAM }}
      >
        <BreathingGlow />
        <div className="relative mx-auto grid max-w-5xl gap-16 md:grid-cols-[1fr_1.4fr] md:gap-20">
          <Reveal>
            <Heading lead={e.bringTitleLead} accent={e.bringTitleAccent} />
            <ul className="mt-8 flex flex-col gap-3">
              {e.bring.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-base leading-relaxed"
                >
                  <span
                    aria-hidden
                    className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: ORANGE }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
          <div>
            <Reveal>
              <Heading lead={e.faqTitleLead} accent={e.faqTitleAccent} />
            </Reveal>
            <div className="mt-8 flex flex-col">
              {e.faq.map((item, i) => (
                <Reveal key={item.q} delay={120 * (i + 1)}>
                  <FaqItem question={item.q} answer={item.a} first={i === 0} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Closing — the same disabled sign-up. */}
      <section
        className={`${GUTTER} py-20 text-center sm:py-28`}
        style={{ backgroundColor: PAPER }}
      >
        <div className="mx-auto flex max-w-2xl flex-col items-center">
          <Heading lead={e.closingLead} accent={e.closingAccent} />
          <p className="mt-5 text-base leading-relaxed text-neutral-600">
            {e.closingBody}
          </p>
          <div className="mt-8">
            <SignUpButton label={e.ctaDisabled} />
          </div>
        </div>
      </section>
    </div>
  );
}
