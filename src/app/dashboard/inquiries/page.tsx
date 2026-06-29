"use client";

import { useState } from "react";
import { TranslatedPageHeader } from "@/components/dashboard/TranslatedPageHeader";
import { StatCards, type StatusFilter } from "@/components/dashboard/StatCards";
import { InquiriesTable } from "@/components/dashboard/InquiriesTable";
import { AdTrackingLinks } from "@/components/dashboard/AdTrackingLinks";
import { useDashboard } from "@/components/dashboard/DashboardProvider";

export default function InquiriesPage() {
  const { user } = useDashboard();
  const isLimitedStaff = user?.role === "secretary" || user?.role === "employee";
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(null);

  return (
    <div>
      <TranslatedPageHeader
        titleKey="pages.inquiries.title"
        descriptionKey="pages.inquiries.desc"
      />
      {isLimitedStaff && (
        <p className="mb-4 text-sm text-[var(--muted)] rounded-xl bg-[var(--background)] border border-[var(--border)] px-4 py-3">
          الزبائن المعيّنون لك فقط — يمكنك عرض بياناتهم الكاملة وتحديث المتابعة.
        </p>
      )}
      <StatCards activeFilter={statusFilter} onFilterChange={setStatusFilter} />
      {statusFilter && statusFilter !== "total" && (
        <p className="mt-3 text-sm text-[var(--muted)]">
          عرض:{" "}
          <span className="font-medium text-[var(--foreground)]">
            {statusFilter === "new"
              ? "جديد"
              : statusFilter === "followup"
                ? "متابعة"
                : statusFilter === "booked"
                  ? "محجوز"
                  : statusFilter === "attended"
                    ? "حضر"
                    : "فشل"}
          </span>
          {" · "}
          <button
            type="button"
            onClick={() => setStatusFilter(null)}
            className="text-[var(--primary)] hover:underline"
          >
            إظهار الكل
          </button>
        </p>
      )}
      <div className="mt-6">
        {!isLimitedStaff && <AdTrackingLinks />}
        <InquiriesTable statusFilter={statusFilter} />
      </div>
    </div>
  );
}
