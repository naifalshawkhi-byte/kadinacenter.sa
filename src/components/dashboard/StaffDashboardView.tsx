"use client";

import { StatCards } from "@/components/dashboard/StatCards";
import { AppointmentStatCards } from "@/components/dashboard/AppointmentStatCards";
import { TranslatedPageHeader } from "@/components/dashboard/TranslatedPageHeader";

export function StaffDashboardView() {
  return (
    <div>
      <TranslatedPageHeader
        titleKey="nav.dashboard"
        descriptionKey="pages.staffDashboard.desc"
      />
      <p className="mb-4 text-sm text-[var(--muted)] rounded-xl bg-[var(--background)] border border-[var(--border)] px-4 py-3">
        ملخص الزبائن والمواعيد المعيّنة لك فقط.
      </p>

      <h2 className="text-sm font-semibold text-[var(--muted)] mb-3">الاستفسارات</h2>
      <StatCards />

      <h2 className="text-sm font-semibold text-[var(--muted)] mb-3 mt-6">المواعيد</h2>
      <AppointmentStatCards />
    </div>
  );
}
