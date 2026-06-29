"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/components/providers/PreferencesProvider";
import type { TranslationKey } from "@/lib/i18n/translations";

interface Stats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  noShow: number;
  scheduledPct: number;
  completedPct: number;
  cancelledPct: number;
  noShowPct: number;
  totalPct: number;
}

const statCards: {
  labelKey: TranslationKey;
  valueKey: keyof Stats;
  color: string;
  bg: string;
  pctKey: keyof Stats;
}[] = [
  { labelKey: "stats.total", valueKey: "total", color: "text-slate-800", bg: "bg-white", pctKey: "totalPct" },
  { labelKey: "stats.scheduled", valueKey: "scheduled", color: "text-sky-700", bg: "bg-sky-50", pctKey: "scheduledPct" },
  { labelKey: "stats.completed", valueKey: "completed", color: "text-violet-700", bg: "bg-violet-50", pctKey: "completedPct" },
  { labelKey: "stats.cancelled", valueKey: "cancelled", color: "text-rose-700", bg: "bg-rose-50", pctKey: "cancelledPct" },
  { labelKey: "stats.noShow", valueKey: "noShow", color: "text-amber-700", bg: "bg-amber-50", pctKey: "noShowPct" },
];

export function AppointmentStatCards({ className }: { className?: string }) {
  const { t } = usePreferences();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/appointments")
      .then((r) => r.json())
      .then((data) => setStats(data.stats || null));
  }, []);

  const s = stats || {
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    noShow: 0,
    scheduledPct: 0,
    completedPct: 0,
    cancelledPct: 0,
    noShowPct: 0,
    totalPct: 100,
  };

  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5", className)}>
      {statCards.map((card) => (
        <div
          key={card.labelKey}
          className={cn("rounded-2xl border border-[var(--border)] p-4 shadow-sm", card.bg)}
        >
          <p className={cn("text-2xl font-bold", card.color)}>{s[card.valueKey]}</p>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            {card.pctKey === "totalPct" ? `${s.totalPct || 100}%` : `${s[card.pctKey]}%`}
          </p>
          <p className="text-sm font-medium text-[var(--foreground)] mt-1">{t(card.labelKey)}</p>
        </div>
      ))}
    </div>
  );
}
