"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Calendar,
  Clock,
  MessageCircle,
  LayoutGrid,
  List,
  Phone,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
  User,
  FileText,
  Box,
  ArrowUpDown,
  Link2,
  ListChecks,
} from "lucide-react";
import { statusLabels } from "@/lib/data";
import { cn, getInitials, getStatusColor } from "@/lib/utils";
import type { InquiryStatus } from "@/lib/types";
import { FollowUpDetailsModal } from "./FollowUpDetailsModal";
import { TrackingTags } from "./TrackingTags";
import { useDashboard } from "./DashboardProvider";
import type { StatusFilter } from "./StatCards";

interface InquiryRow {
  id: string;
  name: string;
  phone: string;
  message: string;
  status: InquiryStatus;
  note: string;
  service: string;
  branch: string;
  nextFollowUp: string;
  nextFollowUpLabel?: string;
  trackingTags: string[];
  assignedTo: string;
  assignedToLabel?: string;
  assignedSecretary: string;
  assignedSecretaryLabel?: string;
  followUpCount: number;
  createdAt: string;
  createdAtLabel: string;
  createdAtFormatted: string;
}

interface DoctorOption {
  id: string;
  name: string;
  specialty?: string;
}

interface SecretaryOption {
  id: string;
  name: string;
  linkedDoctorName?: string;
}

