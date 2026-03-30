const ALLOWED_ORIGINS: string[] = [
  import.meta.env.VITE_SITE_URL,
  'https://cultif.com',
  'https://www.cultif.com',
].filter(Boolean);

if (import.meta.env.DEV) {
  ALLOWED_ORIGINS.push('http://localhost:5173', 'http://localhost:3000');
}

const CONVEX_ID_RE = /^[a-zA-Z0-9_-]+$/;

/**
 * Build a safe post-payment redirect URL.
 * Validates the origin against the allowlist and sanitises the dynamic
 * path segment (`recipeId`) so an attacker can't inject an arbitrary
 * redirect destination via the URL.
 */
export function buildPaymentReturnUrl(recipeId: string): string {
  if (!CONVEX_ID_RE.test(recipeId)) {
    throw new Error('Invalid recipe ID format');
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  if (!ALLOWED_ORIGINS.includes(origin)) {
    throw new Error(`Origin "${origin}" is not in the allowed redirect list`);
  }

  return `${origin}/recipe/${encodeURIComponent(recipeId)}/cook?payment=success`;
}

/**
 * Validate that a fully-formed URL points to an allowed origin.
 * Useful as a general-purpose guard for any redirect URL the client builds.
 */
export function isAllowedRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_ORIGINS.includes(parsed.origin);
  } catch {
    return false;
  }
}
