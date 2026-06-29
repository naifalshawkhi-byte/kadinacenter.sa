"use client";

import { TranslatedPageHeader } from "@/components/dashboard/TranslatedPageHeader";
import { campaigns } from "@/lib/data";
import { Plus, Send } from "lucide-react";

const statusMap: Record<string, { label: string; class: string }> = {
  draft: { label: "مسودة", class: "bg-gray-100 text-gray-700" },
  scheduled: { label: "مجدولة", class: "bg-amber-100 text-amber-700" },
  sent: { label: "مُرسلة", class: "bg-emerald-100 text-emerald-700" },
};

export default function CampaignsPage() {
  return (
    <div>
      <TranslatedPageHeader titleKey="pages.campaigns.title" descriptionKey="pages.campaigns.desc">
        <button className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white">
          <Plus className="h-4 w-4" />
          حملة جديدة
        </button>
      </TranslatedPageHeader>

      <div className="space-y-4">
        {campaigns.map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                <Send className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold">{c.name}</h3>
                <p className="text-sm text-[var(--muted)]">
                  {c.recipients > 0 ? `${c.recipients} مستلم` : "لم تُحدد المستلمين بعد"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {c.openRate !== undefined && (
                <span className="text-sm">معدل الفتح: <strong>{c.openRate}%</strong></span>
              )}
              {c.sentAt && (
                <span className="text-sm text-[var(--muted)]">أُرسلت: {c.sentAt}</span>
              )}
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusMap[c.status].class}`}>
                {statusMap[c.status].label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
