"use client";

import { Globe, Sun } from "lucide-react";
import { usePreferences } from "@/components/providers/PreferencesProvider";
import { cn } from "@/lib/utils";

export function ThemeLocaleControls({ className }: { className?: string }) {
  const { locale, theme, toggleLocale, toggleTheme, t } = usePreferences();

  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      <button
        type="button"
        onClick={toggleLocale}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-[var(--muted)] hover:bg-[var(--primary-light)] transition-colors"
        title={locale === "ar" ? t("lang.switchToEn") : t("lang.switchToAr")}
      >
        <Globe className="h-4 w-4 shrink-0" />
        <span>{locale === "ar" ? t("lang.switchToEn") : t("lang.switchToAr")}</span>
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--primary-light)] transition-colors"
        title={theme === "dark" ? t("theme.light") : t("theme.dark")}
        aria-label={theme === "dark" ? t("theme.light") : t("theme.dark")}
      >
        <Sun className="h-4 w-4" />
      </button>
    </div>
  );
}
