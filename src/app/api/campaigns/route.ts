import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import {
  createCampaign,
  getAllCampaigns,
  getAllDoctors,
  getCampaignStatsByCampaign,
} from "@/lib/db";
import { CAMPAIGN_PLATFORMS } from "@/lib/campaign-types";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get("doctorId") || undefined;
  const platform = searchParams.get("platform") || undefined;
  const campaignId = searchParams.get("campaignId") || undefined;
  const dateFrom = searchParams.get("dateFrom") || undefined;
  const dateTo = searchParams.get("dateTo") || undefined;
  const includeDisabled = searchParams.get("includeDisabled") === "1";

  const filters = { doctorId, platform, campaignId, dateFrom, dateTo };
  let campaigns = getCampaignStatsByCampaign(filters);
  if (doctorId) campaigns = campaigns.filter((c) => c.doctorId === doctorId);
  if (platform) campaigns = campaigns.filter((c) => c.platform === platform);
  if (campaignId) campaigns = campaigns.filter((c) => c.id === campaignId);
  if (!includeDisabled) {
    campaigns = campaigns.filter((c) => c.status === "active");
  }
  const doctors = getAllDoctors().filter((d) => d.status === "active");
  const allCampaigns = getCampaignStatsByCampaign({ dateFrom, dateTo }).filter(
    (c) => c.status === "active"
  );

  return NextResponse.json({ campaigns, allCampaigns, doctors, platforms: CAMPAIGN_PLATFORMS });
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    if (!body.doctorId?.trim()) {
      return NextResponse.json({ error: "الطبيب مطلوب" }, { status: 400 });
    }
    if (!body.campaignName?.trim()) {
      return NextResponse.json({ error: "اسم الحملة مطلوب" }, { status: 400 });
    }
    if (!CAMPAIGN_PLATFORMS.includes(body.platform)) {
      return NextResponse.json({ error: "المنصة غير صالحة" }, { status: 400 });
    }

    const campaign = createCampaign({
      doctorId: body.doctorId.trim(),
      platform: body.platform,
      campaignName: body.campaignName.trim(),
      campaignCode: body.campaignCode?.trim(),
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
