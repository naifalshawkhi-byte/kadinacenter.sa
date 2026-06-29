import { NextResponse } from "next/server";
import { createSession, COOKIE_NAME, getSessionCookieOptions } from "@/lib/auth";
import { getUserByUsername, getUserSessionVersion, verifyPassword } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "محاولات كثيرة — انتظر قليلاً ثم أعد المحاولة" },
        {
          status: 429,
          headers: rate.retryAfterSec
            ? { "Retry-After": String(rate.retryAfterSec) }
            : undefined,
        }
      );
    }

    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: "أدخل اسم المستخدم وكلمة المرور" }, { status: 400 });
    }

    const user = getUserByUsername(username.trim());
    if (!user || !verifyPassword(user, password)) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
    }

    const token = await createSession({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      sessionVersion: getUserSessionVersion(user.id),
    });

    const res = NextResponse.json({
      user: { id: user.id, username: user.username, name: user.name, role: user.role },
    });
    res.cookies.set(COOKIE_NAME, token, getSessionCookieOptions());
    return res;
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
