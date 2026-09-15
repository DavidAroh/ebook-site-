/* Mints the download link that goes in the email Kit sends a new subscriber.
 *
 * The site itself no longer needs this: app/actions/subscribe.ts mints a link per
 * signup, on the page, once Kit has accepted the address. This is the email copy —
 * the one a reader still has after they close the tab, and the reason a lost link
 * is not a lost sale. It is gated by the list rather than by a form: only a
 * subscriber gets that email, so only a subscriber gets this URL.
 *
 * One shared link rather than one per address, so it wants a long life — the
 * default here is ten years. Run it again to rotate; the old link keeps working
 * until it expires, so rotating alone does not revoke anything. To kill every link
 * at once, change DOWNLOAD_LINK_SECRET in .env.local.
 *
 *   node scripts/mint-download-link.mjs                 # ten years, local origin
 *   node scripts/mint-download-link.mjs https://yoursite.com
 *   node scripts/mint-download-link.mjs https://yoursite.com 365
 *
 * The token format is defined by lib/download-token.ts and has to stay in step
 * with verifyDownloadToken: base64url(JSON claim) + "." + base64url(HMAC-SHA256
 * of that payload string). It is duplicated rather than imported because this is
 * plain Node with no TypeScript path aliases to resolve.
 */

import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/* .env.local rather than process.env: this is run by hand, and Node does not
   load Next's env files. Only DOWNLOAD_LINK_SECRET is read, and its value is
   never printed. */
function secret() {
  let file;
  try {
    file = readFileSync(join(ROOT, ".env.local"), "utf8");
  } catch {
    throw new Error(".env.local not found — copy .env.example and fill it in.");
  }

  const value = (file.match(/^\s*DOWNLOAD_LINK_SECRET\s*=(.*)$/m)?.[1] ?? "")
    .trim()
    .replace(/^["']|["']$/g, "");

  if (!value) {
    throw new Error(
      "DOWNLOAD_LINK_SECRET is empty in .env.local. Generate one with:\n" +
        '  node -e "console.log(require(\'node:crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  return value;
}

const origin = (process.argv[2] ?? "http://localhost:3001").replace(/\/+$/, "");
const days = Number(process.argv[3] ?? 3650);

if (!Number.isFinite(days) || days <= 0) {
  console.error(`Not a number of days: ${process.argv[3]}`);
  process.exit(1);
}

const exp = Date.now() + days * 24 * 60 * 60 * 1000;

/* The claim's "email" field is what a per-reader link used for tracing. There is
   no single reader here, so it records where the link was published instead —
   which is the useful thing to know if the URL turns up somewhere else. */
const payload = Buffer.from(
  JSON.stringify({ email: "kit-welcome-email", exp })
).toString("base64url");

const signature = createHmac("sha256", secret())
  .update(payload)
  .digest()
  .toString("base64url");

const expiry = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "long",
  timeZone: "UTC",
}).format(new Date(exp));

console.log(`
Paste this into the email your Kit form sends (Kit -> your form -> Settings ->
Incentive email, or whatever automation you have on the form):

  ${origin}/api/download?t=${payload}.${signature}

Valid until ${expiry}. Anyone holding the URL can download, so keep it to that
email — that is what makes subscribing the price of the file.
`);
