/* Substack's own signup, and nothing else now.

   The panel below is an iframe on shammahnei.substack.com. Everything a reader
   types goes to Substack directly, on their origin, into their subscriber list
   and under their consent copy — which is the reason to do it this way.

   The download used to sit under this frame: a button that minted a signed link
   for whoever pressed it, plus a footnote pointing at Substack in case the frame
   never painted. Both were removed deliberately, so this section subscribes and
   does nothing else. Everything behind the button still exists and still works —
   app/api/download/route.ts, app/actions/reveal.ts, lib/download-token.ts,
   scripts/mint-download-link.mjs — but nothing on the page reaches any of it, so
   no reader gets the file until a minted link goes into the publication's welcome
   email. That is this design's open end, not an oversight in this file.

   One box, not two. An outer bg-card wrapper held this panel while the button and
   the footnote were in it. With those gone it had a single child, and since
   --card is #ffffff in light mode — the same white as the panel — it drew a
   second border 24px outside this one around nothing at all.

   Two things about the frame that read as mistakes and are not.

   It is white in both themes. `div.main.typography.use-theme-bg` inside their
   frame paints #fff and nothing out here can reach it, so this is a white panel
   with its own edge: embedded third-party content, looking like it.

   And its height is fixed per breakpoint rather than fitted, because a
   cross-origin frame cannot report its content height and Substack posts no
   resize message. Substack's own snippet is 480x320, and 320 is right — but only
   from about 392px of frame width up, which is what every viewport from `sm` up
   gives it. Below that their description wraps one line longer and 320 fails
   three ways at once: the avatar is clipped off the top, the wordmark they pin to
   the bottom edge prints on top of "collection notice" in the consent line, and
   the frame gains a scrollbar inside this rounded panel. 560 is the smallest
   height measured that clears all three at the 340px a 390px phone leaves.

   Do not tune these by nudging them. The embed switches layout at its own height
   breakpoints — a 50px avatar under ~416px, 85px above — so the numbers in
   between are not interpolations of the ones that work: at desktop width 320
   clears the wordmark by 8px, 336 and 352 both collide with it, and 368 clears
   again by 2. Re-measure instead, and measure the consent line, which is a div
   and the lowest thing in the frame. Every failure here is silent: no console
   error, and at desktop width no scrollbar either.

   No "use client" and no hooks: with the reveal gone there is no state to hold. */

/* The author's own newsletter. Hardcoded, like the contact address in
   components/site-footer.tsx: it is a fact about this site rather than something
   that varies by environment, and the environment here is for secrets and for
   values that differ between deployments. */
const SUBSTACK_URL = "https://shammahnei.substack.com";

export function SubscribeCard() {
  return (
    /* overflow-hidden is what makes the rounding apply to the frame inside. */
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <iframe
        /* An iframe's accessible name comes from title and nothing else, and
           without one a screen reader announces it as an unlabelled frame. */
        title="Subscribe to Shammah Nei on Substack"
        src={`${SUBSTACK_URL}/embed`}
        /* Below the fold on every viewport, and a third-party document: worth
           not fetching until the reader is on their way to it. */
        loading="lazy"
        className="block h-[35rem] w-full border-0 sm:h-[20rem]"
      />
    </div>
  );
}
