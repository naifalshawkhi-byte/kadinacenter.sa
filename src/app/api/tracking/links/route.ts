import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { buildAllAdLinks } from "@/lib/tracking";
import { getRequestBaseUrl } from "@/lib/site-url";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const baseUrl = getRequestBaseUrl(request);
  const links = buildAllAdLinks(baseUrl);

  return NextResponse.json({ links });
}
