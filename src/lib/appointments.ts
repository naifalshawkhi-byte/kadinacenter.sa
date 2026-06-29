import { getAllDoctors, getAllInquiries, isAssigneeStaff, type UserRole } from "./db";
import type { DbInquiry } from "./db";
import type { InquiryStatus } from "./types";
import { parseStoredDate } from "./utils";

export type AppointmentDisplayStatus =
  | "confirmed"
  | "pending"
  | "completed"
  | "cancelled"
  | "no_show";

export interface AppointmentRow {
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
  inquiryStatus: InquiryStatus;
  appointmentAt: Date | null;
}

const STATUS_LABELS: Record<AppointmentDisplayStatus, string> = {
  confirmed: "مجدول",
  pending: "مجدول",
  completed: "مكتمل",
  cancelled: "ملغي",
  no_show: "لم يحضر",
};

function mapInquiryStatus(inquiry: DbInquiry): AppointmentDisplayStatus {
  if (inquiry.meta?.noShow) return "no_show";
  switch (inquiry.status) {
    case "booked":
      return "confirmed";
    case "followup":
    case "new":
      return "pending";
    case "attended":
      return "completed";
    case "failed":
      return "cancelled";
    default:
      return "pending";
  }
}

function formatDateTimeLabel(d: Date): string {
  const day = d.getDate();
  const month = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", { month: "long" }).format(d);
  const year = d.getFullYear();
  const time = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
  return `${day} ${month} ${year} ${time}`;
}

function toDateStr(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function toTimeStr(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameWeek(d: Date, ref: Date): boolean {
  const start = new Date(ref);
  start.setDate(ref.getDate() - ref.getDay());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return d >= start && d < end;
}

export function inquiryToAppointment(
  inquiry: DbInquiry,
  doctorNameById: Map<string, string>
): AppointmentRow | null {
  const appointmentAt = parseStoredDate(inquiry.nextFollowUp);
  const hasSchedule = !!appointmentAt;

  const showStatuses: InquiryStatus[] = ["booked", "attended", "failed", "followup"];
  if (!showStatuses.includes(inquiry.status) && !hasSchedule) return null;
  if (!hasSchedule && inquiry.status !== "booked" && inquiry.status !== "attended") {
    return null;
  }

  const displayStatus = mapInquiryStatus(inquiry);
  const doctor =
    (inquiry.assignedTo && doctorNameById.get(inquiry.assignedTo)) ||
    inquiry.meta?.doctor ||
    "غير معين";

  const d = appointmentAt || new Date(inquiry.createdAt);

  return {
    id: inquiry.id,
    clientName: inquiry.name || "—",
    phone: inquiry.phone || "—",
    service: inquiry.service || "—",
    doctor,
    branch: inquiry.branch || "—",
    date: toDateStr(d),
    time: toTimeStr(d),
    dateTimeLabel: formatDateTimeLabel(d),
    status: displayStatus,
    statusLabel: STATUS_LABELS[displayStatus],
    note: inquiry.note || "",
    inquiryStatus: inquiry.status,
    appointmentAt,
  };
}

export function getAppointmentsFromDb(): AppointmentRow[] {
  return getAppointmentsForRole("admin", "");
}

export function getAppointmentsForRole(role: UserRole, userId: string): AppointmentRow[] {
  const doctors = getAllDoctors();
  const doctorNameById = new Map(doctors.map((d) => [d.id, d.name]));

  let inquiries = getAllInquiries();
  if (isAssigneeStaff(role)) {
    inquiries = inquiries.filter((i) => i.assignedSecretary === userId);
  }

  return inquiries
    .map((i) => inquiryToAppointment(i, doctorNameById))
    .filter((a): a is AppointmentRow => a !== null)
    .sort((a, b) => {
      const ta = a.appointmentAt?.getTime() ?? 0;
      const tb = b.appointmentAt?.getTime() ?? 0;
      return tb - ta;
    });
}

export function computeAppointmentStats(rows: AppointmentRow[]) {
  const now = new Date();
  const today = rows.filter((r) => r.appointmentAt && isSameDay(r.appointmentAt, now));
  const thisWeek = rows.filter((r) => r.appointmentAt && isSameWeek(r.appointmentAt, now));
  const confirmed = rows.filter((r) => r.status === "confirmed");
  const pending = rows.filter((r) => r.status === "pending");
  const completed = rows.filter((r) => r.status === "completed");
  const cancelled = rows.filter((r) => r.status === "cancelled");
  const noShow = rows.filter((r) => r.status === "no_show");
  const total = rows.length;

  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return {
    today: today.length,
    thisWeek: thisWeek.length,
    confirmed: confirmed.length,
    pending: pending.length,
    total,
    scheduled: confirmed.length + pending.length,
    completed: completed.length,
    cancelled: cancelled.length,
    noShow: noShow.length,
    scheduledPct: pct(confirmed.length + pending.length),
    completedPct: pct(completed.length),
    cancelledPct: pct(cancelled.length),
    noShowPct: pct(noShow.length),
    totalPct: 100,
  };
}
