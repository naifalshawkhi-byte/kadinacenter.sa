import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { STAFF_LOGIN_PATH } from "@/lib/site-config";

const COOKIE_NAME = "raacare_session";

function getMiddlewareSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET is required in production");
    }
    return new TextEncoder().encode("raacare-dev-secret-local-only");
  }
  return new TextEncoder().encode(secret);
}

const SECRET = getMiddlewareSecret();

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const login = new URL(STAFF_LOGIN_PATH, request.url);
    login.searchParams.set("redirect", pathname);
    return NextResponse.redirect(login);
  }

  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    const login = new URL(STAFF_LOGIN_PATH, request.url);
    return NextResponse.redirect(login);
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
