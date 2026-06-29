/**
 * Canonical public URL for the app (campaign links, redirects, metadata).
 * Set NEXT_PUBLIC_APP_URL in production — e.g. https://book.yourclinic.com
 */
export function getAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;

  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[site-url] NEXT_PUBLIC_APP_URL is not set — campaign and tracking links may be incorrect."
    );
  }

  return "http://localhost:3000";
}

/** Resolve base URL from request headers, falling back to configured app URL. */
export function getRequestBaseUrl(request: Request): string {
  const origin = request.headers.get("origin");
  if (origin) return origin.replace(/\/$/, "");

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const url = new URL(referer);
      return url.origin;
    } catch {
      /* ignore */
    }
  }

  return getAppUrl();
}

export function appPath(path: string): string {
  const base = getAppUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
