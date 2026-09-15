"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

/* Seconds between each block's entrance. The bio reads top to bottom, so the
   reveal follows the reading order rather than firing as one lump. */
const STEP = 0.18;

/* The reading sweep. Duration against stagger is what sets how many words are
   in flight at once — 0.5 over 0.09 keeps about six mid-transition, so the lit
   edge travels through the paragraph as a soft band rather than one word
   snapping at a time. Both are tween-time, and the scrub maps that tween onto
   the scroll distance, so the pacing holds whatever the paragraph's length. */
const SWEEP_DUR = 0.5;
const SWEEP_STAGGER = 0.09;

/* The author's own newsletter, hardcoded for the same reason the address in
   components/site-footer.tsx is: it is a fact about this site rather than
   something that varies by deployment. Same value as components/subscribe-card.tsx
   — the bio's mention and the signup panel point at one publication. */
const SUBSTACK_URL = "https://shammahnei.substack.com";

/* Three organisations, three different relationships to them. In prose this was
   a comma splice — "he runs X, leads engineering at Y and co-founded Z" — so the
   roles sit in the left column instead, where the portrait leaves the page's
   shortest column with room to spare.

   The wording follows the bio exactly: he *runs* Renaissance Innovation Labs,
   which is not the same claim as having founded it, and only Roxanna is his
   co-founding. Do not tidy these into a uniform "Founder". */
const AFFILIATIONS = [
  {
    org: "Renaissance Innovation Labs",
    role: "Runs the lab · Port Harcourt & Dallas",
  },
  { org: "PhilanthroLab", role: "Leads engineering · Dallas" },
  { org: "Roxanna Technologies", role: "Co-founder · software and games" },
];


