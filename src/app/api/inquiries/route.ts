import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { canAssignSecretary, canViewAllInquiries } from "@/lib/auth";
import {
  countFollowUps,
  formatRelativeDate,
  getAllDoctors,
  getAssignableStaff,
  getInquiriesForRole,
} from "@/lib/db";
import { buildTrackingTags } from "@/lib/tracking";
import { formatFollowUpDateAr } from "@/lib/utils";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const doctors = getAllDoctors();
  const doctorNameById = new Map(doctors.map((d) => [d.id, d.name]));
  const assignableStaff = getAssignableStaff();
  const staffNameById = new Map(assignableStaff.map((s) => [s.id, s.name]));

  const source = getInquiriesForRole(session!.role, session!.id);

  const inquiries = source.map((i) => ({
    id: i.id,
    name: i.name ?? "",
    phone: i.phone ?? "",
    message: i.message ?? "",
    status: i.status ?? "new",
    note: i.note ?? "",
    service: i.service ?? "",
    branch: i.branch ?? "",
    nextFollowUp: i.nextFollowUp ?? "",
    nextFollowUpLabel: formatFollowUpDateAr(i.nextFollowUp ?? ""),
    meta: i.meta ?? {},
    tracking: i.tracking ?? {},
    trackingTags: buildTrackingTags(i.tracking),
    assignedTo: i.assignedTo ?? "",
    assignedToLabel: i.assignedTo
      ? doctorNameById.get(i.assignedTo) || "غير معين"
      : "غير معين",
    assignedSecretary: i.assignedSecretary ?? "",
    assignedSecretaryLabel: i.assignedSecretary
      ? staffNameById.get(i.assignedSecretary) || "غير معيّن"
      : "غير معيّن",
    followUpCount: countFollowUps(i.id),
    createdAt: i.createdAt,
    createdAtLabel: formatRelativeDate(i.createdAt),
    createdAtFormatted: formatFollowUpDateAr(i.createdAt),
  }));

  const doctorsList = doctors.map((d) => ({ id: d.id, name: d.name, specialty: d.specialty }));

  const assigneesList = assignableStaff.map((s) => {
    const doc = doctors.find((d) => d.id === s.linkedDoctorId);
    return {
      id: s.id,
      name: s.name,
      role: s.role,
      linkedDoctorId: s.linkedDoctorId || "",
      linkedDoctorName: doc?.name || "",
    };
  });

  return NextResponse.json({
    inquiries,
    doctors: doctorsList,
    assignees: canAssignSecretary(session!.role) ? assigneesList : [],
    secretaries: canAssignSecretary(session!.role) ? assigneesList : [],
    role: session!.role,
    canAssign: canAssignSecretary(session!.role),
    isSecretary: !canViewAllInquiries(session!.role),
  });
}
