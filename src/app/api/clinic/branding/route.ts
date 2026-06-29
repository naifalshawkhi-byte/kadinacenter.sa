import { NextResponse } from "next/server";
import { getClinicSettings } from "@/lib/db";
import { CLINIC_PHONE } from "@/lib/site-config";

/** Public clinic name/tagline/logo URL — no auth required */
export async function GET() {
  const settings = getClinicSettings();
  return NextResponse.json({
    name: settings.name,
    tagline: settings.tagline,
    description: settings.description,
    phone: settings.phone?.trim() || CLINIC_PHONE,
    address: settings.address,
    logo: settings.logo?.trim() ? "/api/clinic/logo" : "",
  });
}
