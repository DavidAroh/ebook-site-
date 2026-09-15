/* A rate limiter that lives in one process, and the caveat that comes with that.

   The signup action is an unauthenticated entry point by design — a public form
   has to be — and it makes a call to a third party and mints a signed link on the
   way through, so the only thing standing between it and a script is this. It also
   bounds the one abuse a signup form cannot design away: anyone can type a
   stranger's address, and Kit v4 adds it with no confirmation step.

   Per-process, in memory. On a single long-lived server that is a real limit. On a
   serverless platform every cold start gets an empty Map and several instances run
   at once, so the effective limit is this one multiplied by however many instances
   are warm — enough to stop a browser held on the button, not enough to stop
   someone deliberate. A shared store (Redis, Upstash, Vercel KV) is the upgrade,
   and the call sites do not have to change for it: keep this signature.

   Deliberately not a dependency. It is thirty lines, and a limiter is the kind of
   thing you want to be able to read in full. */

type Attempt = number[];

/** Bounded, so a stream of distinct keys cannot grow this without limit. Map
 *  iterates in insertion order, which is what makes evicting the oldest cheap. */
const MAX_KEYS = 5_000;

const attempts = new Map<string, Attempt>();

export type RateLimitResult = {
  ok: boolean;
  /** How long until the caller's oldest attempt falls out of the window. 0 when
   *  ok, so a caller can render "try again in N minutes" without recomputing. */
  retryAfterMs: number;
};

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;

  /* Pruned on read rather than on a timer: there is no scheduler in a serverless
     function, and a key nobody touches costs nothing until it is touched. */
  const recent = (attempts.get(key) ?? []).filter((t) => t > cutoff);

  if (recent.length >= limit) {
    /* Re-set the pruned list even on rejection, so a hot key's array cannot keep
       growing while it is being refused. */
    attempts.set(key, recent);
    return { ok: false, retryAfterMs: recent[0] + windowMs - now };
  }

  recent.push(now);
  /* Delete first so a repeat key moves to the back of the insertion order and
     eviction stays least-recently-used rather than first-ever-seen. */
  attempts.delete(key);
  attempts.set(key, recent);

  while (attempts.size > MAX_KEYS) {
    const oldest = attempts.keys().next();
    if (oldest.done) break;
    attempts.delete(oldest.value);
  }

  return { ok: true, retryAfterMs: 0 };
}
