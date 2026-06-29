"use client";

import { X, ChevronLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatusBadge({ active = true }: { active?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        active
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "bg-slate-100 text-slate-600"
      )}
    >
      <CheckCircle2 className="h-3 w-3" />
      {active ? "نشط" : "غير نشط"}
    </span>
  );
}

export function ReadyBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
      <CheckCircle2 className="h-3.5 w-3.5" />
      جاهز
    </span>
  );
}

export function TypeBadge({ type }: { type: "system" | "custom" }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-medium",
        type === "system"
          ? "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
          : "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
      )}
    >
      {type === "system" ? "نظام" : "مخصص"}
    </span>
  );
}

export function YellowButton({
  children,
  onClick,
  type = "button",
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)] disabled:opacity-60 transition-colors",
        className
      )}
    >
      {children}
    </button>
  );
}

export function OutlineIconButton({
  onClick,
  children,
  title,
  danger,
}: {
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--background)] transition-colors",
        danger && "hover:border-red-200 hover:text-red-600"
      )}
    >
      {children}
    </button>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-[var(--muted)] mb-1.5">{children}</label>;
}

export function TextInput({
  value,
  onChange,
  placeholder,
  dir,
  type = "text",
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  dir?: "ltr" | "rtl";
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      dir={dir}
      required={required}
      className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
    />
  );
}

export function TextArea({
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)] resize-y"
    />
  );
}

export function SectionShell({
  title,
  icon: Icon,
  onClose,
  onBack,
  children,
  action,
}: {
  title: string;
  icon: LucideIcon;
  onClose: () => void;
  onBack: () => void;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--background)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--background)]"
        >
          <X className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)] hover:text-[var(--primary)]"
        >
          <Icon className="h-4 w-4" />
          <span>العودة للمركز</span>
          <span className="text-[var(--muted)]">/</span>
          <span>{title}</span>
          <ChevronLeft className="h-4 w-4 text-[var(--muted)]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-6">
          {action && <div className="mb-6 flex justify-end">{action}</div>}
          {children}
        </div>
      </div>
    </div>
  );
}

export function DataTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function formatWorkingHoursPreview(hours: Record<string, string>, max = 2): string {
  const entries = Object.entries(hours).filter(([, v]) => v?.trim());
  if (!entries.length) return "—";
  const dayLabels: Record<string, string> = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };
  const shown = entries.slice(0, max).map(([k, v]) => `${dayLabels[k] || k}: ${v}`);
  const rest = entries.length - max;
  return rest > 0 ? `${shown.join(" · ")} · + ${rest} more days` : shown.join(" · ");
}

export function ModalForm({
  title,
  onClose,
  onSubmit,
  submitting,
  children,
}: {
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-[var(--card)] shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--background)]">
            <X className="h-5 w-5" />
          </button>
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
          <YellowButton type="submit" disabled={submitting} className="w-full">
            {submitting ? "جاري الحفظ..." : "حفظ"}
          </YellowButton>
        </form>
      </div>
    </div>
  );
}
