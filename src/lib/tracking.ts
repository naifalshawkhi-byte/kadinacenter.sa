export interface TrackingData {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  landingPath?: string;
  referrer?: string;
  /** Campaign tracking — set via /c/:campaignId flow */
  campaignId?: string;
  doctorId?: string;
  doctorName?: string;
  platform?: string;
  campaignName?: string;
}

/** قوالب روابط الإعلانات — حدّث الروابط عندما ترسلها */
export const AD_CAMPAIGNS = [
  {
    id: "snapchat",
    label: "سناب شات",
    platform: "Snapchat Ads",
    path: "/book",
    params: {
      utm_source: "snapchat",
      utm_medium: "paid_social",
      utm_campaign: "snap_campaign",
    },
  },
  {
    id: "instagram",
    label: "إنستغرام",
    platform: "Instagram Ads",
    path: "/book",
    params: {
      utm_source: "instagram",
      utm_medium: "paid_social",
      utm_campaign: "instagram_campaign",
    },
  },
  {
    id: "tiktok",
    label: "تيك توك",
    platform: "TikTok Ads",
    path: "/book",
    params: {
      utm_source: "tiktok",
      utm_medium: "paid_social",
      utm_campaign: "tiktok_campaign",
    },
  },
  {
    id: "google",
    label: "جوجل",
    platform: "Google Ads",
    path: "/book",
    params: {
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "google_campaign",
    },
  },
  {
    id: "whatsapp",
    label: "واتساب",
    platform: "whatsapp",
    path: "/book",
    params: {
      utm_source: "whatsapp",
      utm_medium: "message",
      utm_campaign: "broadcast",
    },
  },
] as const;

const SOURCE_LABELS: Record<string, string> = {
  snapchat: "snapchat",
  tiktok: "tiktok",
  instagram: "instagram",
  google: "google",
  whatsapp: "whatsapp",
  direct: "direct",
  facebook: "facebook",
};

export function parseTrackingFromQuery(search: string): TrackingData {
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  return {
    source: params.get("utm_source") || params.get("source") || undefined,
    medium: params.get("utm_medium") || params.get("medium") || undefined,
    campaign: params.get("utm_campaign") || params.get("campaign") || undefined,
    content: params.get("utm_content") || params.get("content") || undefined,
    term: params.get("utm_term") || params.get("term") || undefined,
    landingPath: params.get("path") || undefined,
    referrer: params.get("ref") || undefined,
  };
}

export function resolveAdPlatform(source?: string, medium?: string): string | undefined {
  if (!source) return undefined;
  const s = source.toLowerCase();
  if (s === "tiktok") return "TikTok Ads";
  if (s === "instagram") return "Instagram Ads";
  if (s === "snapchat") return "Snapchat Ads";
  if (s === "google") return "Google Ads";
  if (s === "whatsapp") return "whatsapp";
  if (medium?.toLowerCase() === "cpc") return "Google Ads";
  return undefined;
}

/** تحويل بيانات التتبع إلى شارات للعرض في الجدول */
export function buildTrackingTags(tracking?: TrackingData): string[] {
  if (!tracking) return [];
  const tags: string[] = [];
  const add = (v?: string) => {
    const t = v?.trim();
    if (t && !tags.includes(t)) tags.push(t);
  };

  if (tracking.source) {
    add(SOURCE_LABELS[tracking.source.toLowerCase()] || tracking.source);
  }
  const platform = resolveAdPlatform(tracking.source, tracking.medium);
  add(platform);
  add(tracking.medium);
  add(tracking.campaign);
  add(tracking.content);
  add(tracking.term);
  add(tracking.landingPath);
  if (tracking.referrer) add(tracking.referrer);
  if (tracking.campaignId) add(`campaign:${tracking.campaignId}`);
  if (tracking.campaignName) add(tracking.campaignName);
  if (tracking.platform) add(tracking.platform);
  if (tracking.doctorId) add(`doctor:${tracking.doctorId}`);
  if (tracking.doctorName) add(tracking.doctorName);

  return tags.slice(0, 12);
}

export function buildAdLink(baseUrl: string, campaignId: string): string | null {
  const camp = AD_CAMPAIGNS.find((c) => c.id === campaignId);
  if (!camp) return null;
  const url = new URL(camp.path, baseUrl.replace(/\/$/, "") + "/");
  Object.entries(camp.params).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.toString();
}

export function buildAllAdLinks(baseUrl: string) {
  return AD_CAMPAIGNS.map((c) => ({
    ...c,
    fullUrl: buildAdLink(baseUrl, c.id) || "",
  }));
}
