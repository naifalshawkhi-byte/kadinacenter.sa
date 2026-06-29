import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { deleteCustomerSource, updateCustomerSource } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  try {
    const body = await request.json();
    const source = updateCustomerSource(id, body);
    if (!source) {
      return NextResponse.json({ error: "غير موجود أو مصدر نظام" }, { status: 404 });
    }
    return NextResponse.json({ source });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  if (!deleteCustomerSource(id)) {
    return NextResponse.json({ error: "غير موجود أو مصدر نظام" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
