import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { getClinicSettings, updateClinicSettings } from "@/lib/db";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  return NextResponse.json({ settings: getClinicSettings() });
}

export async function PATCH(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const settings = updateClinicSettings(body);
    return NextResponse.json({ settings });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "حدث خطأ";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
