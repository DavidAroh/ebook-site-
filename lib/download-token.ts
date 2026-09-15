import { createHmac, timingSafeEqual } from "node:crypto";

import { requiredEnv } from "@/lib/env";

/* Signed, expiring download links.

   The book is not a public file — it lives outside public/ and is only reachable
   through app/api/download, which will not hand it over without a token this
   module minted. The token is a signed claim rather than a database row so the
   flow needs no storage: everything the route has to know travels in the URL,
   and the HMAC is what makes that safe. A reader cannot edit the expiry or forge
   a token without DOWNLOAD_LINK_SECRET.

   Two things mint these:

   - app/actions/subscribe.ts, once per signup Kit accepted. This is the gate: the
     token exists because an address actually reached the list. No link to the PDF
     appears in the served HTML, each one expires, and rotating
     DOWNLOAD_LINK_SECRET invalidates every one at once.
   - scripts/mint-download-link.mjs, by hand, for a link pasted into whatever email
     Kit is set to send. Long TTL, because nobody re-issues an email.

   Neither names the reader, and the signup one now could — Kit hands back a real
   address. It deliberately does not. The token travels in a URL that ends up in
   browser history and access logs, and base64url is not encryption, so an address
   in the claim would leak to everyone who sees the link while buying nothing: the
   route has nothing to compare it against. Both minters put a channel marker in
   the email field instead, which is what makes a link that turns up somewhere it
   should not traceable to where it came from. The field keeps its name because the
   format is what verifyDownloadToken checks, and because a per-address link is
   still the better design the day the route has something to check it against. */

/** A week — long enough that a reader who saves the link and comes back at the
 *  weekend still has a file, short enough that a link pasted into a group chat
 *  stops working. The welcome-email link is minted with an explicit, much longer
 *  TTL, because nobody re-issues an email. */
export const DOWNLOAD_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type DownloadClaim = {
  email: string;
  /** Expiry as epoch milliseconds. */
  exp: number;
};

export type VerifyResult =
  | { ok: true; claim: DownloadClaim }
  | { ok: false; reason: "malformed" | "bad-signature" | "expired" };

function signPayload(payload: string): Buffer {
  return createHmac("sha256", requiredEnv("DOWNLOAD_LINK_SECRET"))
    .update(payload)
    .digest();
}

export function signDownloadToken(
  email: string,
  ttlMs: number = DOWNLOAD_TOKEN_TTL_MS
): { token: string; expiresAt: Date } {
  const exp = Date.now() + ttlMs;
  const claim: DownloadClaim = { email, exp };
  const payload = Buffer.from(JSON.stringify(claim)).toString("base64url");

  return {
    token: `${payload}.${signPayload(payload).toString("base64url")}`,
    expiresAt: new Date(exp),
  };
}

export function verifyDownloadToken(token: string): VerifyResult {
  const dot = token.indexOf(".");
  if (dot < 1 || dot === token.length - 1) return { ok: false, reason: "malformed" };

  const payload = token.slice(0, dot);
  const provided = Buffer.from(token.slice(dot + 1), "base64url");
  const expected = signPayload(payload);

  /* Length first: timingSafeEqual throws on a size mismatch rather than
     returning false, so a truncated signature would surface as a 500 instead of
     a 403 without this guard. */
  if (
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  ) {
    return { ok: false, reason: "bad-signature" };
  }

  /* Past this point the payload is ours, but still parsed defensively — the
     shape check costs nothing and keeps a future format change from throwing. */
  let claim: unknown;
  try {
    claim = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return { ok: false, reason: "malformed" };
  }

  if (
    typeof claim !== "object" ||
    claim === null ||
    typeof (claim as DownloadClaim).email !== "string" ||
    typeof (claim as DownloadClaim).exp !== "number"
  ) {
    return { ok: false, reason: "malformed" };
  }

  const valid = claim as DownloadClaim;
  if (valid.exp <= Date.now()) return { ok: false, reason: "expired" };

  return { ok: true, claim: valid };
}
