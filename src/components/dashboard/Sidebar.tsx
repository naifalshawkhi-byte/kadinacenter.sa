"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Users,
  BarChart3,
  Building2,
  Megaphone,
  LogOut,
  UserCog,
  ClipboardList,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "./DashboardProvider";
import { getInitials } from "@/lib/utils";
import { usePreferences } from "@/components/providers/PreferencesProvider";
import { ThemeLocaleControls } from "./ThemeLocaleControls";
import { useClinicBranding, ClinicLogo } from "@/components/providers/ClinicBrandingProvider";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { STAFF_LOGIN_PATH } from "@/lib/site-config";
import type { TranslationKey } from "@/lib/i18n/translations";

const adminNav: { href: string; labelKey: TranslationKey; icon: typeof LayoutDashboard }[] = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/dashboard/inquiries", labelKey: "nav.inquiries", icon: MessageSquare },
  { href: "/dashboard/appointments", labelKey: "nav.appointments", icon: Calendar },
  { href: "/dashboard/clients", labelKey: "nav.clients", icon: Users },
  { href: "/dashboard/analytics", labelKey: "nav.analytics", icon: BarChart3 },
  { href: "/dashboard/campaign-tracking", labelKey: "nav.campaignTracking", icon: Megaphone },
  { href: "/dashboard/clinic", labelKey: "nav.clinic", icon: Building2 },
  { href: "/dashboard/assignments", labelKey: "nav.assignments", icon: ClipboardList },
];

const staffNav: { href: string; labelKey: TranslationKey; icon: typeof LayoutDashboard }[] = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/dashboard/inquiries", labelKey: "nav.inquiries", icon: MessageSquare },
  { href: "/dashboard/appointments", labelKey: "nav.appointments", icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useDashboard();
  const { locale, t } = usePreferences();
  const { settings } = useClinicBranding();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const isLimitedStaff = user?.role === "secretary" || user?.role === "employee";
  const navItems = isLimitedStaff ? staffNav : adminNav;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(STAFF_LOGIN_PATH);
    router.refresh();
  }

  const NavLink = ({
    href,
    labelKey,
    icon: Icon,
  }: {
    href: string;
    labelKey: TranslationKey;
    icon: React.ComponentType<{ className?: string }>;
  }) => {
    const active =
      pathname === href ||
      (href !== "/dashboard" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
          active
            ? "bg-[var(--primary)] text-white"
            : "text-[var(--foreground)] hover:bg-[var(--primary-light)]"
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span>{t(labelKey)}</span>
      </Link>
    );
  };

  const roleLabel =
    user?.role === "admin"
      ? t("role.admin")
      : user?.role === "secretary"
        ? t("role.secretary")
        : t("role.staff");

  return (
    <aside
      className={cn(
        "fixed inset-y-0 z-40 flex w-[var(--sidebar-width)] flex-col bg-[var(--card)]",
        locale === "ar"
          ? "right-0 border-l border-[var(--border)]"
          : "left-0 border-r border-[var(--border)]"
      )}
    >
      <div className="border-b border-[var(--border)] px-5 py-5">
        <Link href="/book" className="flex items-center gap-2">
          <ClinicLogo size="md" />
          <div>
            <p className="text-sm font-bold text-[var(--primary)]">{settings.name}</p>
            <p className="text-xs text-[var(--muted)]">{settings.tagline || settings.name}</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}

        {!isLimitedStaff && user?.role === "admin" && (
          <NavLink href="/dashboard/employees" labelKey="nav.employees" icon={UserCog} />
        )}
      </nav>

      <div className="border-t border-[var(--border)] p-4 space-y-3">
        <ThemeLocaleControls className="px-2" />

        {user && (
          <div className="flex items-center gap-3 rounded-xl bg-[var(--primary-light)] px-3 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
              {getInitials(user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-[var(--muted)]">{roleLabel}</p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowPasswordModal(true)}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
        >
          <KeyRound className="h-4 w-4" />
          تغيير كلمة المرور
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <LogOut className="h-4 w-4" />
          {t("common.logout")}
        </button>
      </div>

      <ChangePasswordModal open={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
    </aside>
  );
}
