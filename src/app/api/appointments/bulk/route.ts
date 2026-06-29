import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { isAssigneeStaff } from "@/lib/auth";
import {
  bulkSetAppointmentStatus,
  canStaffAccessInquiry,
  deleteInquiries,
  getInquiryById,
  type AppointmentBulkStatus,
} from "@/lib/db";

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  let ids: string[] = Array.isArray(body.ids) ? body.ids : [];
  if (!ids.length) {
    return NextResponse.json({ error: "لم يتم تحديد أي موعد" }, { status: 400 });
  }

  if (isAssigneeStaff(session!.role)) {
    if (body.action === "delete") {
      return NextResponse.json({ error: "صلاحيات غير كافية" }, { status: 403 });
    }
    ids = ids.filter((id) => {
      const inq = getInquiryById(id);
      return inq && canStaffAccessInquiry(session!.role, session!.id, inq);
    });
    if (!ids.length) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
  }

  const actor = { id: session!.id, name: session!.name };

  if (body.action === "delete") {
    const deleted = deleteInquiries(ids);
    return NextResponse.json({ success: true, deleted });
  }

  if (body.action === "status") {
    const statusType = body.statusType as AppointmentBulkStatus;
    const allowed: AppointmentBulkStatus[] = [
      "scheduled",
      "completed",
      "no_show",
      "cancelled",
    ];
    if (!allowed.includes(statusType)) {
      return NextResponse.json({ error: "حالة غير صالحة" }, { status: 400 });
    }
    const updated = bulkSetAppointmentStatus(ids, statusType, actor);
    return NextResponse.json({ success: true, updated });
  }

  return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
}
