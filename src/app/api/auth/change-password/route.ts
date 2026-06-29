import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { changeUserPassword } from "@/lib/db";

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }
    changeUserPassword(session!.id, currentPassword, newPassword);
    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "حدث خطأ";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
