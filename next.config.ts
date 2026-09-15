import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* app/api/download reads the book with fs.readFile, which the bundler cannot
     trace, so private/ has to be named explicitly or it is absent from a
     serverless build — the route then 404s in production while working locally. */
  outputFileTracingIncludes: {
    "/api/download": ["./private/**/*"],
  },
};

export default nextConfig;
