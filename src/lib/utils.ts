import type { InquiryStatus } from "./types";

export function getInitials(name?: string | null): string {
  const safe = (name ?? "").trim();
  if (!safe) return "؟";
  const parts = safe.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return parts[0][0] + parts[1][0];
  return safe.slice(0, 2);
}

export function getStatusColor(status?: InquiryStatus | string): string {
  const colors: Record<InquiryStatus, string> = {
    new: "bg-sky-100 text-sky-700",
    followup: "bg-amber-100 text-amber-700",
    booked: "bg-emerald-100 text-emerald-700",
    attended: "bg-blue-100 text-blue-700",
    failed: "bg-red-100 text-red-700",
  };
  if (status && status in colors) return colors[status as InquiryStatus];
  return "bg-gray-100 text-gray-600";
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Saudi mobile: +966 + 9 digits starting with 5 */
export function normalizeSaudiPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  let local = digits;
  if (local.startsWith("966")) local = local.slice(3);
  if (local.startsWith("0")) local = local.slice(1);
  if (!/^5\d{8}$/.test(local)) return null;
  return `+966${local}`;
}

export function formatSaudiPhoneLocal(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("966")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  digits = digits.slice(0, 9);
  if (!digits) return "";
  if (!digits.startsWith("5")) return "";
  return digits;
}

/** حفظ التاريخ بالتوقيت المحلي بدون تحويل UTC */
export function toLocalISOString(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:00`;
}

export function parseStoredDate(value: string): Date | null {
  if (!value || value === "—") return null;
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (m) {
    return new Date(
      Number(m[1]),
      Number(m[2]) - 1,
      Number(m[3]),
      Number(m[4]),
      Number(m[5])
    );
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/** مثال: 25 مايو 2026 11:00 ص — تقويم ميلادي */
export function formatFollowUpDateAr(value: string): string {
  if (!value || value === "—") return "—";
  const d = parseStoredDate(value);
  if (!d) return value;

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

/** مثال: الثلاثاء، ٢٦ مايو ٢٠٢٦ */
export function formatAppointmentDateAr(value: string): string {
  if (!value || value === "—") return "—";
  const d = parseStoredDate(value);
  if (!d) return value;

  const weekday = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", { weekday: "long" }).format(d);
  const day = d.getDate();
  const month = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", { month: "long" }).format(d);
  const year = d.getFullYear();

  return `${weekday}، ${day} ${month} ${year}`;
}

/** مثال: 10:00 ص */
export function formatAppointmentTimeAr(value: string): string {
  if (!value || value === "—") return "—";
  const d = parseStoredDate(value);
  if (!d) return value;

  return new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}
