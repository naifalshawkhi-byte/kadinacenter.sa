import { NextResponse } from "next/server";
import { getSession, isAdmin } from "./auth";
import { getUserSessionVersion, userExists } from "./db";

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    return { session: null, error: NextResponse.json({ error: "غير مصرح" }, { status: 401 }) };
  }

  if (!userExists(session.id)) {
    return {
      session: null,
      error: NextResponse.json({ error: "انتهت الجلسة" }, { status: 401 }),
    };
  }

  const currentVersion = getUserSessionVersion(session.id);
  const tokenVersion = session.sessionVersion ?? 0;
  if (tokenVersion !== currentVersion) {
    return {
      session: null,
      error: NextResponse.json({ error: "انتهت الجلسة — سجّل الدخول مجدداً" }, { status: 401 }),
    };
  }

  return { session, error: null };
}

export async function requireAdmin() {
  const result = await requireAuth();
  if (result.error) return result;
  if (!isAdmin(result.session!.role)) {
    return {
      session: null,
      error: NextResponse.json({ error: "صلاحيات غير كافية" }, { status: 403 }),
    };
  }
  return result;
}
