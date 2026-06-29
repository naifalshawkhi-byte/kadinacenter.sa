"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Calendar,
  Loader2,
  User,
  Phone,
  CalendarPlus,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  Check,
  FileText,
  Package,
  ExternalLink,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  UserX,
} from "lucide-react";
import { PageHeader } from "./PageHeader";
import { FollowUpDetailsModal } from "./FollowUpDetailsModal";
import { CreateAppointmentModal } from "./CreateAppointmentModal";
import { AppointmentDetailView } from "./AppointmentDetailView";
import { AppointmentPanelModal } from "./AppointmentPanelModal";
import { cn, getInitials } from "@/lib/utils";
import type { AppointmentDisplayStatus } from "@/lib/appointments";
import { usePreferences } from "@/components/providers/PreferencesProvider";
import { useDashboard } from "./DashboardProvider";
import type { TranslationKey } from "@/lib/i18n/translations";

interface AppointmentRow {
  id: string;
  clientName: string;
  phone: string;
  service: string;
  doctor: string;
  branch: string;
  date: string;
  time: string;
  dateTimeLabel: string;
  status: AppointmentDisplayStatus;
  statusLabel: string;
  note: string;
}

interface Stats {
  today: number;
  thisWeek: number;
  confirmed: number;
  pending: number;
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

const STATUS_STYLES: Record<AppointmentDisplayStatus, string> = {
  confirmed: "bg-sky-100 text-sky-700",
  pending: "bg-sky-100 text-sky-700",
  completed: "bg-violet-100 text-violet-700",
  cancelled: "bg-rose-100 text-rose-700",
  no_show: "bg-amber-100 text-amber-800",
};

const STATUS_LABEL_KEYS: Record<AppointmentDisplayStatus, TranslationKey> = {
  confirmed: "stats.scheduled",
  pending: "stats.scheduled",
  completed: "stats.completed",
  cancelled: "stats.cancelled",
  no_show: "stats.noShow",
};

function formatPhoneDisplay(phone: string): string {
  const p = phone.trim();
  if (!p || p === "—") return "—";
  if (p.startsWith("+")) return p;
  if (p.startsWith("966")) return `+${p}`;
  if (p.startsWith("0")) return `+966${p.slice(1)}`;
  return `+966${p}`;
}

export function AppointmentsView() {
  const { t, locale } = usePreferences();
  const { user } = useDashboard();
  const isLimitedStaff = user?.role === "secretary" || user?.role === "employee";
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [branches, setBranches] = useState<string[]>([]);
  const [doctors, setDoctors] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [panelId, setPanelId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [inquiryModalId, setInquiryModalId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  const bulkStatusOptions = useMemo(
    () => [
      { key: "scheduled" as const, labelKey: "appointments.markScheduled" as TranslationKey, Icon: CalendarCheck },
      { key: "completed" as const, labelKey: "appointments.markCompleted" as TranslationKey, Icon: CheckCircle2 },
      { key: "no_show" as const, labelKey: "appointments.markNoShow" as TranslationKey, Icon: UserX },
      { key: "cancelled" as const, labelKey: "appointments.markCancelled" as TranslationKey, Icon: XCircle },
    ],
    []
  );

  const statCards = useMemo(
    () => [
      { labelKey: "stats.total" as TranslationKey, valueKey: "total" as const, color: "text-slate-800", bg: "bg-white", pctKey: "totalPct" as const },
      { labelKey: "stats.scheduled" as TranslationKey, valueKey: "scheduled" as const, color: "text-sky-700", bg: "bg-sky-50", pctKey: "scheduledPct" as const },
      { labelKey: "stats.completed" as TranslationKey, valueKey: "completed" as const, color: "text-violet-700", bg: "bg-violet-50", pctKey: "completedPct" as const },
      { labelKey: "stats.cancelled" as TranslationKey, valueKey: "cancelled" as const, color: "text-rose-700", bg: "bg-rose-50", pctKey: "cancelledPct" as const },
      { labelKey: "stats.noShow" as TranslationKey, valueKey: "noShow" as const, color: "text-amber-700", bg: "bg-amber-50", pctKey: "noShowPct" as const },
    ],
    []
  );

  const fetchAppointments = useCallback(async () => {
    const res = await fetch("/api/appointments");
    if (res.ok) {
      const data = await res.json();
      setAppointments(data.appointments || []);
      setStats(data.stats || null);
      setBranches(data.filters?.branches || []);
      setDoctors(data.filters?.doctors || []);
      setServices(data.filters?.services || []);
      setSelected(new Set());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target as Node)) {
        setStatusMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      if (search) {
        const q = search.trim();
        if (
          !a.clientName.includes(q) &&
          !a.phone.includes(q) &&
          !a.service.includes(q) &&
          !a.doctor.includes(q) &&
          !formatPhoneDisplay(a.phone).includes(q)
        ) {
          return false;
        }
      }
      if (branchFilter && a.branch !== branchFilter) return false;
      if (doctorFilter && a.doctor !== doctorFilter) return false;
      if (serviceFilter && a.service !== serviceFilter) return false;
      if (statusFilter && a.status !== statusFilter) return false;
      return true;
    });
  }, [appointments, search, branchFilter, doctorFilter, serviceFilter, statusFilter]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  const pageRows = filtered.slice(start, start + perPage);
  const allPageSelected =
    pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));

