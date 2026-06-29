import { NextResponse } from "next/server";
import { createInquiry } from "@/lib/db";
import type { TrackingData } from "@/lib/tracking";
import { normalizeSaudiPhone } from "@/lib/utils";
import { checkRateLimit, getClientIp } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`book:${ip}`, 15, 60 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "تم إرسال طلبات كثيرة — حاول لاحقاً" },
        {
          status: 429,
          headers: rate.retryAfterSec
            ? { "Retry-After": String(rate.retryAfterSec) }
            : undefined,
        }
      );
    }

    const { name, phone, message, branch, service, tracking } = await request.json();
    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "الاسم ورقم الهاتف مطلوبان" }, { status: 400 });
    }

    const normalizedPhone = normalizeSaudiPhone(phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        { error: "رقم الهاتف غير صالح — يجب أن يبدأ بـ 5 ويتكون من 9 أرقام (بعد +966)" },
        { status: 400 }
      );
    }

    const inquiry = createInquiry({
      name: name.trim().slice(0, 120),
      phone: normalizedPhone,
      message: (message || "").trim().slice(0, 2000),
      branch: (branch || "").trim().slice(0, 120),
      service: service?.trim().slice(0, 120) || "",
      tracking: (tracking || {}) as TrackingData,
    });

    return NextResponse.json({ success: true, id: inquiry.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "حدث خطأ أثناء الحفظ" }, { status: 500 });
  }
}
