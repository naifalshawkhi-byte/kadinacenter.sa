import { NextResponse } from "next/server";
import { COOKIE_NAME, getSessionCookieOptions } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", { ...getSessionCookieOptions(0), maxAge: 0 });
  return res;
}
