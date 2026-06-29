import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { canAssignSecretary, isAssigneeStaff } from "@/lib/auth";
import {
  canStaffAccessInquiry,
  formatDateTimeAr,
  formatFollowUpGap,
  getFollowUpLogs,
  getInquiryById,
  updateInquiry,
} from "@/lib/db";
import type { InquiryStatus } from "@/lib/types";

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

  const logs = getFollowUpLogs(id).map((log) => ({
    ...log,
    createdAtFormatted: formatDateTimeAr(log.createdAt),
    nextFollowUpFormatted: log.nextFollowUp ? formatDateTimeAr(log.nextFollowUp) : "",
    gapLabel: formatFollowUpGap(log.createdAt, log.nextFollowUp),
  }));

  return NextResponse.json({ inquiry, logs });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const existing = getInquiryById(id);
  if (!existing) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  if (!canStaffAccessInquiry(session!.role, session!.id, existing)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const body = await request.json();

  // Secretaries can only update note/status on their assigned inquiries
  if (isAssigneeStaff(session!.role)) {
    const staffUpdates: Parameters<typeof updateInquiry>[1] = {};
    if (body.note !== undefined) staffUpdates.note = body.note;
    if (body.status !== undefined) staffUpdates.status = body.status as InquiryStatus;
    const updated = updateInquiry(id, staffUpdates, { id: session!.id, name: session!.name });
    if (!updated) {
      return NextResponse.json({ error: "غير موجود" }, { status: 404 });
    }
    return NextResponse.json({ inquiry: updated });
  }

  const updates: Parameters<typeof updateInquiry>[1] = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.phone !== undefined) updates.phone = body.phone;
  if (body.status !== undefined) updates.status = body.status as InquiryStatus;
  if (body.note !== undefined) updates.note = body.note;
  if (body.service !== undefined) updates.service = body.service;
  if (body.branch !== undefined) updates.branch = body.branch;
  if (body.nextFollowUp !== undefined) updates.nextFollowUp = body.nextFollowUp;
  if (body.message !== undefined) updates.message = body.message;
  if (body.assignedTo !== undefined) updates.assignedTo = body.assignedTo;

  if (canAssignSecretary(session!.role) && body.assignedSecretary !== undefined) {
    updates.assignedSecretary = body.assignedSecretary;
  }

  const updated = updateInquiry(id, updates, { id: session!.id, name: session!.name });

  if (!updated) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  const logs = getFollowUpLogs(id).map((log) => ({
    ...log,
    createdAtFormatted: formatDateTimeAr(log.createdAt),
    nextFollowUpFormatted: log.nextFollowUp ? formatDateTimeAr(log.nextFollowUp) : "",
    gapLabel: formatFollowUpGap(log.createdAt, log.nextFollowUp),
  }));

  return NextResponse.json({ inquiry: updated, logs });
}
