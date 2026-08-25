"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  /** Stagger index for cascading reveals (0-based). */
  index?: number;
  /** Delay before the animation starts in ms. Ignored when index is set. */
  delay?: number;
}

export function FadeIn({ children, className, index, delay }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("fade-in-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const staggerDelay =
    index !== undefined ? `calc(${index} * 80ms)` : undefined;
  const explicitDelay = delay !== undefined ? `${delay}ms` : undefined;

  return (
    <div
      ref={ref}
      className={cn("fade-in-hidden", className)}
      style={
        {
          "--fade-delay": staggerDelay ?? explicitDelay,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
