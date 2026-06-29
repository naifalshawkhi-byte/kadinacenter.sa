export const CAMPAIGN_PLATFORMS = ["instagram", "tiktok", "snapchat"] as const;
export type CampaignPlatform = (typeof CAMPAIGN_PLATFORMS)[number];

export const CAMPAIGN_PLATFORM_LABELS: Record<CampaignPlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  snapchat: "Snapchat",
};

export type CampaignStatus = "active" | "disabled";

export interface DbCampaign {
  id: string;
  doctorId: string;
  platform: CampaignPlatform;
  campaignName: string;
  campaignCode: string;
  status: CampaignStatus;
  createdAt: string;
}

export interface CampaignVisit {
  id: string;
  campaignId: string;
  doctorId: string;
  platform: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface CampaignStats {
  totalVisits: number;
  totalLeads: number;
  totalBookings: number;
  conversionRate: number;
}

export interface CampaignStatsFilters {
  doctorId?: string;
  platform?: string;
  campaignId?: string;
  dateFrom?: string;
  dateTo?: string;
}

/** Data persisted in localStorage when a visitor opens /c/:campaignId */
export interface StoredCampaign {
  campaignId: string;
  doctorId: string;
  doctorName?: string;
  platform: string;
  campaignName: string;
}

export function slugifyCampaignCode(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0600-\u06FF-]/g, "")
    .slice(0, 40);
}
