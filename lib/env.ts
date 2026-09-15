/* Configuration access. Every value the signup flow needs lives in the
   environment (see .env.example), and a missing one should say which one it is
   rather than letting `undefined` travel into a fetch URL or an HMAC key and
   fail somewhere unrecognisable. */

/** Throws with the variable's name if it is unset or blank. */
export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(
      `Missing required environment variable ${name}. See .env.example.`
    );
  }
  return value.trim();
}

/** Returns undefined for unset or blank, so a blank line in .env reads as absent. */
export function optionalEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}
