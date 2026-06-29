import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { createService, getAllServices } from "@/lib/db";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  return NextResponse.json({ services: getAllServices() });
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "اسم الخدمة مطلوب" }, { status: 400 });
    }
    const service = createService({
      name: body.name.trim(),
      description: body.description?.trim() || "",
      duration: Number(body.duration) || 30,
      price: Number(body.price) || 0,
      branch: body.branch?.trim() || "",
      status: body.status === "inactive" ? "inactive" : "active",
    });
    return NextResponse.json({ service }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
