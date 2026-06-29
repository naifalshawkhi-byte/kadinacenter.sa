import type { InquiryStatus } from "./types";
import {
  Circle,
  Activity,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export const statusConfig: Record<
  InquiryStatus,
  { label: string; pill: string; activeRing: string; icon: typeof Circle }
> = {
  new: {
    label: "جديد",
    pill: "bg-slate-600 text-white",
    activeRing: "ring-2 ring-sky-500 ring-offset-2",
    icon: Circle,
  },
  followup: {
    label: "متابعة",
    pill: "bg-amber-100 text-amber-800 border border-amber-200",
    activeRing: "ring-2 ring-amber-400 ring-offset-2",
    icon: Activity,
  },
  booked: {
    label: "محجوز",
    pill: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    activeRing: "ring-2 ring-emerald-400 ring-offset-2",
    icon: ClipboardCheck,
  },
  attended: {
    label: "حضر",
    pill: "bg-sky-100 text-sky-800 border border-sky-200",
    activeRing: "ring-2 ring-sky-400 ring-offset-2",
    icon: CheckCircle2,
  },
  failed: {
    label: "فشل",
    pill: "bg-red-100 text-red-800 border border-red-200",
    activeRing: "ring-2 ring-red-400 ring-offset-2",
    icon: XCircle,
  },
};

export const statusOrder: InquiryStatus[] = [
  "new",
  "followup",
  "booked",
  "attended",
  "failed",
];
