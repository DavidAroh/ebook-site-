"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { cn } from "@/lib/utils";

/* The book is the hero's LCP element, so three.js must not stand between the
   page and its first paint. The flat printed cover ships in the first chunk with
   priority, WebGL arrives on its own schedule, and the two crossfade once the
   scene has a frame on screen. No WebGL, a blocked chunk, a slow connection or a
   lost context all land on the same fallback: the real cover, flat. */
const BookWebGL = dynamic(() => import("./book-webgl"), { ssr: false });

/* Room for the canvas, which overhangs the cover box on every side because
   perspective magnifies whichever corner of the book swings toward the viewer.
   Must stay >= the OVERHANG in book-webgl.tsx; reserving it here is what keeps
   the canvas from covering neighbouring content and eating its clicks. */
const PAD_X = 0.176;
const PAD_Y = PAD_X * 1.5;

interface Book3DProps {
  className?: string;
}

export function Book3D({ className }: Book3DProps) {
  const [live, setLive] = useState(false);
  const onReady = useCallback((ready: boolean) => setLive(ready), []);

  return (
    <div
      className={cn(
        /* The cover width, and the only number that sets this component's size —
           everything else here is a ratio of it.

           lg is deliberately the same as it was while every other step grew. The
           hero splits into two columns at lg, and the book's column is the cover
           plus its overhang: 487px of a 1024px viewport's 976px of content. The
           copy beside it already only gets 409px there, so widening the book at
           lg specifically is what would push the h1 to a third line. xl has
           256px more to spend and takes the increase instead.

           The base step does not grow either, for a different reason: the whole
           box is cover * 1.352 wide, which is 351px against the 342px a 390px
           viewport leaves, so main's overflow-x-hidden is already trimming a few
           pixels off each side of the canvas. Touch gets yaw, so that reserve is
           in active use there — 280px would have taken the trim from 5px a side
           to 18px and started clipping the far corner of a turned book. */
        "relative w-fit select-none [--cover:260px] sm:[--cover:340px] lg:[--cover:360px] xl:[--cover:400px]",
        className
      )}
      style={{
        padding: `calc(var(--cover) * ${PAD_Y}) calc(var(--cover) * ${PAD_X})`,
      }}
    >
      {/* The cover box. Everything below is positioned against it, so the still
          and the render are framed identically and the handover is invisible. */}
      <div className="relative aspect-[1/1.5] w-[var(--cover)]">
        {/* Contact shadow. Outside the crossfade, because it is the one piece
            both states need: the WebGL scene has no ground plane (a camera this
            close to level projects one into a hard slab), so this soft ellipse is
            the book's contact with the surface in both. A cream cover on a cream
            page has almost no edge contrast, and this does most of the work of
            lifting it off. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-4 left-[12%] right-[12%] block h-6 rounded-[50%] bg-black/25 blur-[22px] dark:bg-black/70"
        />

        {/* Flat cover. Held at opacity 0 rather than removed once WebGL takes
            over: the canvas is aria-hidden, so this <img> stays the book's only
            text alternative for the whole life of the page. */}
        <div
          className="absolute inset-0 transition-opacity duration-700 ease-out"
          style={{ opacity: live ? 0 : 1 }}
        >
          <span className="relative block h-full w-full overflow-hidden rounded-[3px] shadow-[0_4px_18px_rgba(35,41,45,0.16)] ring-1 ring-[#23292d]/15">
            <Image
              src="/images/the-new-way-of-work-cover.jpg"
              alt="The New Way of Work: A Practical Guide to Automate, Amplify and Work Smarter with AI — First Edition, by Shammah Nei"
              fill
              priority
              sizes="(min-width: 1280px) 400px, (min-width: 1024px) 360px, (min-width: 640px) 340px, 260px"
              className="object-cover"
            />

            {/* A cover always darkens toward the hinge. Faint, because at 45%
                black over cream it reads as a smudge rather than a fold. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 block w-7 bg-gradient-to-r from-black/16 via-black/4 to-transparent"
            />
          </span>
        </div>

        {/* Kept out of the tree until it has drawn, so the crossfade never
            reveals a blank canvas or a cream book with no cover on it. */}
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-out",
            !live && "pointer-events-none"
          )}
          style={{ opacity: live ? 1 : 0 }}
        >
          <BookWebGL onReady={onReady} className="absolute inset-0" />
        </div>
      </div>
    </div>
  );
}
