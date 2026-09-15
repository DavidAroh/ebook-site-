import { optionalEnv } from "@/lib/env";

/* Kit (formerly ConvertKit) — the half of the signup that makes it a gate.

   Why this module exists at all: Substack publishes no write API, so the page
   could never learn whether anyone had subscribed. The button under their iframe
   could only take the reader's word for it. Kit's API is supported and documented,
   so the server makes the call itself and sees the answer — which is the whole
   reason app/actions/subscribe.ts can refuse to mint a download link when the
   subscribe fails.

   Two calls per signup, in this order:

   1. POST /v4/subscribers — an upsert. 201 for an address Kit has not seen, 200
      when it already has it, and no duplicate either way. This is the call that
      has to succeed: if it does not, nobody is on the list and there is nothing to
      unlock.
   2. POST /v4/forms/{id}/subscribers — attaches them to the form, which is what
      files them under it in Kit's dashboard and triggers whatever that form is set
      to send. Best-effort: by the time it runs the address is already captured, so
      a failure here is logged and does not fail the signup.

   The by-email form endpoint documents a subscriber that "must already exist",
   which is exactly what step one guarantees. It also documents a bare email
   address as its only required field and a 201 among its answers, so it may well
   upsert on its own; doing both in order is right either way and costs one round
   trip.

   Two things to be plain about. A subscriber created this way defaults to `active`
   — the v4 API has no confirmation step, so there is no double opt-in on this
   path, and the consent is the reader typing their address into a form that says
   what it signs them up for. And anyone can type someone else's address here, so
   the form is a way to put a stranger on the list; the rate limit in the action is
   what bounds that, and Kit's own confirmation email is the fix if it ever starts
   happening for real.

   Nothing here throws. Every failure comes back as a reason the action decides
   about, because a network error in a form handler should be a message, not a
   stack trace. */

const API_BASE = "https://api.kit.com/v4";

/** Per call, so the worst case a reader waits is twice this. Long enough for a
 *  slow answer, short enough that a hung request does not hold the form open. */
const TIMEOUT_MS = 8_000;

export type KitFailure =
  | "not-configured"
  | "invalid-email"
  | "auth"
  | "unknown-form"
  | "throttled"
  | "unreachable"
  | "upstream";

export type KitResult =
  | { ok: true; state: string }
  | { ok: false; reason: KitFailure };

/* Both values, and a form id that is actually an id. Kit's dashboard URL for a
   form is app.kit.com/forms/1234567/edit, and the number in the middle is what
   this wants — not the whole URL and not the form's uid, both of which are easy
   things to paste and would fail later as an unexplained 404. */
function readConfig(): { key: string; formId: string } | null {
  const key = optionalEnv("KIT_API_KEY");
  const formId = optionalEnv("KIT_FORM_ID");

  if (!key || !formId) {
    console.error(
      "[kit] KIT_API_KEY and KIT_FORM_ID must both be set. See .env.example."
    );
    return null;
  }

  if (!/^\d+$/.test(formId)) {
    console.error(
      `[kit] KIT_FORM_ID should be the number from your form's URL, not ${JSON.stringify(formId)}.`
    );
    return null;
  }

  return { key, formId };
}

type KitCall =
  | { ok: true; status: number; body: unknown }
  | { ok: false; reason: KitFailure };

/** Kit answers errors as `{ errors: ["..."] }`. Read defensively anyway: a
 *  gateway in front of them can answer HTML, and this runs on the error path
 *  where throwing would be worst. */
async function describe(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    const errors = (body as { errors?: unknown }).errors;
    if (Array.isArray(errors)) return errors.join("; ");
    return JSON.stringify(body).slice(0, 200);
  } catch {
    return "(unreadable body)";
  }
}

async function post(
  path: string,
  key: string,
  body: Record<string, string>
): Promise<KitCall> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-kit-api-key": key },
      body: JSON.stringify(body),
      /* A form handler cannot wait indefinitely on a third party. */
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (error) {
    /* DNS, TLS, a dropped socket, or our own timeout — all indistinguishable from
       here and all mean the same thing to the reader. */
    console.error(`[kit] POST ${path} did not answer:`, error);
    return { ok: false, reason: "unreachable" };
  }

  if (response.ok) {
    let parsed: unknown = null;
    try {
      parsed = await response.json();
    } catch {
      /* A 2xx with an unreadable body still means it worked. */
    }
    return { ok: true, status: response.status, body: parsed };
  }

  /* Logged with the status and Kit's own message, because these are the failures
     whoever deploys this has to act on, and the reader sees none of it. No email
     address in the log line: it is the one piece of personal data here and a log
     is the easiest place to forget it. */
  console.error(`[kit] POST ${path} → ${response.status}: ${await describe(response)}`);

  switch (response.status) {
    case 401:
    case 403:
      return { ok: false, reason: "auth" };
    case 404:
      return { ok: false, reason: "unknown-form" };
    case 422:
      return { ok: false, reason: "invalid-email" };
    case 429:
      return { ok: false, reason: "throttled" };
    default:
      return { ok: false, reason: "upstream" };
  }
}

/** The documented shape is `{ subscriber: { state, ... } }`. Read through it
 *  without trusting it, so a schema change is an "unknown" rather than a throw. */
function stateOf(body: unknown): string {
  const subscriber = (body as { subscriber?: unknown } | null)?.subscriber;
  const state = (subscriber as { state?: unknown } | undefined)?.state;
  return typeof state === "string" ? state : "unknown";
}

/**
 * Adds `email` to the Kit list and files them under the configured form.
 *
 * `referrer` is passed straight through to Kit, which parses utm_* out of it for
 * its own reporting — the page URL the form was submitted from is exactly what it
 * wants, and it is the reader's own current page, not anything we track.
 */
export async function subscribeToKit(
  email: string,
  referrer?: string
): Promise<KitResult> {
  const config = readConfig();
  if (!config) return { ok: false, reason: "not-configured" };

  const created = await post("/subscribers", config.key, { email_address: email });
  if (!created.ok) return created;

  const attached = await post(
    `/forms/${config.formId}/subscribers`,
    config.key,
    referrer ? { email_address: email, referrer } : { email_address: email }
  );

  /* Deliberately not fatal. The address is on the list either way, which is what
     the download is gated on; what is lost is the form attribution and whatever
     the form would have sent. Worth knowing about, not worth refusing a reader
     who did everything right. */
  if (!attached.ok) {
    console.error(
      `[kit] subscribed, but could not attach to form ${config.formId} (${attached.reason}).`
    );
  }

  return { ok: true, state: stateOf(created.body) };
}
