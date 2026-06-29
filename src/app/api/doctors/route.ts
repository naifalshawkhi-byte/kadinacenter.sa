import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { createDoctor, getAllDoctors, updateDoctor } from "@/lib/db";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  return NextResponse.json({ doctors: getAllDoctors() });
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    if (!body.name?.trim() || !body.specialty?.trim()) {
      return NextResponse.json({ error: "الاسم والتخصص مطلوبان" }, { status: 400 });
    }

    const doctor = createDoctor({
      name: body.name,
      specialty: body.specialty,
      branch: body.branch || "",
      workingHours: body.workingHours || "",
      phone: body.phone,
      email: body.email,
      status: body.status,
    });

    return NextResponse.json({ doctor }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
