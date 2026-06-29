"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Pencil,
  Loader2,
  Calendar,
  Clock,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  UserX,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  ExternalLink,
  Stethoscope,
  TrendingUp,
  Globe,
  Megaphone,
  Target,
  Search,
  MousePointer,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import type { AppointmentDisplayStatus } from "@/lib/appointments";
import { EditClientModal, type ClientProfile } from "./EditClientModal";
import { AppointmentPanelModal } from "./AppointmentPanelModal";

type PanelStatus = "scheduled" | "completed" | "cancelled" | "no_show";

interface LogEntry {
  id: string;
  title: string;
  createdAtFormatted: string;
  createdByName: string;
  appointmentDate: string;
  service: string;
  doctor: string;
  attendance: string;
}

interface DetailData {
  appointment: {
    status: AppointmentDisplayStatus;
    statusLabel: string;
    dateTimeLabel: string;
  };
  inquiry: {
    id: string;
    statusLabel: string;
    service: string;
    nextFollowUpLabel: string;
    createdAtFormatted: string;
    branch: string;
  };
  doctorName: string;
  attendanceLabel: string;
  trackingFields: { key: string; label: string; value: string }[];
  logs: LogEntry[];
  client: ClientProfile;
}

const STATUS_CHIPS: {
  key: PanelStatus;
  label: string;
  Icon: typeof CalendarCheck;
  active: string;
  idle: string;
}[] = [
  {
    key: "scheduled",
    label: "مجدول",
    Icon: CalendarCheck,
    active: "bg-sky-600 text-white border-sky-600",
    idle: "bg-sky-50 text-sky-700 border border-sky-200",
  },
  {
    key: "completed",
    label: "مكتمل",
    Icon: CheckCircle2,
    active: "bg-emerald-600 text-white border-emerald-600",
    idle: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  {
    key: "cancelled",
    label: "ملغي",
    Icon: XCircle,
    active: "bg-rose-600 text-white border-rose-600",
    idle: "bg-rose-50 text-rose-700 border border-rose-200",
  },
  {
    key: "no_show",
    label: "لم يحضر",
    Icon: UserX,
    active: "bg-amber-600 text-white border-amber-600",
    idle: "bg-amber-50 text-amber-800 border border-amber-200",
  },
];

const TRACKING_ICONS: Record<string, typeof Globe> = {
  source: Globe,
  medium: Megaphone,
  campaign: Target,
  content: FileText,
  term: Search,
  landingPath: MousePointer,
  referrer: TrendingUp,
};

function displayStatusToPanel(status: AppointmentDisplayStatus): PanelStatus {
  if (status === "completed") return "completed";
  if (status === "cancelled") return "cancelled";
  if (status === "no_show") return "no_show";
  return "scheduled";
}

function formatPhoneDisplay(phone: string): string {
  const p = phone.trim();
  if (!p) return "—";
  if (p.startsWith("+")) return p;
  return `+966${p.replace(/^0/, "")}`;
}

interface Props {
  appointmentId: string;
  onBack: () => void;
  onUpdated?: () => void;
  onViewInquiry?: (id: string) => void;
}

export function AppointmentDetailView({
  appointmentId,
  onBack,
  onUpdated,
  onViewInquiry,
}: Props) {
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientEditOpen, setClientEditOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [statusPanelOpen, setStatusPanelOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<PanelStatus>("scheduled");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/appointments/${appointmentId}`);
    if (res.ok) {
      const json = await res.json();
      setData(json);
      setTargetStatus(displayStatusToPanel(json.appointment.status));
    }
    setLoading(false);
  }, [appointmentId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  const preferredPhoneKey = data.client.preferredPhone;
  const phoneLabels: Record<string, string> = {
    primary: formatPhoneDisplay(data.client.phone),
    extra1: formatPhoneDisplay(data.client.phoneExtra1),
    extra2: formatPhoneDisplay(data.client.phoneExtra2),
    extra3: formatPhoneDisplay(data.client.phoneExtra3),
  };
  const displayPhone = phoneLabels[preferredPhoneKey] || phoneLabels.primary;

  return (
    <div className="space-y-4" dir="rtl">
      <EditClientModal
        open={clientEditOpen}
        inquiryId={appointmentId}
        client={data.client}
        onClose={() => setClientEditOpen(false)}
        onSaved={() => {
          load();
          onUpdated?.();
        }}
      />

      <AppointmentPanelModal
        appointmentId={appointmentId}
        open={editOpen}
        initialSubView="edit"
        onClose={() => setEditOpen(false)}
        onUpdated={() => {
          load();
          onUpdated?.();
          setEditOpen(false);
        }}
      />

      <AppointmentPanelModal
        appointmentId={appointmentId}
        open={statusPanelOpen}
        initialSubView="status"
        initialStatus={targetStatus}
        onClose={() => setStatusPanelOpen(false)}
        onUpdated={() => {
          load();
          onUpdated?.();
          setStatusPanelOpen(false);
        }}
      />

      {/* شريط علوي */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium hover:bg-[var(--background)]"
          >
            <Pencil className="h-4 w-4" />
            تعديل الموعد
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-semibold">
            <Calendar className="h-3.5 w-3.5" />
            {data.inquiry.nextFollowUpLabel}
          </span>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            رجوع
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* شارات الحالة */}
      <div className="flex flex-wrap gap-2">
        {STATUS_CHIPS.map(({ key, label, Icon, active, idle }) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setTargetStatus(key);
              setStatusPanelOpen(true);
            }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold border transition-colors",
              targetStatus === key ? active : idle
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* المحتوى الرئيسي */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* سجل الموعد */}
        <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <h3 className="text-base font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[var(--muted)]" />
            سجل الموعد
          </h3>

          {data.logs.length === 0 ? (
            <p className="text-sm text-[var(--muted)] py-8 text-center">لا يوجد سجل بعد</p>
          ) : (
            <div className="space-y-4">
              {data.logs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl border border-sky-100 bg-sky-50/60 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-xs font-medium">
                      <User className="h-3 w-3" />
                      {log.createdByName}
                    </span>
                    <span className="text-xs text-[var(--muted)]">{log.createdAtFormatted}</span>
                    <p className="w-full text-sm font-semibold text-sky-800 text-right mt-1">
                      {log.title}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <InfoCell icon={Calendar} label="تاريخ الموعد" value={log.appointmentDate} />
                    <InfoCell icon={Stethoscope} label="الطبيب" value={log.doctor} />
                    <InfoCell icon={FileText} label="الخدمة" value={log.service} />
                    <InfoCell
                      icon={XCircle}
                      label="الحضور"
                      value={log.attendance}
                      valueClass={
                        log.attendance === "لم يحضر"
                          ? "text-rose-600"
                          : log.attendance === "حضر"
                            ? "text-emerald-600"
                            : ""
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* الشريط الجانبي */}
        <div className="space-y-4">
          {/* معلومات العميل */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setClientEditOpen(true)}
                className="p-1.5 text-[var(--muted)] hover:text-[var(--primary)] rounded-lg hover:bg-[var(--background)]"
                title="تعديل بيانات العميل"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <User className="h-4 w-4 text-[var(--muted)]" />
                معلومات العميل
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 justify-end">
                <span className="font-semibold">{data.client.name}</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                  {getInitials(data.client.name)}
                </div>
              </div>

              {(data.client.gender || data.client.age) && (
                <div className="flex flex-wrap gap-2 justify-end">
                  {data.client.gender && (
                    <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-xs font-medium">
                      {data.client.gender}
                    </span>
                  )}
                  {data.client.age && (
                    <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-xs font-medium">
                      {data.client.age} سنة
                    </span>
                  )}
                </div>
              )}

              <SidebarRow icon={Phone} label={displayPhone}>
                {preferredPhoneKey === "primary" && (
                  <span className="rounded-full bg-emerald-800 text-white text-[10px] px-2 py-0.5 mr-1">
                    المفضل
                  </span>
                )}
              </SidebarRow>

              {data.client.email && (
                <SidebarRow icon={Mail} label={data.client.email} dir="ltr" />
              )}

              {(data.client.address || data.inquiry.branch) && (
                <SidebarRow
                  icon={MapPin}
                  label={data.client.address || data.inquiry.branch}
                />
              )}
            </div>
          </div>

          {/* الاستفسار المرتبط */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
            <h3 className="text-sm font-bold flex items-center gap-2 justify-end mb-3">
              <FileText className="h-4 w-4 text-[var(--muted)]" />
              الاستفسار المرتبط
            </h3>
            <div className="flex items-start justify-between gap-2 text-sm">
              <button
                type="button"
                onClick={() => onViewInquiry?.(appointmentId)}
                className="text-sky-600 hover:underline shrink-0"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
              <div className="text-right min-w-0">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <span className="rounded-full bg-sky-100 text-sky-800 text-xs px-2 py-0.5 font-medium">
                    {data.inquiry.statusLabel}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {data.inquiry.createdAtFormatted}
                  </span>
                </div>
                <p className="text-[var(--muted)] text-xs leading-relaxed">
                  {data.inquiry.service}
                  {data.doctorName !== "غير معين" ? ` — ${data.doctorName}` : ""}
                </p>
              </div>
            </div>
          </div>

          {/* معلومة تسويقية */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
            <h3 className="text-sm font-bold flex items-center gap-2 justify-end mb-3">
              <TrendingUp className="h-4 w-4 text-[var(--muted)]" />
              معلومة تسويقية
            </h3>
            {data.trackingFields.length === 0 ? (
              <p className="text-xs text-[var(--muted)] text-center py-4">لا توجد بيانات</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {data.trackingFields.map((f) => {
                  const Icon = TRACKING_ICONS[f.key] || Globe;
                  return (
                    <div
                      key={f.key}
                      className="rounded-lg bg-[var(--background)] border border-[var(--border)] px-2 py-2 text-right"
                    >
                      <p className="flex items-center justify-end gap-1 text-[10px] text-[var(--muted)]">
                        {f.label}
                        <Icon className="h-3 w-3" />
                      </p>
                      <p className="text-xs font-medium truncate" dir="ltr">
                        {f.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCell({
  icon: Icon,
  label,
  value,
  valueClass,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-lg bg-white/80 border border-sky-100 px-3 py-2">
      <p className="flex items-center justify-end gap-1 text-[10px] text-[var(--muted)] mb-0.5">
        {label}
        <Icon className="h-3 w-3" />
      </p>
      <p className={cn("text-xs font-medium text-right", valueClass)}>{value || "—"}</p>
    </div>
  );
}

function SidebarRow({
  icon: Icon,
  label,
  children,
  dir,
}: {
  icon: typeof Phone;
  label: string;
  children?: React.ReactNode;
  dir?: string;
}) {
  return (
    <div className="flex items-center justify-end gap-2 text-sm">
      {children}
      <span dir={dir}>{label}</span>
      <Icon className="h-4 w-4 text-[var(--muted)] shrink-0" />
    </div>
  );
}
