"use client";

import React, { useRef, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Book3DProps {
  className?: string;
  onSampleClick?: () => void;
}

const REST_X = -2;
const REST_Y = 10;

export function Book3D({ className, onSampleClick }: Book3DProps) {
  const bookRef = useRef<HTMLSpanElement>(null);

  /* Tilt is driven through CSS custom properties rather than React state, so
     pointer movement never triggers a re-render. */
  const setTilt = useCallback((x: number, y: number) => {
    bookRef.current?.style.setProperty("--tilt-x", `${x}deg`);
    bookRef.current?.style.setProperty("--tilt-y", `${y}deg`);
  }, []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType !== "mouse") return;
      const rect = event.currentTarget.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      setTilt(-ny * 7, REST_Y + nx * 9);
    },
    [setTilt]
  );

  const handleLeave = useCallback(() => setTilt(REST_X, REST_Y), [setTilt]);

  return (
    <button
      type="button"
      onClick={onSampleClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handleLeave}
      onBlur={handleLeave}
      className={cn(
        "perspective-1200 group rounded-md p-4 select-none",
        className
      )}
    >
      <span
        ref={bookRef}
        className="transform-style-3d relative block w-[220px] sm:w-[248px] aspect-[1/1.5] transition-transform duration-500 ease-out"
        style={{
          transform:
            "rotateX(var(--tilt-x, -2deg)) rotateY(var(--tilt-y, 10deg))",
        }}
      >
        {/* Page block along the fore edge */}
        <span
          className="absolute inset-y-1 right-0 block w-[14px] origin-right rounded-r-[2px] bg-[#f2ece0]"
          style={{
            transform: "rotateY(90deg) translateX(14px)",
            backgroundImage:
              "repeating-linear-gradient(to right, #faf6ee 0 1px, #ded5c2 1px 2px)",
          }}
        />

        {/* Spine */}
        <span
          className="absolute inset-y-0 left-0 flex w-[16px] origin-left items-center justify-center rounded-l-[2px] bg-ocean-deep"
          style={{ transform: "rotateY(-90deg) translateX(-16px)" }}
        >
          <span className="-rotate-90 text-[9px] font-medium tracking-[0.18em] whitespace-nowrap text-white/70 uppercase">
            Automating with AI
          </span>
        </span>

        {/* Front cover */}
        <span className="relative block h-full w-full overflow-hidden rounded-[3px] shadow-[0_2px_16px_rgba(0,0,0,0.06)] ring-1 ring-black/10">
          <Image
            src="/images/ai-book-cover.jpg"
            alt="Automating with AI: Beginner Handbook by Shammah Nei"
            fill
            priority
            sizes="248px"
            className="object-cover"
          />
          {/* Spine shading on the binding edge */}
          <span className="pointer-events-none absolute inset-y-0 left-0 block w-6 bg-gradient-to-r from-black/35 to-transparent" />
        </span>
      </span>

    </button>
  );
}
