import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { getCampaignStats } from "@/lib/db";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const stats = getCampaignStats({
    doctorId: searchParams.get("doctorId") || undefined,
    platform: searchParams.get("platform") || undefined,
    campaignId: searchParams.get("campaignId") || undefined,
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
  });

  return NextResponse.json({ stats });
}
