import { NextResponse } from "next/server";
import { getCampaignById, getAllDoctors, recordCampaignVisit } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/security";

/** Public endpoint — records a visit and returns campaign data for localStorage */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`campaign-visit:${ip}`, 60, 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "طلبات كثيرة" }, { status: 429 });
  }

  const { id } = await params;
  const campaign = getCampaignById(id);

  if (!campaign) {
    return NextResponse.json({ error: "الحملة غير موجودة" }, { status: 404 });
  }

  if (campaign.status !== "active") {
    return NextResponse.json({ error: "الحملة غير نشطة" }, { status: 410 });
  }

  recordCampaignVisit(id, { ipAddress: ip, userAgent: request.headers.get("user-agent") || "" });

  const doctor = getAllDoctors().find((d) => d.id === campaign.doctorId);

  return NextResponse.json({
    campaign: {
      campaignId: campaign.id,
      doctorId: campaign.doctorId,
      doctorName: doctor?.name || "",
      platform: campaign.platform,
      campaignName: campaign.campaignName,
    },
  });
}
