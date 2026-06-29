import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { deleteCampaign, getCampaignById, getCampaignStats, updateCampaign } from "@/lib/db";
import { CAMPAIGN_PLATFORMS } from "@/lib/campaign-types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const campaign = getCampaignById(id);
  if (!campaign) {
    return NextResponse.json({ error: "الحملة غير موجودة" }, { status: 404 });
  }

  const stats = getCampaignStats({ campaignId: id });
  return NextResponse.json({ campaign, stats });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const existing = getCampaignById(id);
  if (!existing) {
    return NextResponse.json({ error: "الحملة غير موجودة" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const updates: Parameters<typeof updateCampaign>[1] = {};

    if (body.doctorId !== undefined) updates.doctorId = body.doctorId.trim();
    if (body.campaignName !== undefined) updates.campaignName = body.campaignName.trim();
    if (body.campaignCode !== undefined) updates.campaignCode = body.campaignCode.trim();
    if (body.status === "active" || body.status === "disabled") {
      updates.status = body.status;
    }
    if (body.platform !== undefined) {
      if (!CAMPAIGN_PLATFORMS.includes(body.platform)) {
        return NextResponse.json({ error: "المنصة غير صالحة" }, { status: 400 });
      }
      updates.platform = body.platform;
    }

    const campaign = updateCampaign(id, updates);
    return NextResponse.json({ campaign });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const ok = deleteCampaign(id);
  if (!ok) {
    return NextResponse.json({ error: "الحملة غير موجودة" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
