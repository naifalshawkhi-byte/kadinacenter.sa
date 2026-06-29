import { Megaphone } from "lucide-react";
import {
  CAMPAIGN_PLATFORM_LABELS,
  type CampaignPlatform,
  type StoredCampaign,
} from "@/lib/campaign-types";

function platformLabel(platform: string) {
  return CAMPAIGN_PLATFORM_LABELS[platform as CampaignPlatform] || platform;
}

export function CampaignInfoCard({ data }: { data: StoredCampaign }) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-right text-sm">
      <p className="font-semibold text-emerald-800 mb-2 flex items-center justify-end gap-1.5">
        <Megaphone className="h-4 w-4" />
        بيانات الحملة
      </p>
      <div className="space-y-1 text-emerald-900">
        <p>
          <span className="text-emerald-700">الحملة:</span> {data.campaignName}
        </p>
        <p>
          <span className="text-emerald-700">المنصة:</span> {platformLabel(data.platform)}
        </p>
        {data.doctorName && (
          <p>
            <span className="text-emerald-700">الطبيب:</span> {data.doctorName}
          </p>
        )}
      </div>
    </div>
  );
}
