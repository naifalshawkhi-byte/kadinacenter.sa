"use client";

import { Sidebar } from "./Sidebar";
import { SecretaryRouteGuard } from "./SecretaryRouteGuard";
import { usePreferences } from "@/components/providers/PreferencesProvider";
import { cn } from "@/lib/utils";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { locale } = usePreferences();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main
        className={cn(
          "min-h-screen p-6 lg:p-8",
          locale === "ar"
            ? "mr-[var(--sidebar-width)]"
            : "ml-[var(--sidebar-width)]"
        )}
      >
        <SecretaryRouteGuard>{children}</SecretaryRouteGuard>
      </main>
    </div>
  );
}