  useEffect(() => {
    setPage(1);
  }, [search, branchFilter, doctorFilter, serviceFilter, statusFilter, perPage]);

  async function bulkDelete() {
    if (!selected.size) return;
    if (!confirm(`حذف ${selected.size} موعد/مواعيد؟ لا يمكن التراجع.`)) return;
    setBulkLoading(true);
    const res = await fetch("/api/appointments/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", ids: [...selected] }),
    });
    setBulkLoading(false);
    if (res.ok) await fetchAppointments();
  }

  async function bulkChangeStatus(
    statusType: (typeof bulkStatusOptions)[number]["key"]
  ) {
    if (!selected.size) return;
    setBulkLoading(true);
    setStatusMenuOpen(false);
    const res = await fetch("/api/appointments/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "status",
        statusType,
        ids: [...selected],
      }),
    });
    setBulkLoading(false);
    if (res.ok) await fetchAppointments();
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAllPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageRows.forEach((r) => next.delete(r.id));
      } else {
        pageRows.forEach((r) => next.add(r.id));
      }
      return next;
    });
  }

  async function copyPhone(phone: string) {
    const formatted = formatPhoneDisplay(phone);
    if (formatted === "—") return;
    await navigator.clipboard.writeText(formatted);
    setCopiedPhone(formatted);
    setTimeout(() => setCopiedPhone(null), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  const s = stats || {
    today: 0,
    thisWeek: 0,
    confirmed: 0,
    pending: 0,
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
    <div>
      <AppointmentPanelModal
        appointmentId={panelId}
        open={!!panelId && !detailId}
        onClose={() => setPanelId(null)}
        onUpdated={fetchAppointments}
        onViewInquiry={(id) => {
          setPanelId(null);
          setInquiryModalId(id);
        }}
        onOpenFullDetails={(id) => {
          setPanelId(null);
          setDetailId(id);
        }}
      />
      <FollowUpDetailsModal
        inquiryId={inquiryModalId}
        open={!!inquiryModalId}
        onClose={() => setInquiryModalId(null)}
        onUpdated={fetchAppointments}
      />
      <CreateAppointmentModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={fetchAppointments}
      />

      {detailId ? (
        <AppointmentDetailView
          appointmentId={detailId}
          onBack={() => {
            setDetailId(null);
            setPanelId(null);
          }}
          onUpdated={fetchAppointments}
          onViewInquiry={(id) => {
            setInquiryModalId(id);
          }}
        />
      ) : (
        <>
      <PageHeader title={t("pages.appointments.title")} description={t("pages.appointments.desc")}>
        {!isLimitedStaff && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)] shadow-sm"
          >
            <CalendarPlus className="h-4 w-4" />
            {t("appointments.create")}
          </button>
        )}
      </PageHeader>

      {isLimitedStaff && (
        <p className="mb-4 text-sm text-[var(--muted)] rounded-xl bg-[var(--background)] border border-[var(--border)] px-4 py-3">
          مواعيد الزبائن المعيّنين لك — يمكنك عرض التفاصيل الكاملة وتعديلها.
        </p>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((card) => (
          <div
            key={card.labelKey}
            className={cn("rounded-2xl border border-[var(--border)] p-4 shadow-sm", card.bg)}
          >
            <p className={cn("text-2xl font-bold", card.color)}>
              {s[card.valueKey]}
            </p>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              {card.pctKey === "totalPct" ? `${s.totalPct || 100}%` : `${s[card.pctKey]}%`}
            </p>
            <p className="text-sm font-medium text-[var(--foreground)] mt-1">{t(card.labelKey)}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
        <div className="relative min-w-[200px] flex-1">
          <Search className={cn("absolute top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]", locale === "ar" ? "right-3" : "left-3")} />
          <input
            type="search"
            placeholder={t("appointments.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 text-sm outline-none focus:border-[var(--primary)]",
              locale === "ar" ? "pr-10 pl-4" : "pl-10 pr-4"
            )}
          />
        </div>
        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm min-w-[130px]"
        >
          <option value="">{t("appointments.allBranches")}</option>
          {branches.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <select
          value={doctorFilter}
          onChange={(e) => setDoctorFilter(e.target.value)}
          className="rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm min-w-[130px]"
        >
          <option value="">{t("appointments.allDoctors")}</option>
          {doctors.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm min-w-[130px]"
        >
          <option value="">{t("appointments.allServices")}</option>
          {services.map((svc) => (
            <option key={svc} value={svc}>{svc}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm min-w-[120px]"
        >
          <option value="">{t("appointments.allStatuses")}</option>
          <option value="confirmed">{t("stats.scheduled")}</option>
          <option value="completed">{t("stats.completed")}</option>
          <option value="no_show">{t("stats.noShow")}</option>
          <option value="cancelled">{t("stats.cancelled")}</option>
        </select>
      </div>

      {selected.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-sm">
          <span className="text-sm text-[var(--muted)]">
            {selected.size} {t("appointments.selected")}
          </span>
          {!isLimitedStaff && (
            <button
              type="button"
              onClick={bulkDelete}
              disabled={bulkLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              {t("appointments.deleteSelected")}
            </button>
          )}
          <div className="relative" ref={statusMenuRef}>
            <button
              type="button"
              onClick={() => setStatusMenuOpen((v) => !v)}
              disabled={bulkLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium hover:bg-[var(--background)] disabled:opacity-60"
            >
              <RefreshCw className={cn("h-4 w-4", bulkLoading && "animate-spin")} />
              {t("appointments.changeStatus")}
              <ChevronDown className="h-4 w-4" />
            </button>
            {statusMenuOpen && (
              <div className="absolute top-full right-0 z-50 mt-1 min-w-[220px] rounded-xl border border-[var(--border)] bg-white py-1 shadow-lg">
                {bulkStatusOptions.map(({ key, labelKey, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => bulkChangeStatus(key)}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-right hover:bg-[var(--background)]"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                    {t(labelKey)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-12 text-center shadow-sm">
          <Calendar className="h-12 w-12 text-[var(--muted)] mx-auto mb-4 opacity-50" />
          <p className="text-[var(--muted)] mb-4">{t("appointments.empty")}</p>
          <Link
            href="/dashboard/inquiries"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" />
            {t("appointments.goToInquiries")}
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--background)] text-[var(--muted)]">
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={allPageSelected}
                      onChange={toggleSelectAllPage}
                      className="h-4 w-4 rounded border-gray-300 accent-[var(--primary)] cursor-pointer"
                      aria-label={t("appointments.selectAll")}
                    />
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    <span className="inline-flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {t("appointments.col.client")}
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {t("appointments.col.date")}
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {t("appointments.col.phone")}
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Package className="h-3.5 w-3.5" />
                      {t("appointments.col.service")}
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    <span className="inline-flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {t("appointments.col.doctor")}
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right font-medium">{t("appointments.col.status")}</th>
                  <th className="px-4 py-3 text-right font-medium">
                    <span className="inline-flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {t("appointments.col.notes")}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((a) => {
                  const phoneFormatted = formatPhoneDisplay(a.phone);
                  const isSelected = selected.has(a.id);
                  return (
                    <tr
                      key={a.id}
                      className={cn(
                        "border-b border-[var(--border)] transition-colors",
                        isSelected ? "bg-sky-50/80" : "hover:bg-sky-50/40"
                      )}
                    >
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(a.id)}
                          className="h-4 w-4 rounded border-gray-300 accent-[var(--primary)] cursor-pointer"
                        />
                      </td>
                      <td
                        className="px-4 py-3 cursor-pointer"
                        onClick={() => setPanelId(a.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary-light)] text-xs font-bold text-[var(--primary)]">
                            {getInitials(a.clientName)}
                          </div>
                          <span className="font-medium">{a.clientName}</span>
                          <ExternalLink className="h-3.5 w-3.5 text-[var(--muted)] opacity-60" />
                        </div>
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap cursor-pointer"
                        onClick={() => setPanelId(a.id)}
                      >
                        <span className="inline-flex items-center gap-1 text-[var(--foreground)]">
                          <Calendar className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          {a.dateTimeLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2" dir="ltr">
                          <a
                            href={`tel:${phoneFormatted.replace(/\s/g, "")}`}
                            className="text-[var(--primary)] hover:text-[var(--primary-dark)]"
                            title="اتصال"
                          >
                            <Phone className="h-4 w-4" />
                          </a>
                          <span className="text-[var(--foreground)]">{phoneFormatted}</span>
                          <button
                            type="button"
                            onClick={() => copyPhone(a.phone)}
                            className="text-[var(--muted)] hover:text-[var(--primary)]"
                            title={t("appointments.copy")}
                          >
                            {copiedPhone === phoneFormatted ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td
                        className="px-4 py-3 cursor-pointer"
                        onClick={() => setPanelId(a.id)}
                      >
                        {a.service}
                      </td>
                      <td
                        className="px-4 py-3 text-[var(--muted)] cursor-pointer"
                        onClick={() => setPanelId(a.id)}
                      >
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3.5 w-3.5 shrink-0" />
                          {a.doctor}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 cursor-pointer"
                        onClick={() => setPanelId(a.id)}
                      >
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                            STATUS_STYLES[a.status]
                          )}
                        >
                          {t(STATUS_LABEL_KEYS[a.status])}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 text-[var(--muted)] max-w-[160px] truncate cursor-pointer"
                        onClick={() => setPanelId(a.id)}
                        title={a.note}
                      >
                        {a.note || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] px-4 py-3">
            <p className="text-sm text-[var(--muted)]">
              {t("appointments.showing")} {total === 0 ? 0 : start + 1} {t("appointments.to")} {Math.min(start + perPage, total)} {t("appointments.of")} {total} {t("appointments.results")}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <span>{t("appointments.rowsPerPage")}</span>
                <select
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                  className="rounded-lg border border-[var(--border)] px-2 py-1 text-sm bg-white"
                >
                  {[10, 20, 50].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <span className="text-sm text-[var(--muted)]">
                {t("appointments.page")} {page} {t("appointments.of")} {pages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  disabled={page <= 1}
                  className="rounded-lg p-2 hover:bg-[var(--background)] disabled:opacity-40"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg p-2 hover:bg-[var(--background)] disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page >= pages}
                  className="rounded-lg p-2 hover:bg-[var(--background)] disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage(pages)}
                  disabled={page >= pages}
                  className="rounded-lg p-2 hover:bg-[var(--background)] disabled:opacity-40"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
