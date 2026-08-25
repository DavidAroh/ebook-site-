"use client";

import { Check } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PricingTiersProps {
  onSelectTier: (tier: "standard" | "deluxe") => void;
  onOpenSample: () => void;
}

const TIERS = [
  {
    id: "standard" as const,
    name: "Standard",
    price: "$19",
    summary:
      "The full 38-page handbook, all 15 chapters and 7 tested workflow recipes.",
    features: [
      "38-page handbook in PDF and EPUB",
      "All 7 workflow blueprints",
      "The universal prompt template",
      "Model selection and token strategy",
      "DRM-free, with free lifetime updates",
    ],
  },
  {
    id: "deluxe" as const,
    name: "Deluxe",
    price: "$39",
    summary:
      "Everything in Standard, plus the templates and prompt library to run it.",
    features: [
      "50+ copy-paste prompt vault",
      "Importable Claude Project templates",
      "Three-part audio companion",
      "30-day execution roadmap",
      "Connector guides for Gmail, Notion, Sheets, Slack",
      "Priority email access for questions",
    ],
  },
];

export function PricingTiers({
  onSelectTier,
  onOpenSample,
}: PricingTiersProps) {
  return (
    <section id="buy" className="scroll-mt-16 border-b border-border">
      <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold-ink">
          Pricing
        </p>
        <h2 className="mt-4 text-3xl font-semibold text-foreground sm:text-4xl">
          Two editions
        </h2>
        <p className="mt-5 max-w-[62ch] text-lg leading-relaxed text-muted-foreground">
          One-time payment, no subscription. DRM-free files you keep, with a
          30-day money-back guarantee.
        </p>

        <div className="mt-14 grid gap-10 sm:grid-cols-2 sm:gap-12">
          {TIERS.map((tier) => (
            <div key={tier.id} className={cn("flex flex-col rounded-lg", tier.id === "deluxe" && "ring-1 ring-gold/30")}>
              <div className="flex items-baseline justify-between gap-3 border-b border-border pb-4">
                <h3 className="flex items-center gap-2.5 text-lg font-semibold text-foreground">
                  {tier.name}
                  {tier.id === "deluxe" && (
                    <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gold-ink">
                      Best value
                    </span>
                  )}
                </h3>
                <span className="text-2xl font-semibold tabular-nums text-foreground">
                  {tier.price}
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {tier.summary}
              </p>

              <ul className="mt-6 flex-1 space-y-3 text-sm text-foreground/90">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5">
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-gold-ink"
                    />
                    <span className="leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                variant={tier.id === "deluxe" ? "default" : "outline"}
                onClick={() => onSelectTier(tier.id)}
                className={
                  tier.id === "deluxe"
                    ? "mt-8 h-11 rounded-md bg-gold font-semibold text-ocean-deep hover:bg-gold/90"
                    : "mt-8 h-11 rounded-md"
                }
              >
                Get {tier.name} — {tier.price}
              </Button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onOpenSample}
          className="mt-10 rounded-sm text-sm text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
        >
          Read the free chapters first
        </button>
      </div>
    </section>
  );
}
