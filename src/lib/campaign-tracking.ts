import type { TrackingData } from "./tracking";
import type { StoredCampaign } from "./campaign-types";

export const CAMPAIGN_STORAGE_KEY = "raacare_campaign";

/** Persist campaign attribution across page navigation until form submit */
export function saveCampaignToStorage(data: StoredCampaign): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage may be unavailable in private mode
  }
}

export function getCampaignFromStorage(): StoredCampaign | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CAMPAIGN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredCampaign;
    if (!parsed.campaignId) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Merge stored campaign data into inquiry tracking payload */
export function mergeCampaignIntoTracking(tracking: TrackingData): TrackingData {
  const stored = getCampaignFromStorage();
  if (!stored) return tracking;

  return {
    ...tracking,
    campaignId: stored.campaignId,
    doctorId: stored.doctorId,
    doctorName: stored.doctorName,
    platform: stored.platform,
    campaignName: stored.campaignName,
    source: stored.platform || tracking.source,
    campaign: stored.campaignName || tracking.campaign,
    medium: tracking.medium || "campaign_link",
  };
}
