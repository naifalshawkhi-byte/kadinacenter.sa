"use client";

import { useCallback, useEffect, useState } from "react";
import {
  X,
  Loader2,
  ExternalLink,
  Calendar,
  Clock,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  UserX,
  MapPin,
  UserPlus,
  Stethoscope,
  Pencil,
  User,
  ChevronDown,
} from "lucide-react";
import { branchesList as fallbackBranches, servicesList as fallbackServices } from "@/lib/data";
import { cn, parseStoredDate, toLocalISOString } from "@/lib/utils";
import type { AppointmentDisplayStatus } from "@/lib/appointments";

type PanelStatus = "scheduled" | "completed" | "cancelled" | "no_show";

interface TrackingField {
  key: string;
  label: string;
  value: string;
}

interface AppointmentDetail {
  appointment: {
    status: AppointmentDisplayStatus;
    statusLabel: string;
    dateTimeLabel: string;
    service: string;
    doctor: string;
    note: string;
  };
  inquiry: {
    id: string;
    name: string;
    phone: string;
    status: string;
    statusLabel: string;
    note: string;
    service: string;
    branch: string;
    nextFollowUp: string;
    nextFollowUpLabel: string;
    dateLabel: string;
    timeLabel: string;
    duration: string;
    assignedTo: string;
    meta: { doctor?: string; duration?: string };
    tracking: Record<string, string>;
  };
  doctorName: string;
  assigneeLabel: string;
  trackingFields: TrackingField[];
  doctors: { id: string; name: string }[];
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
    active: "bg-sky-600 text-white border-2 border-sky-600 shadow-sm",
    idle: "bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100",
  },
  {
    key: "completed",
    label: "مكتمل",
    Icon: CheckCircle2,
    active: "bg-emerald-100 text-emerald-800 border-2 border-emerald-500",
    idle: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  {
    key: "cancelled",
    label: "ملغي",
    Icon: XCircle,
    active: "bg-rose-100 text-rose-800 border-2 border-rose-500",
    idle: "bg-rose-50 text-rose-700 border border-rose-200",
  },
  {
    key: "no_show",
    label: "لم يحضر",
    Icon: UserX,
    active: "bg-amber-100 text-amber-900 border-2 border-amber-500",
    idle: "bg-amber-50 text-amber-800 border border-amber-200",
  },
];

const STATUS_MODAL_THEME: Record<
  PanelStatus,
  { title: string; bg: string; titleColor: string; requiredNote: boolean }
> = {
  scheduled: {
    title: "مجدول – تحديث الحالة",
    bg: "bg-sky-50",
    titleColor: "text-sky-700",
    requiredNote: false,
  },
  completed: {
    title: "مكتمل – تحديث الحالة",
    bg: "bg-emerald-50",
    titleColor: "text-emerald-700",
    requiredNote: false,
  },
  cancelled: {
    title: "ملغي – تحديث الحالة",
    bg: "bg-rose-50",
    titleColor: "text-rose-700",
    requiredNote: true,
  },
  no_show: {
    title: "لم يحضر – تحديث الحالة",
    bg: "bg-amber-50",
    titleColor: "text-amber-800",
    requiredNote: true,
  },
};

const STATUS_DOT: Record<PanelStatus, string> = {
  scheduled: "bg-emerald-500",
  completed: "bg-violet-500",
  cancelled: "bg-rose-500",
  no_show: "bg-amber-500",
};

function DetailRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-slate-100 last:border-0">
      <Icon className="h-4 w-4 text-slate-400 shrink-0" />
      <div className="flex-1 text-right min-w-0">
        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-slate-900">{value || "—"}</p>
      </div>
    </div>
  );
}

interface Props {
  appointmentId: string | null;
  open: boolean;
  onClose: () => void;
  onUpdated?: () => void;
  onViewInquiry?: (id: string) => void;
  onOpenFullDetails?: (id: string) => void;
  initialSubView?: "panel" | "status" | "edit";
  initialStatus?: PanelStatus;
}

