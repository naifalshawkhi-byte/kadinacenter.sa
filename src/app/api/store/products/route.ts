import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { createStoreProduct, getAllStoreProducts } from "@/lib/db";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  return NextResponse.json({ products: getAllStoreProducts() });
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    if (!body.nameAr?.trim() && !body.nameEn?.trim()) {
      return NextResponse.json({ error: "اسم المنتج مطلوب" }, { status: 400 });
    }

    const product = createStoreProduct({
      type: body.type === "package" ? "package" : "service",
      nameAr: body.nameAr?.trim() || "",
      nameEn: body.nameEn?.trim() || "",
      slug: body.slug?.trim() || `product-${Date.now()}`,
      category: body.category || "بدون تصنيف",
      price: Number(body.price) || 0,
      compareAtPrice: Number(body.compareAtPrice) || 0,
      descriptionAr: body.descriptionAr || "",
      descriptionEn: body.descriptionEn || "",
      image: body.image || "",
      requiresAppointment: Boolean(body.requiresAppointment),
      allowReviews: Boolean(body.allowReviews),
      linkedServiceIds: body.linkedServiceIds || [],
      linkedDoctorIds: body.linkedDoctorIds || [],
      customizations: body.customizations || [],
      status: body.status || "active",
      stock: Number(body.stock) ?? 999,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
