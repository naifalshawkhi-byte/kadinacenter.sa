import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { createBranch, getAllBranches } from "@/lib/db";
import { DEFAULT_WORKING_HOURS } from "@/lib/clinic-types";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  return NextResponse.json({ branches: getAllBranches() });
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "اسم الفرع مطلوب" }, { status: 400 });
    }
    const branch = createBranch({
      name: body.name.trim(),
      address: body.address?.trim() || "",
      phone: body.phone?.trim() || "",
      email: body.email?.trim() || "",
      workingHours: body.workingHours || { ...DEFAULT_WORKING_HOURS },
      status: body.status === "inactive" ? "inactive" : "active",
    });
    return NextResponse.json({ branch }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
