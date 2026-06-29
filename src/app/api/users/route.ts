import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { createUser, getAllUsers } from "@/lib/db";
import type { UserRole } from "@/lib/db";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  return NextResponse.json({ users: getAllUsers() });
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { username, password, name, role, linkedDoctorId } = await request.json();
    if (!username || !password || !name) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "كلمة المرور 8 أحرف على الأقل" }, { status: 400 });
    }

    const userRole = (role as UserRole) || "secretary";
    if (userRole === "secretary" && !linkedDoctorId?.trim()) {
      return NextResponse.json({ error: "يجب ربط السكرتير بطبيب" }, { status: 400 });
    }

    const user = createUser({
      username: username.trim(),
      password,
      name: name.trim(),
      role: userRole,
      linkedDoctorId: linkedDoctorId?.trim(),
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "حدث خطأ";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
