# private/

Files served only through a signed, expiring link — never as static assets.

Put the sample PDF here as **`the-new-way-of-work-sample.pdf`** (the filename
`app/api/download/route.ts` looks for). Until it exists, a valid download link
returns a 404 page rather than a broken file.

Why not `public/downloads/`? Everything under `public/` is served statically, so a
PDF there is fetchable by anyone who guesses the name and the signed link becomes
decoration. `private/` is outside the static root and is only readable by the
route handler.

Two things to know:

- The file has to reach the deployment. `next.config.ts` names this directory in
  `outputFileTracingIncludes` for `/api/download`, because a path read through
  `fs` cannot be traced by the bundler. Committing the file is the simplest way
  to be sure it ships.
- That is fine for a giveaway sample. If this ever holds the full paid book,
  committing it puts the whole book in the git history — mount it or fetch it from
  object storage instead.
