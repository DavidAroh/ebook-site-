import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

import type { NextRequest } from "next/server";

import { verifyDownloadToken } from "@/lib/download-token";

/* The gated download.

   The book deliberately does not live in public/. Everything under public/ is
   served as a static asset, so a PDF there is fetchable by anyone who guesses the
   filename and the signed link protecting it would be decoration. It lives in
   private/ at the project root instead, and this is the only way to reach it.

   Reading it with fs means the bundler cannot trace the dependency, so
   next.config.ts names private/ in outputFileTracingIncludes for this route —
   without that the file is missing from a serverless build and every download
   404s in production while working locally.

   Reading request.url opts this route out of prerendering on its own; no dynamic
   export is needed. */

const FILENAME = "the-new-way-of-work-sample.pdf";
const FILE_PATH = path.join(process.cwd(), "private", FILENAME);

/* One sentence for both no-token and bad-token, because they must be
   indistinguishable: naming the difference would tell someone probing the route
   whether their forgery got as far as the signature check. It points at the one
   place a real link comes from. */
const NEEDS_A_LINK =
  "Subscribe on the site and your download link appears there.";

function page(status: number, title: string, body: string): Response {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title></head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#faf9f5;color:#141413;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<div style="max-width:34ch;padding:24px;text-align:center;">
<h1 style="margin:0 0 12px;font-size:20px;font-weight:600;letter-spacing:-0.02em;">${title}</h1>
<p style="margin:0;font-size:15px;line-height:1.6;color:#5f5c54;">${body}</p>
</div></body></html>`,
    {
      status,
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
    }
  );
}

export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get("t");

  if (!token) {
    return page(403, "Link not valid", NEEDS_A_LINK);
  }

  const result = verifyDownloadToken(token);

  if (!result.ok) {
    /* Expiry is only reported once the signature has verified, so saying so
       reveals nothing to anyone who could not already mint a token. A malformed
       or unsigned token gets the same answer as no token at all. */
    if (result.reason === "expired") {
      return page(
        403,
        "This link has expired",
        "Links last a week. Enter the same address on the site again for a fresh one — you will not be added to the list twice."
      );
    }
    return page(403, "Link not valid", NEEDS_A_LINK);
  }

  /* stat before streaming, so a missing file is still an error page. Once the
     body starts the status is already sent and a read failure can only truncate
     the download — which is why the one likely failure gets checked up front. */
  let size: number;
  try {
    size = (await stat(FILE_PATH)).size;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.error(`[download] ${FILE_PATH} is missing.`);
      return page(
        404,
        "Not available yet",
        "The file is not on the server yet. Try again shortly."
      );
    }
    console.error("[download] could not read the book:", error);
    return page(500, "Something went wrong", "Try that link again in a moment.");
  }

  /* Streamed rather than buffered: a multi-megabyte PDF held in memory per
     concurrent request is the one way this route could hurt the server. The cast
     bridges node:stream's ReadableStream and the DOM one, which are structurally
     the same object and separate types. */
  const body = Readable.toWeb(
    createReadStream(FILE_PATH)
  ) as ReadableStream<Uint8Array>;

  return new Response(body, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${FILENAME}"`,
      "content-length": String(size),
      /* Per-reader and time-limited, so no shared cache should ever hold it. */
      "cache-control": "private, no-store",
    },
  });
}