const DURATIONS = ["30 دقائق", "45 دقائق", "60 دقائق", "90 دقائق", "120 دقائق"];

function displayStatusToPanel(status: AppointmentDisplayStatus): PanelStatus {
  if (status === "completed") return "completed";
  if (status === "cancelled") return "cancelled";
  if (status === "no_show") return "no_show";
  return "scheduled";
}

export function AppointmentPanelModal({
  appointmentId,
  open,
  onClose,
  onUpdated,
  onViewInquiry,
  onOpenFullDetails,
  initialSubView = "panel",
  initialStatus,
}: Props) {
  const [data, setData] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [subView, setSubView] = useState<"panel" | "status" | "edit">("panel");
  const [targetStatus, setTargetStatus] = useState<PanelStatus>("scheduled");

  const load = useCallback(async () => {
    if (!appointmentId) return;
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
    if (open && appointmentId) {
      setSubView(initialSubView);
      if (initialStatus) setTargetStatus(initialStatus);
      load();
    }
  }, [open, appointmentId, load, initialSubView, initialStatus]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[105] flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div
        className="relative w-full max-w-[480px] max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {loading || !data ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : subView === "status" ? (
          <StatusUpdateView
            appointmentId={appointmentId!}
            statusType={targetStatus}
            inquiry={data.inquiry}
            onBack={() => setSubView("panel")}
            onDone={() => {
              load();
              onUpdated?.();
              setSubView("panel");
            }}
          />
        ) : subView === "edit" ? (
          <EditAppointmentView
            appointmentId={appointmentId!}
            inquiry={data.inquiry}
            doctors={data.doctors}
            onBack={() => setSubView("panel")}
            onDone={() => {
              load();
              onUpdated?.();
              setSubView("panel");
            }}
          />
        ) : (
          <div className="p-6 pt-8">
            {/* رأس: تفاصيل الموعد */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSubView("edit")}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50"
                  title="تعديل الموعد"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                تفاصيل الموعد
                <Calendar className="h-5 w-5 text-slate-600" />
              </h2>
            </div>

            {/* شارة الحالة */}
            <div className="flex items-center justify-end gap-2 mb-4">
              <span className="text-sm font-medium text-slate-800">
                {data.appointment.statusLabel}
              </span>
              <span
                className={cn(
                  "h-2 w-2 rounded-full shrink-0",
                  STATUS_DOT[targetStatus]
                )}
              />
            </div>

            <hr className="border-slate-200 mb-1" />

            {/* صفوف التفاصيل */}
            <div className="mb-2">
              <DetailRow label="العميل" value={data.inquiry.name} icon={User} />
              <DetailRow
                label="التاريخ"
                value={data.inquiry.dateLabel || data.inquiry.nextFollowUpLabel}
                icon={Calendar}
              />
              <DetailRow
                label="الوقت"
                value={data.inquiry.timeLabel}
                icon={Clock}
              />
              <DetailRow
                label="الخدمة"
                value={data.inquiry.service}
                icon={Stethoscope}
              />
              <DetailRow
                label="الطبيب"
                value={data.doctorName}
                icon={User}
              />
              <DetailRow
                label="الفرع"
                value={data.inquiry.branch}
                icon={MapPin}
              />
              <DetailRow
                label="مسند إلى"
                value={data.assigneeLabel}
                icon={UserPlus}
              />
            </div>

            <hr className="border-slate-200 my-4" />

            {/* الاستفسار المرتبط */}
            <div className="flex items-center justify-between mb-5">
              <button
                type="button"
                onClick={() => onViewInquiry?.(data.inquiry.id)}
                className="inline-flex items-center gap-1 text-sm text-sky-600 hover:underline font-medium"
              >
                عرض الاستفسار
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
              <p className="text-sm font-semibold text-slate-800">الاستفسار المرتبط</p>
            </div>

            <hr className="border-slate-200 mb-4" />

            {/* تغيير الحالة */}
            <p className="text-sm font-semibold text-slate-800 mb-3 text-right">
              تغيير الحالة
            </p>
            <div className="flex flex-wrap gap-2 justify-end mb-5">
              {STATUS_CHIPS.map(({ key, label, Icon, active, idle }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setTargetStatus(key);
                    setSubView("status");
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors",
                    targetStatus === key ? active : idle
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* أزرار الإجراء */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSubView("edit")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                <Pencil className="h-4 w-4" />
                تعديل الموعد
              </button>
              <button
                type="button"
                onClick={() => {
                  if (appointmentId) onOpenFullDetails?.(appointmentId);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 text-sm font-semibold text-slate-900 hover:bg-amber-500 shadow-sm"
              >
                <ExternalLink className="h-4 w-4" />
                تفاصيل الموعد
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusUpdateView({
  appointmentId,
  statusType,
  inquiry,
  onBack,
  onDone,
}: {
  appointmentId: string;
  statusType: PanelStatus;
  inquiry: AppointmentDetail["inquiry"];
  onBack: () => void;
  onDone: () => void;
}) {
  const theme = STATUS_MODAL_THEME[statusType];
  const [note, setNote] = useState(inquiry.note || "");
  const [date, setDate] = useState(() => parseStoredDate(inquiry.nextFollowUp) || new Date());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const timeStr = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

  async function handleSubmit() {
    if (theme.requiredNote && !note.trim()) {
      setError("الملاحظات مطلوبة");
      return;
    }
    setError("");
    setSaving(true);
    const res = await fetch(`/api/appointments/${appointmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "status",
        statusType,
        note,
        nextFollowUp: toLocalISOString(date),
      }),
    });
    setSaving(false);
    if (res.ok) onDone();
    else {
      const d = await res.json();
      setError(d.error || "حدث خطأ");
    }
  }

  return (
    <div className={cn("p-6 pt-8 rounded-2xl", theme.bg)}>
      <div className="flex items-center justify-between mb-5">
        <button type="button" onClick={onBack} className="text-sm text-slate-600 hover:underline">
          رجوع
        </button>
        <h3 className={cn("text-base font-bold flex items-center gap-2", theme.titleColor)}>
          <Calendar className="h-4 w-4" />
          تفاصيل الموعد
        </h3>
      </div>

      <div className="bg-white rounded-xl px-4 py-3 mb-5 shadow-sm">
        <p className={cn("font-bold text-sm", theme.titleColor)}>{theme.title}</p>
      </div>

      {statusType === "scheduled" || statusType === "completed" ? (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              التاريخ <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              <Calendar className="h-4 w-4 text-amber-500 shrink-0" />
              <input
                type="date"
                value={dateStr}
                onChange={(e) => {
                  const d = new Date(date);
                  const [y, m, day] = e.target.value.split("-").map(Number);
                  d.setFullYear(y, m - 1, day);
                  setDate(d);
                }}
                className="flex-1 text-sm border-0 outline-none bg-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              الوقت <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                <input
                  type="time"
                  value={timeStr}
                  onChange={(e) => {
                    const d = new Date(date);
                    const [h, min] = e.target.value.split(":").map(Number);
                    d.setHours(h, min);
                    setDate(d);
                  }}
                  className="flex-1 text-sm border-0 outline-none bg-transparent"
                />
              </div>
              <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>
      ) : null}

      <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          ملاحظات {theme.requiredNote && <span className="text-red-500">*</span>}
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="أضف ملاحظات..."
          rows={4}
          required={theme.requiredNote}
          className="w-full rounded-xl border-2 border-emerald-400/70 px-4 py-3 text-sm resize-none outline-none focus:ring-2 focus:ring-emerald-200 bg-white"
        />
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-700"
        >
          إلغاء
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1 rounded-xl bg-amber-400 py-3 text-sm font-semibold text-slate-900 hover:bg-amber-500 disabled:opacity-60"
        >
          {saving ? "جاري الحفظ..." : "تحديث الحالة"}
        </button>
      </div>
    </div>
  );
}

function EditAppointmentView({
  appointmentId,
  inquiry,
  doctors,
  onBack,
  onDone,
}: {
  appointmentId: string;
  inquiry: AppointmentDetail["inquiry"];
  doctors: { id: string; name: string }[];
  onBack: () => void;
  onDone: () => void;
}) {
  const [date, setDate] = useState(() => parseStoredDate(inquiry.nextFollowUp) || new Date());
  const [branch, setBranch] = useState(inquiry.branch || "");
  const [doctorId, setDoctorId] = useState(inquiry.assignedTo || "");
  const [service, setService] = useState(inquiry.service || "");
  const [duration, setDuration] = useState(inquiry.meta?.duration || "60 دقائق");
  const [note, setNote] = useState(inquiry.note || "");
  const [saving, setSaving] = useState(false);
  const [branches, setBranches] = useState<string[]>(fallbackBranches);
  const [services, setServices] = useState<string[]>(fallbackServices);

  useEffect(() => {
    fetch("/api/clinic/meta")
      .then((r) => r.json())
      .then((d) => {
        if (d.branches?.length) setBranches(d.branches);
        if (d.services?.length) setServices(d.services);
      });
  }, []);

  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const timeStr = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  const selectedDoctor = doctors.find((d) => d.id === doctorId);

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/appointments/${appointmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "edit",
        nextFollowUp: toLocalISOString(date),
        branch,
        service,
        note,
        assignedTo: doctorId,
        doctorName: selectedDoctor?.name,
        duration,
      }),
    });
    setSaving(false);
    if (res.ok) onDone();
  }

  return (
    <div className="p-6 pt-8">
      <div className="flex items-center justify-between mb-6">
        <button type="button" onClick={onBack} className="text-sm text-slate-600 hover:underline">
          رجوع
        </button>
        <h3 className="text-lg font-bold text-slate-900">تعديل الموعد</h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FieldSelect label="اختر التاريخ" icon={Calendar}>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => {
                const d = new Date(date);
                const [y, m, day] = e.target.value.split("-").map(Number);
                d.setFullYear(y, m - 1, day);
                setDate(d);
              }}
              className="w-full text-sm border-0 outline-none bg-transparent"
            />
          </FieldSelect>
          <FieldSelect label="اختر الوقت" icon={Clock}>
            <input
              type="time"
              value={timeStr}
              onChange={(e) => {
                const d = new Date(date);
                const [h, min] = e.target.value.split(":").map(Number);
                d.setHours(h, min);
                setDate(d);
              }}
              className="w-full text-sm border-0 outline-none bg-transparent"
            />
          </FieldSelect>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">اختر الفرع</label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white"
            >
              <option value="">—</option>
              {branches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">اختر الطبيب</label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white"
            >
              <option value="">—</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {selectedDoctor && (
              <p className="text-xs text-violet-700 mt-1 flex items-center gap-1">
                <User className="h-3 w-3" />
                {selectedDoctor.name}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">اختر الخدمة</label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white"
            >
              <option value="">—</option>
              {services.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">المدة</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white"
            >
              {DURATIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">ملاحظات</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="أضف ملاحظات..."
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm resize-none outline-none"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-medium"
        >
          إلغاء
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-1 rounded-xl bg-amber-400 py-3 text-sm font-semibold text-slate-900 disabled:opacity-60"
        >
          {saving ? "جاري الحفظ..." : "حفظ"}
        </button>
      </div>
    </div>
  );
}

function FieldSelect({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof Calendar;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-800 mb-2">{label}</label>
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
        <Icon className="h-4 w-4 text-amber-500 shrink-0" />
        {children}
        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 mr-auto" />
      </div>
    </div>
  );
}
