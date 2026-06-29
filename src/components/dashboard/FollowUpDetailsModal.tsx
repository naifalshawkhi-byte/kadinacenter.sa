"use client";

import { useCallback, useEffect, useState } from "react";
import {
  X,
  Loader2,
  Send,
  Sparkles,
  Phone,
  CheckCircle,
  Calendar,
  Clock,
  User,
  ClipboardList,
  MessageSquare,
  ThumbsUp,
  Circle,
  Activity,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
} from "lucide-react";
import { cn, parseStoredDate, toLocalISOString } from "@/lib/utils";
import { servicesList as fallbackServices } from "@/lib/data";
import type { InquiryStatus } from "@/lib/types";
import type { InquiryMeta } from "@/lib/db";

const STATUS_TABS: {
  key: InquiryStatus;
  label: string;
  title: string;
  titleColor: string;
  base: string;
  active: string;
  Icon: typeof Circle;
}[] = [
  { key: "new", label: "جديد", title: "جديد - إضافة متابعة", titleColor: "text-slate-700", base: "bg-slate-500/90 text-white", active: "bg-slate-600 text-white border-2 border-sky-500", Icon: Circle },
  { key: "followup", label: "متابعة", title: "متابعة - إضافة متابعة", titleColor: "text-blue-600", base: "bg-amber-50 text-amber-700 border-amber-100", active: "bg-amber-100 text-amber-800 border-2 border-amber-400", Icon: Activity },
  { key: "booked", label: "محجوز", title: "محجوز - إضافة متابعة", titleColor: "text-amber-600", base: "bg-emerald-50 text-emerald-700 border-emerald-100", active: "bg-emerald-100 text-emerald-800 border-2 border-emerald-400", Icon: ClipboardCheck },
  { key: "attended", label: "حضر", title: "حضر - إضافة متابعة", titleColor: "text-violet-600", base: "bg-sky-50 text-sky-700 border-sky-100", active: "bg-sky-100 text-sky-800 border-2 border-sky-400", Icon: CheckCircle2 },
  { key: "failed", label: "فشل", title: "فشل - إضافة متابعة", titleColor: "text-rose-600", base: "bg-rose-50 text-rose-600 border-rose-100", active: "bg-rose-100 text-rose-700 border-2 border-rose-400", Icon: XCircle },
];

const NEXT_ACTIONS = ["اتصال هاتفي", "إرسال عرض", "انتظار رد العميل"];
const GOALS = ["حجز موعد", "إغلاق البيع", "متابعة لاحقة", "تأكيد الحضور"];

interface DoctorOption {
  id: string;
  name: string;
}

const DEFAULT_DOCTORS: DoctorOption[] = [
  { id: "default-1", name: "د. ريم القحطاني" },
  { id: "default-2", name: "د. أحمد السعيد" },
  { id: "default-3", name: "د. فاطمة النجار" },
];

