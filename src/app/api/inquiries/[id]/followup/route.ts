import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import {
  canStaffAccessInquiry,
  createFollowUpEntry,
  formatDateTimeAr,
  formatFollowUpGap,
  getFollowUpLogs,
  getInquiryById,
} from "@/lib/db";
import type { InquiryStatus } from "@/lib/types";

export async function POST(
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

  const result = createFollowUpEntry(
    id,
    {
      status: (body.status as InquiryStatus) || "new",
      note: body.note || "",
      nextFollowUp: body.nextFollowUp || "",
      service: body.service,
      meta: body.meta,
      assignedTo: body.assignedTo,
    },
    { id: session!.id, name: session!.name }
  );

  if (!result) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  const logs = getFollowUpLogs(id).map((log) => ({
    ...log,
    createdAtFormatted: formatDateTimeAr(log.createdAt),
    nextFollowUpFormatted: log.nextFollowUp ? formatDateTimeAr(log.nextFollowUp) : "",
    gapLabel: formatFollowUpGap(log.createdAt, log.nextFollowUp),
  }));

  return NextResponse.json({
    inquiry: result.inquiry,
    log: result.log,
    logs,
  });
}
