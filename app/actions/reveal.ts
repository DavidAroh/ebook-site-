"use server";

import { headers } from "next/headers";

import { DOWNLOAD_TOKEN_TTL_MS, signDownloadToken } from "@/lib/download-token";
import { checkRateLimit } from "@/lib/rate-limit";

/* Mint a download link on request. No condition, and the name says so.

   This is a reveal, not a gate, and the difference is the whole story of the
   section it serves. Signup happens in Substack's own iframe, which POSTs to
   their origin; they publish no write API and no webhook, so this server never
   learns that it happened. A button that claims to check therefore cannot, and
   the honest version is the one below: it hands out a link to whoever asks.

   Which means the file is effectively public. That is a deliberate trade the
   author made — the embed keeps signup inside Substack's own consent flow and
   subscriber list, and the price is that "no subscription, no download" is not
   enforceable from here. app/actions/subscribe.ts still holds the version that
   does enforce it, against Kit, unused for now; nothing in this file replaces it
   or should be mistaken for it.

   What survives the trade is worth naming precisely, because it is the only
   thing left. No working link exists in the HTML this page serves: the token is
   minted per POST, so a crawler that never presses the button never sees one,
   each one expires, and rotating DOWNLOAD_LINK_SECRET kills every one already
   handed out. Minting at render time instead would have put a live link in the
   source of every page load and thrown that away too.

   A Server Action is a POST against the page and anyone able to send it reaches
   this function, so the rate limit below is the only thing bounding how fast the
   file can be pulled. There is no field to validate — the form carries nothing,
   which is exactly what makes it a reveal. */

export type RevealState =
  | { status: "idle" }
  | { status: "ready"; url: string; expiresAt: string }
  | { status: "error"; message: string };

/** Higher than the signup form's five, on purpose. That limit counted signups,
 *  which one person does once; this counts readers taking the file, and behind a
 *  carrier or office NAT they all arrive from one address. Twenty per ten minutes
 *  still stops a script from treating this as a CDN. Per-process — see
 *  lib/rate-limit.ts for what that is worth once more than one is running. */
const RATE_LIMIT = { limit: 20, windowMs: 10 * 60 * 1000 };

/* The claim's email field carries a marker for where the link came from rather
   than an address, here because there is no address to carry: Substack never
   tells us who subscribed. It stays useful anyway — a link that turns up in a
   forum post can be traced to this path rather than to the Kit signup or to a
   hand-minted one from scripts/mint-download-link.mjs. */
const CHANNEL = "substack-reveal";

/* No parameters, and that is the design rather than an oversight. useActionState
   calls this with (prevState, formData); both are ignored, because a reveal has
   nothing to read — the form it backs carries no fields, so there is no address
   to validate, no decoy worth setting, and nothing a caller can say that would
   change the answer. Leaving them off the signature says so in the one place a
   reader cannot miss it, and TypeScript accepts it where the two-argument shape
   is expected. */
export async function revealDownload(): Promise<RevealState> {
  const requestHeaders = await headers();

  /* First hop only. The rest of x-forwarded-for is whatever the client sent; the
     first entry is what the edge in front of us wrote. A local run has no such
     header, so every local press shares one bucket. */
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

  const limit = checkRateLimit(`reveal:${ip}`, RATE_LIMIT);
  if (!limit.ok) {
    const minutes = Math.max(1, Math.ceil(limit.retryAfterMs / 60_000));
    return {
      status: "error",
      message: `That is a lot of downloads from one place. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    };
  }

  try {
    const { token, expiresAt } = signDownloadToken(CHANNEL, DOWNLOAD_TOKEN_TTL_MS);
    return {
      status: "ready",
      url: `/api/download?t=${encodeURIComponent(token)}`,
      /* An ISO string rather than a Date: action state crosses the network, and
         this is the one representation that survives it intact everywhere. */
      expiresAt: expiresAt.toISOString(),
    };
  } catch (error) {
    /* Only reachable with DOWNLOAD_LINK_SECRET unset, which requiredEnv throws
       for. The reader can do nothing about it and neither message nor log should
       be the first place the author finds out, so both say something. */
    console.error("[reveal] could not sign a download link:", error);
    return {
      status: "error",
      message:
        "The download link could not be created. Email hello@shammahnei.com and I will send you the file.",
    };
  }
}
