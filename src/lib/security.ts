const rateBuckets = new Map<string, { count: number; resetAt: number }>();

/** Simple in-memory rate limiter (per server instance). */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const entry = rateBuckets.get(key);

  if (!entry || now >= entry.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return { allowed: true };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

/** Allow only same-origin relative paths (blocks open redirects). */
export function safeRedirectPath(input: string | null | undefined): string {
  const fallback = "/dashboard";
  if (!input || typeof input !== "string") return fallback;

  const trimmed = input.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("\\") || trimmed.includes("\0")) return fallback;

  try {
    const parsed = new URL(trimmed, "http://local");
    if (parsed.origin !== "http://local") return fallback;
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return fallback;
  }
}

const MAX_LOGO_BYTES = 800 * 1024;
const ALLOWED_LOGO_MIMES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

/** Validate clinic logo: data URL only, size and MIME checks. */
export function validateLogoDataUrl(logo: string): string | null {
  const trimmed = logo.trim();
  if (!trimmed) return "";

  if (!trimmed.startsWith("data:")) {
    throw new Error("الشعار يجب أن يكون صورة مرفوعة — الروابط الخارجية غير مسموحة");
  }

  const match = trimmed.match(/^data:([^;]+);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    throw new Error("صيغة الشعار غير صالحة");
  }

  const [, mime, b64] = match;
  if (!ALLOWED_LOGO_MIMES.has(mime.toLowerCase())) {
    throw new Error("نوع الصورة غير مدعوم — استخدم PNG أو JPEG أو WebP");
  }

  const buf = Buffer.from(b64, "base64");
  if (buf.length > MAX_LOGO_BYTES) {
    throw new Error("حجم الشعار يجب أن لا يتجاوز 800 كيلوبايت");
  }

  return trimmed;
}
