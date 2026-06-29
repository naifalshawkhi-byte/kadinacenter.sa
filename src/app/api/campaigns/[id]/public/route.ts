import { NextResponse } from "next/server";
import { getAllDoctors, getCampaignById } from "@/lib/db";

/** Public read-only campaign info for /book?cid= — does NOT record visits */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const campaign = getCampaignById(id);

  if (!campaign || campaign.status !== "active") {
    return NextResponse.json({ error: "الحملة غير موجودة" }, { status: 404 });
  }

  const doctor = getAllDoctors().find((d) => d.id === campaign.doctorId);

  return NextResponse.json({
    campaignId: campaign.id,
    doctorId: campaign.doctorId,
    doctorName: doctor?.name || "",
    platform: campaign.platform,
    campaignName: campaign.campaignName,
  });
}
