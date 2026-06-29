"use client";

import { useEffect, useState } from "react";
import type { InquiryStatus } from "@/lib/types";
import { usePreferences } from "@/components/providers/PreferencesProvider";
import type { TranslationKey } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

export type StatusFilter = InquiryStatus | "total" | null;

const statKeys: {
  key: StatusFilter;
  labelKey: TranslationKey;
  bg: string;
  text: string;
  activeRing: string;
}[] = [
  {
    key: "total",
    labelKey: "stats.total",
    bg: "bg-white",
    text: "text-[var(--foreground)]",
    activeRing: "ring-2 ring-[var(--primary)] ring-offset-2",
  },
  {
    key: "new",
    labelKey: "stats.new",
    bg: "bg-sky-50",
    text: "text-sky-700",
    activeRing: "ring-2 ring-sky-500 ring-offset-2",
  },
  {
    key: "followup",
    labelKey: "stats.followup",
    bg: "bg-amber-50",
    text: "text-amber-700",
    activeRing: "ring-2 ring-amber-500 ring-offset-2",
  },
  {
    key: "booked",
    labelKey: "stats.booked",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    activeRing: "ring-2 ring-emerald-500 ring-offset-2",
  },
  {
    key: "attended",
    labelKey: "stats.attended",
    bg: "bg-blue-50",
    text: "text-blue-700",
    activeRing: "ring-2 ring-blue-500 ring-offset-2",
  },
  {
    key: "failed",
    labelKey: "stats.failed",
    bg: "bg-red-50",
    text: "text-red-700",
    activeRing: "ring-2 ring-red-500 ring-offset-2",
  },
];

interface Props {
  activeFilter?: StatusFilter;
  onFilterChange?: (filter: StatusFilter) => void;
}

export function StatCards({ activeFilter = null, onFilterChange }: Props) {
  const { t } = usePreferences();
  const [counts, setCounts] = useState<Record<string, number>>({ total: 0 });

  useEffect(() => {
    fetch("/api/inquiries")
      .then((r) => r.json())
      .then((data) => {
        if (!data.inquiries) return;
        const c: Record<string, number> = { total: data.inquiries.length };
        for (const i of data.inquiries) {
          c[i.status] = (c[i.status] || 0) + 1;
        }
        setCounts(c);
      });
  }, []);

  const total = counts.total || 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {statKeys.map(({ key, labelKey, bg, text, activeRing }) => {
        const count = key === "total" ? total : counts[key as string] || 0;
        const pct = total ? Math.round((count / total) * 100) : 0;
        const isActive = onFilterChange && activeFilter === key;
        const className = cn(
          "rounded-2xl border border-[var(--border)] p-4 shadow-sm text-right transition-all",
          bg,
          onFilterChange && "hover:shadow-md cursor-pointer",
          isActive && activeRing
        );
        const inner = (
          <>
            <p className={`text-2xl font-bold ${text}`}>{count}</p>
            <p className={`text-xs ${text} opacity-80`}>{pct}%</p>
            <p className="mt-1 text-sm font-medium text-[var(--muted)]">{t(labelKey)}</p>
          </>
        );
        return onFilterChange ? (
          <button
            key={key}
            type="button"
            onClick={() => onFilterChange(isActive ? null : key)}
            className={className}
          >
            {inner}
          </button>
        ) : (
          <div key={key} className={className}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
