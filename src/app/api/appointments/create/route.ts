import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { isAssigneeStaff } from "@/lib/auth";
import { canStaffAccessInquiry, createFollowUpEntry, getAllDoctors, getInquiryById } from "@/lib/db";

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { inquiryId, nextFollowUp, branch, service, note, assignedTo, doctorName } =
      body;

    if (!inquiryId) {
      return NextResponse.json({ error: "يجب اختيار العميل" }, { status: 400 });
    }

    const inquiry = getInquiryById(inquiryId);
    if (!inquiry) {
      return NextResponse.json({ error: "العميل غير موجود" }, { status: 404 });
    }
    if (!canStaffAccessInquiry(session!.role, session!.id, inquiry)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    if (!nextFollowUp) {
      return NextResponse.json({ error: "التاريخ والوقت مطلوبان" }, { status: 400 });
    }

    let doctorLabel = doctorName || "";
    let doctorId = assignedTo || "";
    if (doctorId) {
      const doc = getAllDoctors().find((d) => d.id === doctorId);
      if (doc) doctorLabel = doc.name;
    }

    const result = createFollowUpEntry(
      inquiryId,
      {
        status: "booked",
        note: note || "",
        nextFollowUp,
        service: service || "",
        branch: branch || "",
        assignedTo: doctorId,
        meta: { doctor: doctorLabel, noShow: false },
      },
      { id: session!.id, name: session!.name }
    );

    if (!result) {
      return NextResponse.json({ error: "العميل غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ success: true, inquiry: result.inquiry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