interface Props {
  inquiryId: string | null;
  open: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export function FollowUpDetailsModal({ inquiryId, open, onClose, onUpdated }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<InquiryStatus>("new");
  const [clientName, setClientName] = useState("");

  const [note, setNote] = useState("");
  const [followUpDate, setFollowUpDate] = useState(new Date());
  const [meta, setMeta] = useState<InquiryMeta>({});
  const [service, setService] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [doctors, setDoctors] = useState<DoctorOption[]>(DEFAULT_DOCTORS);
  const [services, setServices] = useState<string[]>(fallbackServices);

  useEffect(() => {
    if (!open) return;
    fetch("/api/clinic/meta")
      .then((r) => r.json())
      .then((d) => {
        if (d.services?.length) setServices(d.services);
      });
  }, [open]);

  const load = useCallback(async () => {
    if (!inquiryId) return;
    setLoading(true);
    const [inqRes, docRes] = await Promise.all([
      fetch(`/api/inquiries/${inquiryId}`),
      fetch("/api/doctors"),
    ]);
    let doctorList = DEFAULT_DOCTORS;
    if (docRes.ok) {
      const d = await docRes.json();
      const list = (d.doctors || []).map((doc: { id: string; name: string }) => ({
        id: doc.id,
        name: doc.name,
      }));
      if (list.length) {
        doctorList = list;
        setDoctors(list);
      }
    }

    if (inqRes.ok) {
      const data = await inqRes.json();
      const i = data.inquiry;
      setClientName(i.name || "");
      setStatus(i.status || "new");
      setNote(i.note || "");
      setService(i.service || "");
      const loadedMeta: InquiryMeta = { ...(i.meta || {}) };
      const parsed = parseStoredDate(i.nextFollowUp);
      setFollowUpDate(parsed || new Date());
      if (!loadedMeta.whatHappened && i.note) loadedMeta.whatHappened = i.note;
      if (!loadedMeta.failReason && i.status === "failed") loadedMeta.failReason = i.note;

      const assigned = doctorList.find((doc) => doc.id === i.assignedTo);
      if (assigned) {
        loadedMeta.doctor = assigned.name;
        setAssignedToId(assigned.id);
      } else if (i.meta?.doctor) {
        loadedMeta.doctor = i.meta.doctor;
        const byName = doctorList.find((doc) => doc.name === i.meta.doctor);
        setAssignedToId(byName?.id || "");
      } else {
        setAssignedToId("");
      }

      setMeta(loadedMeta);
    }
    setLoading(false);
  }, [inquiryId]);

  useEffect(() => {
    if (open && inquiryId) load();
  }, [open, inquiryId, load]);

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

  const tab = STATUS_TABS.find((t) => t.key === status)!;

  async function handleSave() {
    if (!inquiryId) return;
    setSaving(true);
    const noteText =
      status === "followup"
        ? meta.whatHappened || note
        : status === "failed"
          ? meta.failReason || note
          : status === "attended"
            ? meta.whatHappened || note
            : note;

    const selectedDoctor = doctors.find((d) => d.id === assignedToId);
    const doctorName = selectedDoctor?.name || meta.doctor || "";

    let assignedTo: string | undefined;
    if (status === "booked") {
      assignedTo = assignedToId || "";
    }

    const res = await fetch(`/api/inquiries/${inquiryId}/followup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        note: noteText,
        nextFollowUp: toLocalISOString(followUpDate),
        service,
        meta: {
          ...meta,
          doctor: doctorName,
          whatHappened: meta.whatHappened || noteText,
          noShow: false,
        },
        assignedTo,
      }),
    });
    setSaving(false);
    if (res.ok) {
      onUpdated?.();
      onClose();
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div
        className="relative w-full max-w-[560px] max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="p-6 pt-8">
            <h2 className={cn("text-lg font-bold mb-1", tab.titleColor)}>{tab.title}</h2>
            {clientName && (
              <p className="text-sm text-slate-500 mb-4">{clientName}</p>
            )}

            {/* Status tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {STATUS_TABS.map(({ key, label, base, active, Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStatus(key)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold",
                    status === key ? active : base
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Forms by status */}
            {status === "followup" && (
              <FollowupForm
                meta={meta}
                setMeta={setMeta}
                followUpDate={followUpDate}
                setFollowUpDate={setFollowUpDate}
              />
            )}

            {status === "booked" && (
              <BookedForm
                meta={meta}
                setMeta={setMeta}
                service={service}
                setService={setService}
                services={services}
                doctors={doctors}
                assignedToId={assignedToId}
                setAssignedToId={setAssignedToId}
                followUpDate={followUpDate}
                setFollowUpDate={setFollowUpDate}
                note={note}
                setNote={setNote}
              />
            )}

            {status === "attended" && (
              <AttendedForm meta={meta} setMeta={setMeta} />
            )}

            {status === "failed" && (
              <FailedForm meta={meta} setMeta={setMeta} />
            )}

            {(status === "new") && (
              <NewForm
                note={note}
                setNote={setNote}
                followUpDate={followUpDate}
                setFollowUpDate={setFollowUpDate}
              />
            )}

            <SaveButton onClick={handleSave} saving={saving} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ——— متابعة ——— */
function FollowupForm({
  meta,
  setMeta,
  followUpDate,
  setFollowUpDate,
}: {
  meta: InquiryMeta;
  setMeta: (m: InquiryMeta) => void;
  followUpDate: Date;
  setFollowUpDate: (d: Date) => void;
}) {
  const text = meta.whatHappened || "";
  return (
    <div className="space-y-5">
      <FieldLabel icon={Sparkles} iconColor="text-blue-500" label="ماذا حدث" />
      <TextAreaGreen
        value={text}
        onChange={(v) => setMeta({ ...meta, whatHappened: v })}
        placeholder="أدخل تفاصيل ما حدث..."
        footer={<TextareaToolbar charCount={text.length} />}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel icon={Phone} iconColor="text-emerald-500" label="الإجراء التالي" />
          <SelectField
            value={meta.nextAction || ""}
            onChange={(v) => setMeta({ ...meta, nextAction: v })}
            options={NEXT_ACTIONS}
          />
        </div>
        <div>
          <FieldLabel icon={CheckCircle} iconColor="text-violet-500" label="الهدف" />
          <SelectField
            value={meta.goal || ""}
            onChange={(v) => setMeta({ ...meta, goal: v })}
            options={GOALS}
          />
        </div>
      </div>

      <DateTimeSection date={followUpDate} setDate={setFollowUpDate} />
    </div>
  );
}

/* ——— محجوز ——— */
function BookedForm({
  meta,
  setMeta,
  service,
  setService,
  services,
  doctors,
  assignedToId,
  setAssignedToId,
  followUpDate,
  setFollowUpDate,
  note,
  setNote,
}: {
  meta: InquiryMeta;
  setMeta: (m: InquiryMeta) => void;
  service: string;
  setService: (s: string) => void;
  services: string[];
  doctors: DoctorOption[];
  assignedToId: string;
  setAssignedToId: (id: string) => void;
  followUpDate: Date;
  setFollowUpDate: (d: Date) => void;
  note: string;
  setNote: (n: string) => void;
}) {
  const selectedDoctor = doctors.find((d) => d.id === assignedToId);

  function onDoctorChange(id: string) {
    setAssignedToId(id);
    const doc = doctors.find((d) => d.id === id);
    setMeta({ ...meta, doctor: doc?.name || "" });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel icon={User} iconColor="text-violet-500" label="الطبيب" />
          <select
            value={assignedToId}
            onChange={(e) => onDoctorChange(e.target.value)}
            className="w-full rounded-xl border-2 border-emerald-400 px-4 py-2.5 text-sm bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-200"
          >
            <option value="">— اختر الطبيب —</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          {selectedDoctor && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-sm text-violet-800">
              <User className="h-4 w-4 shrink-0" />
              <span>
                سيُعيَّن في الجدول: <strong>{selectedDoctor.name}</strong>
              </span>
            </div>
          )}
        </div>
        <div>
          <FieldLabel icon={ClipboardList} iconColor="text-teal-500" label="الخدمة" />
          <SelectField
            value={service}
            onChange={setService}
            options={services}
          />
        </div>
      </div>

      <DateTimeSection
        date={followUpDate}
        setDate={setFollowUpDate}
        label="تاريخ ووقت الموعد"
      />

      <div>
        <FieldLabel icon={MessageSquare} iconColor="text-amber-500" label="ملاحظات" />
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="أضف ملاحظات..."
          rows={3}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm resize-y focus:border-emerald-400 focus:outline-none"
        />
      </div>
    </div>
  );
}

/* ——— حضر ——— */
function AttendedForm({
  meta,
  setMeta,
}: {
  meta: InquiryMeta;
  setMeta: (m: InquiryMeta) => void;
}) {
  const text = meta.whatHappened || "";
  return (
    <div className="space-y-4">
      <FieldLabel icon={ThumbsUp} iconColor="text-emerald-500" label="مستوى الرضا" />
      <TextAreaGreen
        value={text}
        onChange={(v) => setMeta({ ...meta, whatHappened: v })}
        placeholder="أدخل تفاصيل حول رضا العميل..."
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-400">chars {text.length}</span>
            <div className="flex gap-1">
              {["😞", "😕", "😐", "🙂", "😄"].map((e, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMeta({ ...meta, satisfaction: i + 1 })}
                  className={cn(
                    "text-lg w-8 h-8 rounded-full hover:bg-white/80",
                    meta.satisfaction === i + 1 && "bg-white ring-2 ring-emerald-400"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        }
      />
    </div>
  );
}

/* ——— فشل ——— */
function FailedForm({
  meta,
  setMeta,
}: {
  meta: InquiryMeta;
  setMeta: (m: InquiryMeta) => void;
}) {
  const text = meta.failReason || "";
  return (
    <div className="space-y-4">
      <FieldLabel icon={XCircle} iconColor="text-rose-500" label="سبب الفشل" />
      <TextAreaGreen
        value={text}
        onChange={(v) => setMeta({ ...meta, failReason: v })}
        placeholder="أدخل تفاصيل حول سبب فشل المتابعة..."
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-400">chars {text.length}</span>
            <div className="flex gap-2 text-rose-400">
              <Calendar className="h-4 w-4" />
              <Phone className="h-4 w-4" />
              <X className="h-4 w-4" />
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
        }
      />
    </div>
  );
}

/* ——— جديد ——— */
function NewForm({
  note,
  setNote,
  followUpDate,
  setFollowUpDate,
}: {
  note: string;
  setNote: (n: string) => void;
  followUpDate: Date;
  setFollowUpDate: (d: Date) => void;
}) {
  return (
    <div className="space-y-5">
      <FieldLabel icon={Sparkles} iconColor="text-slate-500" label="ملاحظة" />
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="أدخل ملاحظة..."
        rows={4}
        className="w-full rounded-xl border-2 border-emerald-400/60 px-4 py-3 text-sm resize-none focus:outline-none"
      />
      <DateTimeSection date={followUpDate} setDate={setFollowUpDate} />
    </div>
  );
}

/* ——— Shared UI ——— */
function FieldLabel({
  icon: Icon,
  iconColor,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Icon className={cn("h-4 w-4", iconColor)} />
      <span className="text-sm font-semibold text-slate-800">{label}</span>
    </div>
  );
}

function TextAreaGreen({
  value,
  onChange,
  placeholder,
  footer,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border-2 border-emerald-400 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-200">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full px-4 py-3 text-sm resize-none border-0 focus:outline-none bg-white"
      />
      {footer && (
        <div className="flex items-center px-3 py-2 border-t border-emerald-100 bg-slate-50/80">
          {footer}
        </div>
      )}
    </div>
  );
}

function TextareaToolbar({ charCount }: { charCount: number }) {
  return (
    <div className="flex items-center justify-between w-full gap-2">
      <span className="text-xs text-slate-400">chars {charCount}</span>
      <div className="flex gap-1.5 text-slate-400">
        <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs">✓</span>
        <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xs">?</span>
        <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 text-xs">✕</span>
        <Phone className="h-4 w-4 text-blue-500" />
        <MessageSquare className="h-4 w-4 text-emerald-500" />
      </div>
    </div>
  );
}

function SelectField({
  value,
  onChange,
  options,
  highlight,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  highlight?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full rounded-xl border px-4 py-2.5 text-sm bg-white appearance-none cursor-pointer focus:outline-none",
        highlight ? "border-emerald-400 focus:border-emerald-500" : "border-slate-200 focus:border-slate-400"
      )}
    >
      <option value="">— اختر —</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

function DateTimeSection({
  date,
  setDate,
  label = "تاريخ ووقت المتابعة التالية",
}: {
  date: Date;
  setDate: (d: Date) => void;
  label?: string;
}) {
  const dateStr = toDateInput(date);
  const timeStr = toTimeInput(date);

  return (
    <div>
      <FieldLabel icon={Calendar} iconColor="text-amber-500" label={label} />
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 bg-white">
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
            className="flex-1 text-sm border-0 focus:outline-none bg-transparent"
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 bg-white">
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
            className="flex-1 text-sm border-0 focus:outline-none bg-transparent"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <AdjustBar
          label="1 يوم"
          icon={Calendar}
          onMinus={() => setDate(new Date(date.getTime() - 86400000))}
          onPlus={() => setDate(new Date(date.getTime() + 86400000))}
        />
        <AdjustBar
          label="1 ساعة"
          icon={Clock}
          onMinus={() => setDate(new Date(date.getTime() - 3600000))}
          onPlus={() => setDate(new Date(date.getTime() + 3600000))}
        />
      </div>
    </div>
  );
}

function AdjustBar({
  label,
  icon: Icon,
  onPlus,
  onMinus,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onPlus: () => void;
  onMinus: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-100 px-3 py-2">
      <button type="button" onClick={onMinus} className="p-1 text-amber-700 hover:bg-amber-100 rounded">
        <Minus className="h-4 w-4" />
      </button>
      <span className="flex items-center gap-1 text-sm font-medium text-amber-800">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <button type="button" onClick={onPlus} className="p-1 text-amber-700 hover:bg-amber-100 rounded">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function SaveButton({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="mt-8 flex items-center gap-2 rounded-full bg-gradient-to-l from-blue-600 to-violet-600 px-8 py-3 text-white font-semibold shadow-lg hover:opacity-90 disabled:opacity-60"
    >
      <Send className="h-4 w-4" />
      {saving ? "جاري الحفظ..." : "حفظ"}
    </button>
  );
}

function toDateInput(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function toTimeInput(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}