export function InquiriesTable({ statusFilter = null }: { statusFilter?: StatusFilter }) {
  const { user } = useDashboard();
  const [inquiries, setInquiries] = useState<InquiryRow[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [secretaries, setSecretaries] = useState<SecretaryOption[]>([]);
  const [canAssign, setCanAssign] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const perPage = 20;

  const fetchInquiries = useCallback(async () => {
    const res = await fetch("/api/inquiries");
    if (res.ok) {
      const data = await res.json();
      setInquiries(data.inquiries);
      if (data.doctors) setDoctors(data.doctors);
      if (data.assignees) setSecretaries(data.assignees);
      else if (data.secretaries) setSecretaries(data.secretaries);
      setCanAssign(!!data.canAssign);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  async function assignInquiry(id: string, assignedTo: string) {
    const res = await fetch(`/api/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedTo }),
    });
    if (res.ok) fetchInquiries();
  }

  async function assignSecretary(id: string, assignedSecretary: string) {
    const res = await fetch(`/api/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedSecretary }),
    });
    if (res.ok) fetchInquiries();
  }

  const isLimitedStaff = user?.role === "secretary" || user?.role === "employee";

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  const filtered = inquiries.filter((i) => {
    if (statusFilter && statusFilter !== "total" && i.status !== statusFilter) return false;
    if (!search) return true;
    return (
      (i.name ?? "").includes(search) ||
      (i.phone ?? "").includes(search) ||
      (i.service ?? "").includes(search) ||
      (i.note ?? "").includes(search) ||
      (i.branch ?? "").includes(search)
    );
  });

  const total = filtered.length;
  const pages = Math.ceil(total / perPage) || 1;
  const start = (page - 1) * perPage;
  const rows = filtered.slice(start, start + perPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <>
    <FollowUpDetailsModal
      inquiryId={detailsId}
      open={!!detailsId}
      onClose={() => setDetailsId(null)}
      onUpdated={fetchInquiries}
    />
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] p-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="search"
            placeholder="بحث الاستفسارات..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 pr-10 pl-4 text-sm outline-none focus:border-[var(--primary)]"
          />
        </div>
        <button type="button" className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)]">
          <Calendar className="h-4 w-4" />
          تم إنشاؤه في
        </button>
        <button type="button" className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)]">
          <Clock className="h-4 w-4" />
          المتابعة في
        </button>
        <button type="button" className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)]">
          <MessageCircle className="h-4 w-4" />
          المحادثات
        </button>
        <div className="mr-auto flex gap-1">
          <button type="button" className="rounded-lg p-2 text-[var(--muted)]">
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button type="button" className="rounded-lg bg-[var(--primary-light)] p-2 text-[var(--primary)]">
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1280px] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--background)] text-[var(--muted)]">
              <th className="px-4 py-3 text-right font-medium">
                <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5" />الاسم <ArrowUpDown className="h-3 w-3" /></span>
              </th>
              <th className="px-4 py-3 text-right font-medium">
                <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" />الهاتف <ArrowUpDown className="h-3 w-3" /></span>
              </th>
              <th className="px-4 py-3 text-right font-medium">الحالة</th>
              <th className="px-4 py-3 text-right font-medium">
                <span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" />ملاحظة</span>
              </th>
              <th className="px-4 py-3 text-right font-medium">
                <span className="inline-flex items-center gap-1"><Box className="h-3.5 w-3.5" />الخدمة</span>
              </th>
              {canAssign && (
                <th className="px-4 py-3 text-right font-medium">
                  <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5" />التعيين</span>
                </th>
              )}
              <th className="px-4 py-3 text-right font-medium">
                <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />المتابعة التالية</span>
              </th>
              <th className="px-4 py-3 text-right font-medium">
                <span className="inline-flex items-center gap-1"><Link2 className="h-3.5 w-3.5" />بيانات التتبع</span>
              </th>
              <th className="px-4 py-3 text-right font-medium">
                <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5" />الطبيب المخصص</span>
              </th>
              <th className="px-4 py-3 text-right font-medium">
                <span className="inline-flex items-center gap-1"><ListChecks className="h-3.5 w-3.5" />المتابعات</span>
              </th>
              <th className="px-4 py-3 text-right font-medium">
                <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />تاريخ الإنشاء</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={canAssign ? 11 : 10} className="px-4 py-12 text-center text-[var(--muted)]">
                  لا توجد استفسارات بعد. شارك رابط الحجز: /book
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <InquiryListRow
                  key={row.id}
                  inquiry={row}
                  doctors={doctors}
                  secretaries={secretaries}
                  canAssign={canAssign}
                  isLimitedStaff={isLimitedStaff}
                  onAssign={(assignedTo) => assignInquiry(row.id, assignedTo)}
                  onAssignSecretary={(sid) => assignSecretary(row.id, sid)}
                  onOpen={() => setDetailsId(row.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] px-4 py-3">
        <p className="text-sm text-[var(--muted)]">
          {total === 0 ? "0" : `${start + 1}-${Math.min(start + perPage, total)}`} من {total} جهة اتصال
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg p-2 hover:bg-[var(--background)] disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="min-w-[2rem] text-center text-sm font-medium">{page}</span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className="rounded-lg p-2 hover:bg-[var(--background)] disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

function InquiryListRow({
  inquiry,
  doctors,
  secretaries,
  canAssign,
  isLimitedStaff,
  onAssign,
  onAssignSecretary,
  onOpen,
}: {
  inquiry: InquiryRow;
  doctors: DoctorOption[];
  secretaries: SecretaryOption[];
  canAssign: boolean;
  isLimitedStaff: boolean;
  onAssign: (assignedTo: string) => void;
  onAssignSecretary: (secretaryId: string) => void;
  onOpen: () => void;
}) {
  const status = inquiry.status || "new";
  const doctorName =
    inquiry.assignedToLabel ||
    doctors.find((d) => d.id === inquiry.assignedTo)?.name ||
    "غير معين";

  return (
    <tr
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="border-b border-[var(--border)] hover:bg-sky-50/50 cursor-pointer transition-colors group"
      title="انقر لعرض تفاصيل المتابعة"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary-light)] text-xs font-bold text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
            {getInitials(inquiry.name)}
          </div>
          <span className="font-medium text-[var(--foreground)]">{inquiry.name || "—"}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-[var(--muted)]" dir="ltr">
        {inquiry.phone || "—"}
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold pointer-events-none",
            getStatusColor(status)
          )}
        >
          {statusLabels[status]}
        </span>
      </td>
      <td className="px-4 py-3 text-[var(--muted)] max-w-[140px] truncate">
        {inquiry.note || "—"}
      </td>
      <td className="px-4 py-3 text-sm max-w-[160px] truncate">
        {inquiry.service || "—"}
      </td>
      {canAssign && (
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <div className="relative inline-block min-w-[140px]">
            <select
              value={inquiry.assignedSecretary || ""}
              onChange={(e) => onAssignSecretary(e.target.value)}
              className="w-full appearance-none rounded-lg border border-[var(--border)] bg-[var(--card)] py-1.5 pr-8 pl-2 text-xs outline-none focus:border-[var(--primary)]"
            >
              <option value="">— تعيين موظف —</option>
              {secretaries.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.linkedDoctorName ? ` (${s.linkedDoctorName})` : ""}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]" />
          </div>
        </td>
      )}
      <td className="px-4 py-3 text-xs whitespace-nowrap">
        {inquiry.nextFollowUpLabel || inquiry.nextFollowUp || "—"}
      </td>
      <td className="px-4 py-3 align-top">
        <TrackingTags tags={inquiry.trackingTags || []} />
      </td>
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <div className="relative inline-block min-w-[140px]">
          <select
            value={inquiry.assignedTo || ""}
            onChange={(e) => onAssign(e.target.value)}
            disabled={isLimitedStaff}
            className="w-full appearance-none rounded-full border border-gray-200 bg-white py-1.5 pr-3 pl-8 text-xs font-medium text-gray-700 outline-none focus:border-[var(--primary)] cursor-pointer"
            title={doctorName}
          >
            <option value="">غير معين</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
                {d.specialty ? ` — ${d.specialty}` : ""}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-[var(--muted)]">
        <span className="inline-flex items-center gap-1">
          <ListChecks className="h-3.5 w-3.5 shrink-0" />
          {inquiry.followUpCount ?? 0}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-[var(--muted)] whitespace-nowrap">
        {inquiry.createdAtFormatted || inquiry.createdAtLabel}
      </td>
    </tr>
  );
}
