"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDashboard } from "./DashboardProvider";
import { Loader2 } from "lucide-react";

const STAFF_ALLOWED_EXACT = ["/dashboard"];
const STAFF_ALLOWED_PREFIX = ["/dashboard/inquiries", "/dashboard/appointments"];

function isAllowedPath(pathname: string) {
  if (STAFF_ALLOWED_EXACT.includes(pathname)) return true;
  return STAFF_ALLOWED_PREFIX.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function SecretaryRouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useDashboard();
  const pathname = usePathname();
  const router = useRouter();

  const limited = user?.role === "secretary" || user?.role === "employee";
  const allowed = !limited || isAllowedPath(pathname);

  useEffect(() => {
    if (!loading && limited && !isAllowedPath(pathname)) {
      router.replace("/dashboard");
    }
  }, [loading, limited, pathname, router]);

  if (loading || (limited && !allowed)) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return <>{children}</>;
}
