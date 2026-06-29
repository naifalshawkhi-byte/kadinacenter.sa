import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import {
  canStaffAccessInquiry,
  createFollowUpEntry,
  formatDateTimeAr,
  getAllDoctors,
  getFollowUpLogs,
  getInquiryById,
  updateInquiry,
  type AppointmentBulkStatus,
} from "@/lib/db";
import { inquiryToAppointment } from "@/lib/appointments";
import type { TrackingData } from "@/lib/tracking";
import { formatFollowUpDateAr, formatAppointmentDateAr, formatAppointmentTimeAr } from "@/lib/utils";
import { getAllUsers } from "@/lib/db";
import { statusLabels } from "@/lib/data";

const TRACKING_LABELS: Record<keyof TrackingData, string> = {
  source: "المصدر",
  medium: "الوسيط",
  campaign: "الحملة",
  content: "المحتوى",
  term: "المصطلح",
  landingPath: "الصفحة",
  referrer: "معرف نقرات فيسبوك",
  campaignId: "معرف الحملة",
  doctorId: "معرف الطبيب",
  doctorName: "الطبيب",
  platform: "المنصة",
  campaignName: "اسم الحملة",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const inquiry = getInquiryById(id);
  if (!inquiry) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  if (!canStaffAccessInquiry(session!.role, session!.id, inquiry)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const doctors = getAllDoctors();
  const doctorMap = new Map(doctors.map((d) => [d.id, d.name]));
  const appointment = inquiryToAppointment(inquiry, doctorMap);
  if (!appointment) {
    return NextResponse.json({ error: "ليس موعداً" }, { status: 404 });
  }

  const tracking = inquiry.tracking || {};
  const trackingFields = (Object.keys(TRACKING_LABELS) as (keyof TrackingData)[])
    .map((key) => ({
      key,
      label: TRACKING_LABELS[key],
      value: tracking[key] || "—",
    }))
    .filter((f) => f.value !== "—");

  const doctorName =
    (inquiry.assignedTo && doctorMap.get(inquiry.assignedTo)) ||
    inquiry.meta?.doctor ||
    "غير معين";

  const duration = inquiry.meta?.duration || "30 دقائق";
  const timeLabel = formatAppointmentTimeAr(inquiry.nextFollowUp);
  const timeWithDuration =
    timeLabel !== "—" ? `${timeLabel} • ${duration}` : duration;

  const users = getAllUsers();
  const assigneeStaff = inquiry.meta?.assignedStaff
    ? users.find((u) => u.id === inquiry.meta?.assignedStaff)?.name
    : undefined;

  const meta = inquiry.meta || {};
  const attendanceLabel = meta.noShow
    ? "لم يحضر"
    : inquiry.status === "attended"
      ? "حضر"
      : inquiry.status === "failed"
        ? "ملغي"
        : "—";

  const logs = getFollowUpLogs(id).map((log) => {
    const logStatusLabel = statusLabels[log.status] || log.status;
    return {
      id: log.id,
      title: `${logStatusLabel === "محجوز" ? "مجدول" : logStatusLabel} — تحديث الموعد`,
      status: log.status,
      statusLabel: logStatusLabel,
      note: log.note,
      createdAt: log.createdAt,
      createdAtFormatted: formatDateTimeAr(log.createdAt),
      createdByName: log.createdByName,
      appointmentDate: formatFollowUpDateAr(log.nextFollowUp || inquiry.nextFollowUp),
      service: inquiry.service || "—",
      doctor: doctorName,
      attendance:
        log.status === "attended"
          ? "حضر"
          : log.status === "failed"
            ? meta.noShow
              ? "لم يحضر"
              : "ملغي"
            : "—",
    };
  });

  const client = {
    name: inquiry.name || "",
    gender: meta.gender || "",
    age: meta.age || "",
    address: meta.address || inquiry.branch || "",
    email: meta.email || "",
    phone: inquiry.phone || "",
    phoneExtra1: meta.phoneExtra1 || "",
    phoneExtra2: meta.phoneExtra2 || "",
    phoneExtra3: meta.phoneExtra3 || "",
    preferredPhone: meta.preferredPhone || "primary",
    notes: meta.clientNotes || inquiry.note || "",
  };

  return NextResponse.json({
    appointment,
    inquiry: {
      id: inquiry.id,
      name: inquiry.name,
      phone: inquiry.phone,
      status: inquiry.status,
      statusLabel: statusLabels[inquiry.status] || inquiry.status,
      note: inquiry.note,
      service: inquiry.service,
      branch: inquiry.branch,
      nextFollowUp: inquiry.nextFollowUp,
      nextFollowUpLabel: formatFollowUpDateAr(inquiry.nextFollowUp),
      dateLabel: formatAppointmentDateAr(inquiry.nextFollowUp),
      timeLabel: timeWithDuration,
      duration,
      assignedTo: inquiry.assignedTo,
      meta,
      tracking,
      createdAtFormatted: formatDateTimeAr(inquiry.createdAt),
    },
    doctorName,
    assigneeLabel: assigneeStaff || "غير مسند",
    attendanceLabel,
    trackingFields,
    logs,
    client,
    doctors: doctors.map((d) => ({ id: d.id, name: d.name, specialty: d.specialty })),
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const inquiry = getInquiryById(id);
  if (!inquiry) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  if (!canStaffAccessInquiry(session!.role, session!.id, inquiry)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const body = await request.json();
  const actor = { id: session!.id, name: session!.name };

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
    if ((statusType === "cancelled" || statusType === "no_show") && !body.note?.trim()) {
      return NextResponse.json({ error: "الملاحظات مطلوبة لهذه الحالة" }, { status: 400 });
    }

    let doctorName = inquiry.meta?.doctor || "";
    if (body.assignedTo) {
      const doc = getAllDoctors().find((d) => d.id === body.assignedTo);
      if (doc) doctorName = doc.name;
    }

    const result = createFollowUpEntry(
      id,
      {
        status:
          statusType === "scheduled"
            ? "booked"
            : statusType === "completed"
              ? "attended"
              : "failed",
        note: body.note ?? inquiry.note,
        nextFollowUp: body.nextFollowUp ?? inquiry.nextFollowUp,
        service: inquiry.service,
        branch: inquiry.branch,
        assignedTo: body.assignedTo ?? inquiry.assignedTo,
        meta: {
          ...inquiry.meta,
          doctor: doctorName,
          noShow: statusType === "no_show",
          failReason: statusType === "cancelled" ? body.note : inquiry.meta?.failReason,
        },
      },
      actor
    );

    return NextResponse.json({ success: true, inquiry: result?.inquiry });
  }

  if (body.action === "edit") {
    let doctorName = body.doctorName || "";
    if (body.assignedTo) {
      const doc = getAllDoctors().find((d) => d.id === body.assignedTo);
      if (doc) doctorName = doc.name;
    }

    const result = createFollowUpEntry(
      id,
      {
        status: "booked",
        note: body.note ?? inquiry.note,
        nextFollowUp: body.nextFollowUp,
        service: body.service ?? inquiry.service,
        branch: body.branch ?? inquiry.branch,
        assignedTo: body.assignedTo ?? inquiry.assignedTo,
        meta: {
          ...inquiry.meta,
          doctor: doctorName,
          duration: body.duration,
          noShow: false,
        },
      },
      actor
    );

    if (!result) {
      return NextResponse.json({ error: "فشل التحديث" }, { status: 500 });
    }
    return NextResponse.json({ success: true, inquiry: result.inquiry });
  }

  if (body.action === "client") {
    const updated = updateInquiry(
      id,
      {
        name: body.name?.trim() || inquiry.name,
        phone: body.phone?.trim() || inquiry.phone,
        branch: body.address?.trim() || inquiry.branch,
        note: body.notes?.trim() ?? inquiry.note,
        meta: {
          ...inquiry.meta,
          gender: body.gender,
          age: body.age,
          address: body.address,
          email: body.email,
          phoneExtra1: body.phoneExtra1,
          phoneExtra2: body.phoneExtra2,
          phoneExtra3: body.phoneExtra3,
          preferredPhone: body.preferredPhone,
          clientNotes: body.notes,
        },
      },
      actor
    );
    if (!updated) {
      return NextResponse.json({ error: "فشل التحديث" }, { status: 500 });
    }
    return NextResponse.json({ success: true, inquiry: updated });
  }

  return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
}
