"use client";

import { StatCards } from "@/components/dashboard/StatCards";
import { InquiriesTable } from "@/components/dashboard/InquiriesTable";
import { StaffDashboardView } from "@/components/dashboard/StaffDashboardView";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, loading } = useDashboard();
  const isLimitedStaff = user?.role === "secretary" || user?.role === "employee";

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (isLimitedStaff) {
    return <StaffDashboardView />;
  }

  return (
    <div>
      <StatCards />
      <div className="mt-6">
        <InquiriesTable />
      </div>
    </div>
  );
}
