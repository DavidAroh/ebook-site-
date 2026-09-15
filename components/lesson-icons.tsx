import { cn } from "@/lib/utils";

/* Animated icons for the three lesson cards. Inline SVG drawn in currentColor
   and animated with the icon-* keyframes in globals.css, so they follow the
   theme and are covered by the global prefers-reduced-motion rule.

   Every shape is visible in its static state — the animations only move things
   that are already drawn — so a frozen, headless, or reduced-motion render
   still reads correctly. Decorative, so aria-hidden. */

interface IconProps {
  className?: string;
}

const SVG = {
  viewBox: "0 0 96 96",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": true,
} as const;

const STROKE = {
  stroke: "currentColor",
  strokeWidth: 2.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/* One prompt goes out, three clarifying questions come back. */
export function PromptIcon({ className }: IconProps) {
  return (
    <svg {...SVG} className={cn("text-clay-ink", className)}>
      <g {...STROKE}>
        <rect x="6" y="42" width="52" height="30" rx="9" />
        <path d="M18 72v9l10-9" />
        <path d="M16 53h28" opacity="0.45" />
        <path d="M16 62h17" opacity="0.45" />
        <path className="icon-blink" d="M39 58v8" />

        <g className="icon-float-1">
          <circle cx="67" cy="41" r="7" opacity="0.6" />
          <path d="M67 41h.01" />
        </g>
        <g className="icon-float-2">
          <circle cx="81" cy="25" r="8" opacity="0.6" />
          <path d="M81 25h.01" />
        </g>
        <g className="icon-float-3">
          <circle cx="62" cy="14" r="6" opacity="0.6" />
          <path d="M62 14h.01" />
        </g>
      </g>
    </svg>
  );
}

/* Reference material settling into a container once, instead of every session. */
export function ProjectIcon({ className }: IconProps) {
  return (
    <svg {...SVG} className={cn("text-clay-ink", className)}>
      <g {...STROKE}>
        <rect className="icon-float-3" x="30" y="12" width="36" height="11" rx="3" opacity="0.55" />
        <rect className="icon-float-2" x="26" y="29" width="44" height="11" rx="3" opacity="0.75" />
        <rect className="icon-float-1" x="22" y="46" width="52" height="11" rx="3" />
        <path d="M12 62v11a9 9 0 0 0 9 9h54a9 9 0 0 0 9-9V62" />
      </g>
    </svg>
  );
}

/* Work moving through a pipeline on its own: in, processed, out. */
export function FlowIcon({ className }: IconProps) {
  const wires = [
    "M22 48h16",
    "M58 44c10 0 11-18 17-18",
    "M58 52c10 0 11 18 17 18",
  ];

  return (
    <svg {...SVG} className={cn("text-clay-ink", className)}>
      <g {...STROKE}>
        {wires.map((d) => (
          <path key={d} d={d} opacity="0.3" />
        ))}
        {wires.map((d, i) => (
          <path
            key={`pulse-${d}`}
            d={d}
            strokeDasharray="7 90"
            className={`icon-dash-${i + 1}`}
          />
        ))}

        <circle cx="15" cy="48" r="7" opacity="0.8" />
        <rect className="icon-breathe" x="38" y="38" width="20" height="20" rx="6" />
        <circle cx="81" cy="26" r="6" opacity="0.8" />
        <circle cx="81" cy="70" r="6" opacity="0.8" />
      </g>
    </svg>
  );
}
