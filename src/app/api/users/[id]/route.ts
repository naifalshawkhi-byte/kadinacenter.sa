import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { deleteUser, getUserById, updateUser } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const existing = getUserById(id);
  if (!existing) {
    return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
  }
  if (existing.role === "admin") {
    return NextResponse.json({ error: "لا يمكن تعديل حساب الأدمن من هنا" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const user = updateUser(id, {
      name: body.name,
      username: body.username,
      password: body.password || undefined,
      linkedDoctorId: body.linkedDoctorId,
    });
    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "حدث خطأ";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const ok = deleteUser(id);
  if (!ok) {
    return NextResponse.json({ error: "لا يمكن الحذف" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
