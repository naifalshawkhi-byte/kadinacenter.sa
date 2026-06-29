import { NextResponse } from "next/server";
import { getBranchNames, getClinicSettings, getServiceNames } from "@/lib/db";

/** Public endpoint for the booking page — no auth required */
export async function GET() {
  const settings = getClinicSettings();
  const branches = getBranchNames();
  const logo = settings.logo?.trim() ? "/api/clinic/logo" : "";
  return NextResponse.json({
    name: settings.name,
    tagline: settings.tagline,
    logo,
    description: settings.description,
    branches,
    services: getServiceNames(),
    branchCount: branches.length,
  });
}
