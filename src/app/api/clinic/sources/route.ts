import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { createCustomerSource, getAllCustomerSources } from "@/lib/db";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  return NextResponse.json({ sources: getAllCustomerSources() });
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "اسم المصدر مطلوب" }, { status: 400 });
    }
    const source = createCustomerSource({
      name: body.name.trim(),
      description: body.description?.trim() || "",
      status: body.status === "inactive" ? "inactive" : "active",
    });
    return NextResponse.json({ source }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
