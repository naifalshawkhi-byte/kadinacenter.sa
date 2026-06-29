import { NextResponse } from "next/server";
import { getCampaignById, recordCampaignVisit } from "@/lib/db";

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

/**
 * Campaign link handler — records visit once, then redirects to /book?cid=ID.
 * No cookies (avoids reload side-effects); BookForm reads cid from URL once.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const { campaignId } = await params;
  const bookUrl = new URL("/book", request.url);
  const campaign = getCampaignById(campaignId);

  if (!campaign || campaign.status !== "active") {
    return NextResponse.redirect(bookUrl);
  }

  recordCampaignVisit(campaignId, {
    ipAddress: clientIp(request),
    userAgent: request.headers.get("user-agent") || "",
  });

  bookUrl.searchParams.set("cid", campaignId);
  return NextResponse.redirect(bookUrl);
}