export function AuthorSection() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia();
    /* The reduced-motion rule in globals.css cannot reach inline styles that
       GSAP writes, so the preference has to gate the code, not the CSS. */
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const splits: SplitText[] = [];
      const sweeps: gsap.core.Tween[] = [];
      const pick = (name: string) =>
        gsap.utils.toArray<HTMLElement>(`[data-reveal="${name}"]`, root);

      /* The reading sweep. Each paragraph's words lift from the body's muted
         grey to full ink as the paragraph crosses the reading zone, scrubbed so
         the lit edge tracks the scroll instead of running on its own clock —
         the reader's progress down the page is the playhead.

         Declared here rather than inside onEnter, and safe to be: a `to` tween
         writes nothing until it renders, and it renders only once the scroll
         reaches its start. There is no from-state to strand, which is the whole
         reason the ramp lives in a CSS custom property with a 0 default rather
         than in the tween's vars. Untriggered is the plain paragraph. */
      pick("sweep").forEach((el) => {
        /* Plain inline spans. `tag: "span"` skips the position and display that
           SplitText writes onto its default div, so the words keep ordinary
           inline layout and the paragraph wraps exactly as it did. `aria: "none"`
           leaves them as real text in the accessibility tree: the default would
           aria-hide every word and put an aria-label on the <p> instead, but
           paragraph is not a role that takes a name from the author, so
           conformant AT drops the label and the bio goes silent. */
        const split = new SplitText(el, {
          type: "words",
          tag: "span",
          wordsClass: "read-word",
          aria: "none",
        });
        splits.push(split);

        sweeps.push(
          gsap.fromTo(
            split.words,
            { "--lit": 0 },
            {
              "--lit": 1,
              duration: SWEEP_DUR,
              stagger: SWEEP_STAGGER,
              /* Linear: the scrub is already the easing the reader feels, and
                 any curve on top of it reads as the page lagging the scroll. */
              ease: "none",
              scrollTrigger: {
                trigger: el,
                /* Starts as the paragraph clears the fold and finishes while it
                   is still above centre, so the lit edge runs just ahead of
                   where the eye is rather than trailing behind it.

                   clamp() on both ends because the bio is the last section
                   before the footer: unclamped, the final paragraph's end
                   position falls past the document's own maximum scroll, so its
                   closing words could never be reached and stayed dim for good.
                   Clamped, the range is squeezed into the scroll that actually
                   exists and the sweep always finishes. */
                start: "clamp(top 80%)",
                end: "clamp(bottom 55%)",
                scrub: 0.6,
              },
            }
          )
        );
      });

      /* Built inside onEnter rather than declared with a scrollTrigger. A tween
         writes its from-vars the moment it is created, so the declared form
         would pin this whole bio at opacity 0 until a scroll event arrives —
         which never comes in a print render, a headless snapshot, or a social
         preview crawl. Untriggered has to mean visible. */
      const trigger = ScrollTrigger.create({
        trigger: root,
        start: "top 78%",
        once: true,
        onEnter: () => {
          gsap.from(pick("portrait"), {
            scale: 0.94,
            opacity: 0,
            duration: 0.85,
            ease: "power3.out",
          });

          /* Line-by-line rise out of a clip, for the heading only. Lines, never
             characters: a character split turns a run of text into an alphabet
             for a screen reader. `aria: auto` (the default) additionally
             re-labels the element with its own original text, which is valid
             here because heading is a role that takes a name from the author. */
          pick("lines").forEach((el, i) => {
            splits.push(
              new SplitText(el, {
                type: "lines",
                mask: "lines",
                linesClass: "reveal-line",
                /* Re-splits when a webfont finishes loading and on resize, so
                   the line boxes always match the layout as it really is. The
                   tween returned below is what gets restored at its current
                   time, which is why it must be its own tween per element and
                   not a slice of a shared timeline. */
                autoSplit: true,
                onSplit: (self) =>
                  gsap.from(self.lines, {
                    /* Past 100% because the mask is a little taller than the
                       line box — see .reveal-line-mask in globals.css. */
                    yPercent: 130,
                    duration: 0.9,
                    stagger: 0.06,
                    ease: "power3.out",
                    delay: STEP * (i + 1),
                  }),
              })
            );
          });

          /* The paragraphs still need to arrive, even though reading them is
             what lights them. Opacity and transform on the <p>, against the
             sweep's custom property on the words inside it, so the two never
             write the same thing. */
          gsap.from(pick("sweep"), {
            y: 14,
            opacity: 0,
            duration: 0.75,
            stagger: 0.1,
            ease: "power2.out",
            delay: STEP * 2,
          });

          gsap.from(pick("fade"), {
            y: 12,
            opacity: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: "power2.out",
            delay: STEP * 3,
          });
        },
      });

      return () => {
        trigger.kill();
        /* Before the splits, so nothing is left writing to nodes that are about
           to be unwrapped. Killing a tween takes its ScrollTrigger with it. */
        for (const sweep of sweeps) sweep.kill();
        /* Puts the plain text back, so React is never handed a DOM full of
           line wrappers it did not render. */
        for (const split of splits) split.revert();
      };
    });

    return () => mm.revert();
  }, []);

  return (
    /* Asymmetric two columns, left-aligned, rather than a centred stack.

       Centred, this was the tallest section on the page at 1366px: a 224px
       portrait sitting on top of two paragraphs capped at a 30rem measure, so
       the copy ran to thirteen lines while roughly half the page's width went
       unused beside it. Side by side, the same words take nine lines and the
       portrait costs no vertical space at all, because the bio is taller than it
       either way.

       max-w-7xl like the sections above it, but the bio track is capped rather
       than left to fill. Uncapped it would be 912px wide, which is 90 characters
       of text-xl. 46rem puts it at about 73 and leaves 128px unused at the right
       edge — invisible, because ragged-right prose does not fill its measure
       anyway. Narrowing the whole section instead would have shown, since its
       left edge would stop agreeing with every other section's.

       46rem and not 44: the heading measures about 720px at its 3rem cap, so the
       two differ by whether "He builds the things he writes about" is one line
       or two.

       Three grid children, not two, and placed explicitly. The left column is
       really two blocks — the portrait and the person's details — and stacking
       them inside one wrapper meant that at mobile width the reader met three
       organisation names and an email address before they had been told whose
       bio this was. Split apart, DOM order is portrait, prose, details, which is
       the right reading order at every width and for a screen reader; the lg
       placement then puts the details back under the portrait, where they close
       the height gap the comment above used to concede. */
    <div
      ref={rootRef}
      id="author"
      className="scroll-mt-24 mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[18rem_minmax(0,46rem)] lg:items-start lg:gap-x-20 lg:gap-y-8"
    >
      <div
        data-reveal="portrait"
        className="relative aspect-square w-56 overflow-hidden rounded-2xl sm:w-64 lg:col-start-1 lg:row-start-1 lg:w-full"
      >
        <Image
          src="/images/shammah-author.jpg"
          alt="Shammah Nei"
          fill
          sizes="(min-width: 1024px) 288px, (min-width: 640px) 256px, 224px"
          className="object-cover"
        />
      </div>

      {/* Second in the DOM, spanning both rows at lg so it still starts level
          with the portrait. */}
      <div className="space-y-6 lg:col-start-2 lg:row-span-2 lg:row-start-1">
        {/* Matched to the download section's h2 instead of running larger than
            it. The old 3.5rem was the second biggest type on the page and this
            is the last section, not the argument. */}
        <h2
          data-reveal="lines"
          className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.1] tracking-tight text-balance text-foreground"
        >
          He builds the things he writes about
        </h2>

        <p
          data-reveal="sweep"
          className="max-w-[68ch] text-xl leading-relaxed text-pretty text-muted-foreground"
        >
          {/* The name opts out of the sweep: --read-dim raises its starting
              colour to full ink, so the mix has nowhere to travel and it sits
              sharp and dark from the start. It is the paragraph's anchor, so it
              should be readable before the reader has scrolled to it rather
              than resolving out of the dim like the rest of the sentence. */}
          <strong className="font-semibold text-foreground [--read-dim:var(--foreground)]">
            Shammah Nei
          </strong>{" "}
          is a software engineer and founder based in Port Harcourt, Nigeria.
          Through Renaissance Innovation Labs he has trained over 150 developers
          across Rivers State &mdash; fellowships, hackathons, Kids Code Club,
          AI Labs, Robotic Labs &mdash; and the lab is now building toward
          robotics and industrial AI for the Niger Delta.
        </p>

        <p
          data-reveal="sweep"
          className="max-w-[68ch] text-xl leading-relaxed text-pretty text-muted-foreground"
        >
          His engineering runs from enterprise AI for contract intelligence and
          document processing, through consumer products in esports and sports
          prediction, to the infrastructure his own companies run on: automated
          QA, autonomous ops agents, multi-tenant agent gateways.
        </p>

        <p
          data-reveal="sweep"
          className="max-w-[68ch] text-xl leading-relaxed text-pretty text-muted-foreground"
        >
          Everything in this handbook was tested in those companies first. He
          writes about building with AI on{" "}
          {/* Inside a swept paragraph, so the text colour has to stay the
              sweep's — an override here would either fight the ramp or strand
              this link at one end of it. The underline carries the affordance
              instead and the clay is in the decoration, which is drawn by the
              anchor and so survives the split into per-word spans. Same
              publication as the signup panel above, and a reader who has got
              this far has already passed that ask, so this is a second chance at
              it rather than a competing one. */}
          <a
            href={SUBSTACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline decoration-clay-ink underline-offset-4 transition-opacity hover:opacity-80"
          >
            his Substack
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          .
        </p>
      </div>

      {/* Last in the DOM, back under the portrait at lg. Both halves belong to
          the person rather than to the prose, which is why they travel together:
          three organisations with three different relationships to them, and the
          one address here.

          Ruled rows, not cards, matching the download section's dl. One fade unit
          rather than one per row — this arrives as a block behind the portrait,
          and three staggered rows beside an animating photograph would be motion
          for its own sake. */}
      <div className="lg:col-start-1 lg:row-start-2">
        <dl data-reveal="fade" className="border-t border-border">
          {AFFILIATIONS.map((item) => (
            <div key={item.org} className="border-b border-border py-3">
              <dt className="text-sm font-medium text-foreground">
                {item.org}
              </dt>
              <dd className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {item.role}
              </dd>
            </div>
          ))}
        </dl>

        <p data-reveal="fade" className="mt-6 text-sm text-muted-foreground">
          <a
            href="mailto:hello@shammahnei.com"
            className="rounded-sm underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
          >
            hello@shammahnei.com
          </a>
        </p>
      </div>
    </div>
  );
}
