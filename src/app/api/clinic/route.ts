import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { getClinicOverview } from "@/lib/db";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  return NextResponse.json(getClinicOverview());
}
