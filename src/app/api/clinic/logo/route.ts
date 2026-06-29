import { NextResponse } from "next/server";
import { getClinicSettings } from "@/lib/db";

/** Serve uploaded clinic logo without embedding huge base64 in HTML */
export async function GET() {
  const logo = getClinicSettings().logo?.trim();
  if (!logo) {
    return new NextResponse(null, { status: 404 });
  }

  if (!logo.startsWith("data:")) {
    return new NextResponse(null, { status: 404 });
  }

  const match = logo.match(/^data:([^;]+);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    return new NextResponse(null, { status: 404 });
  }

  const [, mime, b64] = match;
  const buf = Buffer.from(b64, "base64");
  return new NextResponse(buf, {
    headers: {
      "Content-Type": mime,
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
