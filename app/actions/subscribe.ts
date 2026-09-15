"use server";

import { headers } from "next/headers";

import { DOWNLOAD_TOKEN_TTL_MS, signDownloadToken } from "@/lib/download-token";
import { subscribeToKit } from "@/lib/kit";
import { checkRateLimit } from "@/lib/rate-limit";

/* Subscribe, then mint the download link. In that order, and the order is the
   point.

   This replaces a button that asked the reader whether they had subscribed and
   believed them. Substack could not tell us — their subscribe POST happens inside
   a cross-origin iframe and no API reports it — so the honest name for that
   button was a reveal. Kit answers the call itself, which means the link below is
   minted only after an address is actually on the list. No subscribe, no
   download.

   A Kit failure therefore fails the whole thing, including a Kit outage that has
   nothing to do with the reader. That is what a gate costs, and it is the right
   way round: handing out the file when the signup did not happen is the one
   outcome this is supposed to prevent.

   Everything defensive lives in here rather than in the component, because a
   Server Action is a POST against the page and anyone who can send that POST
   reaches this function — server-actions.md is blunt that the framework's
   Origin-vs-Host check and rotating action id are not authentication. So: a
   length cap before any parsing, a shape check, a decoy field, a per-IP rate
   limit, and a bounded wait on the outbound call. */

export type SubscribeState =
  | { status: "idle" }
  | { status: "ready"; url: string; expiresAt: string; email: string }
  /** `field` marks the message as being about the address itself, which is what
   *  lets the input take aria-invalid and the message sit under it. */
  | { status: "error"; message: string; field?: "email" };

/** Five is more than a person needs and less than a script wants. Keyed by IP, so
 *  read lib/rate-limit.ts on what it is worth once more than one process runs. */
const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };

/** RFC 5321's maximum. Checked before anything else touches the string. */
const EMAIL_MAX = 254;

/* Deliberately loose. The only authority on whether an address exists is its mail
   server, and Kit answers 422 for the ones it will not take, so this rejects the
   shapes that are certainly wrong — no spaces, one @, a dotted domain with no
   empty labels — and leaves the judgement to them. A stricter regex here would
   only reject valid addresses nobody has heard of. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

/** The hidden field in the form. A bot fills every input it finds; a person
 *  cannot reach this one. */
const DECOY_FIELD = "website";

/* One sentence for every failure the reader cannot do anything about — a bad key,
   a wrong form id, Kit being down, Kit being slow. Which one it was belongs in the
   server log, not in a message that would only tell whoever is probing this form
   how our configuration is broken. */
const GENERIC = "Something went wrong signing you up. Try again in a moment.";

/* The claim's email field carries a channel marker rather than the reader's
   address, even now that we have a verified one. The token travels in a URL that
   ends up in browser history, in access logs, and in whatever the reader pastes it
   into, and base64url is not encryption — putting an address in there would leak
   it to everyone who sees the link while buying nothing, because the route has
   nothing to check it against. What it does buy is knowing where a link came from
   if one turns up somewhere it should not. */
const CHANNEL = "kit-signup";

function fieldError(message: string): SubscribeState {
  return { status: "error", message, field: "email" };
}

export async function subscribe(
  _prev: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  /* The decoy first, so a bot costs us no rate-limit budget and no API call. It
     gets the same bland error as a real failure: the usual advice is to answer a
     trap with a fake success, but a success here carries a working download link,
     and a link is worse to hand out than a shrug. */
  const decoy = formData.get(DECOY_FIELD);
  if (typeof decoy === "string" && decoy.trim()) {
    return { status: "error", message: GENERIC };
  }

  const raw = formData.get("email");
  if (typeof raw !== "string") {
    /* Not a typo a person can make — a multipart file part, or a hand-built POST.
       Same answer as an empty field; there is nothing to explain. */
    return fieldError("Enter your email address.");
  }

  /* Capped before it is lowercased or matched, so a megabyte of text in the field
     is rejected on its length rather than run through a regex. */
  if (raw.length > EMAIL_MAX) return fieldError("That address is too long.");

  const email = raw.trim().toLowerCase();
  if (!email) return fieldError("Enter your email address.");
  if (!EMAIL_SHAPE.test(email)) {
    return fieldError("That does not look like an email address.");
  }

  const requestHeaders = await headers();

  /* First hop only. The rest of x-forwarded-for is whatever the client sent and is
     trivially spoofed; the first entry is what the edge in front of us wrote. A
     local run has no such header, hence the fallback — which also means every
     local submission shares one bucket. */
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

  const limit = checkRateLimit(`subscribe:${ip}`, RATE_LIMIT);
  if (!limit.ok) {
    const minutes = Math.max(1, Math.ceil(limit.retryAfterMs / 60_000));
    return {
      status: "error",
      message: `That is a lot of signups from one place. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    };
  }

  /* The page the form was submitted from, which is what Kit's referrer field is
     for: it parses utm_* out of it for their reporting. Bounded and scheme-checked
     because it is a request header and therefore reader-supplied. */
  const referer = requestHeaders.get("referer");
  const referrer =
    referer && /^https?:\/\//.test(referer) && referer.length <= 500
      ? referer
      : undefined;

  const result = await subscribeToKit(email, referrer);

  if (!result.ok) {
    switch (result.reason) {
      case "invalid-email":
        return fieldError("That address was not accepted — check it for a typo.");
      case "throttled":
        return { status: "error", message: "The list is busy. Try again in a minute." };
      case "not-configured":
        /* The one message that names configuration, and only where a developer is
           the one reading it. In production this is a reader looking at a form that
           was deployed without its keys, and the log already says which. */
        return {
          status: "error",
          message:
            process.env.NODE_ENV === "production"
              ? GENERIC
              : "Signup is not configured: set KIT_API_KEY and KIT_FORM_ID in .env.local (see .env.example).",
        };
      default:
        return { status: "error", message: GENERIC };
    }
  }

  /* Kit took the address but will not be mailing this person: they unsubscribed
     once, or bounced, and creating a subscriber does not reset that state. They
     still get the file — they asked for it and they are a known address — but the
     author should be able to see it happening. */
  if (result.state !== "active") {
    console.warn(`[subscribe] Kit reports state "${result.state}" for this signup.`);
  }

  try {
    const { token, expiresAt } = signDownloadToken(CHANNEL, DOWNLOAD_TOKEN_TTL_MS);
    return {
      status: "ready",
      url: `/api/download?t=${encodeURIComponent(token)}`,
      /* An ISO string rather than a Date: action state crosses the network, and
         this is the one representation that survives it intact everywhere. */
      expiresAt: expiresAt.toISOString(),
      email,
    };
  } catch (error) {
    /* Only reachable with DOWNLOAD_LINK_SECRET unset, which requiredEnv throws
       for. Note the shape of this failure: they are on the list and have no file,
       so the message has to admit that rather than tell them to try again. */
    console.error("[subscribe] could not sign a download link:", error);
    return {
      status: "error",
      message:
        "You're on the list, but the download link could not be created. Reply to any newsletter email and I will send you the file.",
    };
  }
}
