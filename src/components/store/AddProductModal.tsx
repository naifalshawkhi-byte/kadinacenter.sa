"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  Stethoscope,
  Package,
  ImageIcon,
  Box,
  CreditCard,
  Sparkles,
  Users,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";
import type {
  ProductCustomization,
  StoreProductType,
  CustomizationValue,
} from "@/lib/store-types";
import { STORE_CATEGORIES } from "@/lib/store-types";
import type { DbService } from "@/lib/clinic-types";
import type { DbDoctor } from "@/lib/db";
import { SarAmount } from "@/components/ui/SarAmount";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  type: StoreProductType;
  onClose: () => void;
  onSaved: () => void;
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const emptyCustomization = (): ProductCustomization => ({
  id: uid(),
  nameAr: "",
  nameEn: "",
  type: "single",
  required: false,
  values: [{ id: uid(), nameAr: "", nameEn: "", price: 0, isDefault: true }],
});

export function AddProductModal({ open, type, onClose, onSaved }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [clinicServices, setClinicServices] = useState<DbService[]>([]);
  const [doctors, setDoctors] = useState<DbDoctor[]>([]);

  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("بدون تصنيف");
  const [price, setPrice] = useState("0");
  const [compareAtPrice, setCompareAtPrice] = useState("0");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [image, setImage] = useState("");
  const [requiresAppointment, setRequiresAppointment] = useState(true);
  const [allowReviews, setAllowReviews] = useState(false);
  const [linkedServiceIds, setLinkedServiceIds] = useState<string[]>([]);
  const [linkedDoctorIds, setLinkedDoctorIds] = useState<string[]>([]);
  const [customizations, setCustomizations] = useState<ProductCustomization[]>([]);

  const loadMeta = useCallback(async () => {
    const [svcRes, docRes] = await Promise.all([
      fetch("/api/clinic/services"),
      fetch("/api/doctors"),
    ]);
    if (svcRes.ok) {
      const d = await svcRes.json();
      setClinicServices(d.services || []);
    }
    if (docRes.ok) {
      const d = await docRes.json();
      setDoctors(d.doctors || []);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    loadMeta();
    setNameAr("");
    setNameEn("");
    setSlug("");
    setCategory("بدون تصنيف");
    setPrice("0");
    setCompareAtPrice("0");
    setDescriptionAr("");
    setDescriptionEn("");
    setImage("");
    setRequiresAppointment(true);
    setAllowReviews(false);
    setLinkedServiceIds([]);
    setLinkedDoctorIds([]);
    setCustomizations([]);
  }, [open, type, loadMeta]);

  const filteredDoctors = useMemo(() => {
    if (!linkedServiceIds.length) return [];
    const branches = clinicServices
      .filter((s) => linkedServiceIds.includes(s.id))
      .map((s) => s.branch)
      .filter(Boolean);
    if (!branches.length) return doctors;
    return doctors.filter((d) => !d.branch || branches.includes(d.branch));
  }, [doctors, clinicServices, linkedServiceIds]);

  function toggleService(id: string) {
    setLinkedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleDoctor(id: string) {
    setLinkedDoctorIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleImage(file: File) {
    if (!file.type.startsWith("image/") || file.size > 800_000) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/store/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        nameAr,
        nameEn,
        slug: slug || nameEn.toLowerCase().replace(/\s+/g, "-") || `item-${Date.now()}`,
        category,
        price: Number(price) || 0,
        compareAtPrice: Number(compareAtPrice) || 0,
        descriptionAr,
        descriptionEn,
        image,
        requiresAppointment,
        allowReviews,
        linkedServiceIds,
        linkedDoctorIds,
        customizations,
        status: "active",
      }),
    });
    setSaving(false);
    if (res.ok) {
      onSaved();
      onClose();
    }
  }

  if (!open) return null;

  const isService = type === "service";
  const TypeIcon = isService ? Stethoscope : Package;
  const accent = isService ? "sky" : "violet";
  void accent;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--background)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-6 py-4 shrink-0">
        <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-[var(--background)]">
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", isService ? "bg-sky-100 text-sky-600" : "bg-violet-100 text-violet-600")}>
            <TypeIcon className="h-5 w-5" />
          </div>
          <div className="text-right">
            <p className="font-bold">إضافة منتج</p>
            <p className="text-xs text-[var(--muted)]">{isService ? "خدمة" : "باقة"}</p>
          </div>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-6 space-y-6">
          {/* صورة */}
          <div className="flex justify-end">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); e.target.value = ""; }} />
            <button type="button" onClick={() => fileRef.current?.click()} className="h-24 w-24 rounded-xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center text-[var(--muted)] hover:bg-[var(--card)] overflow-hidden">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="" className="h-full w-full object-cover" />
              ) : (
                <>
                  <ImageIcon className="h-6 w-6 mb-1" />
                  <span className="text-[10px]">Click to select</span>
                </>
              )}
            </button>
          </div>

          {/* الأسماء */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[var(--muted)] mb-1.5 block">الاسم (AR)</label>
              <input value={nameAr} onChange={(e) => setNameAr(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)]" />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--muted)] mb-1.5 block">الاسم (EN)</label>
              <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} dir="ltr" className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)]" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-[var(--muted)] mb-1.5 block">المعرف (Slug)</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} dir="ltr" className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)]" />
            </div>
          </div>

          {/* التصنيف */}
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Box className="h-4 w-4 text-[var(--primary)]" />
              التصنيف
            </h3>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm">
              {STORE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* التسعير */}
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 text-[var(--primary)]" />
              التسعير
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 rounded-xl border border-[var(--border)] p-4">
              <div>
                <label className="text-sm text-[var(--muted)] mb-1.5 block">السعر (ر.س)</label>
                <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden" dir="ltr">
                  <span className="px-3 text-sm font-bold text-[var(--primary)] border-l border-[var(--border)]">&#x20C1;</span>
                  <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="0" step="0.01" className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent" />
                  <span className="px-2 text-xs text-[var(--muted)]">ر.س</span>
                </div>
              </div>
              <div>
                <label className="text-sm text-[var(--muted)] mb-1.5 block">السعر قبل الخصم</label>
                <div className="flex items-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] overflow-hidden" dir="ltr">
                  <span className="px-3 text-sm font-bold text-[var(--muted)] border-l border-[var(--border)]">&#x20C1;</span>
                  <input value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} type="number" min="0" step="0.01" className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent" />
                  <span className="px-2 text-xs text-[var(--muted)]">ر.س</span>
                </div>
              </div>
            </div>
          </div>

          {/* الوصف */}
          <div>
            <h3 className="font-semibold mb-3">الوصف</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <textarea value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} placeholder="الوصف (AR)..." rows={4} className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm resize-y outline-none focus:border-[var(--primary)]" />
              <textarea value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} placeholder="Description (EN)..." rows={4} dir="ltr" className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm resize-y outline-none focus:border-[var(--primary)]" />
            </div>
          </div>

          {/* حجز موعد */}
          <div className="flex items-center justify-between rounded-xl border border-[var(--border)] p-4">
            <div className="flex items-center gap-3">
              <Stethoscope className="h-5 w-5 text-[var(--primary)]" />
              <div>
                <p className="font-medium">يتطلب حجز موعد</p>
                <p className="text-xs text-[var(--muted)]">عند التفعيل، سيُطلب من العميل اختيار طبيب وموعد</p>
              </div>
            </div>
            <button type="button" onClick={() => setRequiresAppointment((v) => !v)} className={cn("relative h-6 w-11 rounded-full transition-colors", requiresAppointment ? "bg-[var(--primary)]" : "bg-slate-300")}>
              <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", requiresAppointment ? "right-0.5" : "right-5")} />
            </button>
          </div>

          {/* التقييمات */}
          <div className="flex items-center justify-between rounded-xl border border-[var(--border)] p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <div>
                <p className="font-medium">السماح بالتقييمات</p>
                <p className="text-xs text-[var(--muted)]">يظهر قسم التقييمات في صفحة المنتج، ويستطيع التقييم فقط من اشترى المنتج</p>
              </div>
            </div>
            <button type="button" onClick={() => setAllowReviews((v) => !v)} className={cn("relative h-6 w-11 rounded-full transition-colors", allowReviews ? "bg-[var(--primary)]" : "bg-slate-300")}>
              <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", allowReviews ? "right-0.5" : "right-5")} />
            </button>
          </div>

          {/* ربط الخدمات */}
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-amber-500" />
              ربط الخدمات
              {linkedServiceIds.length > 0 && (
                <span className="text-xs bg-sky-100 text-sky-700 rounded-full px-2 py-0.5">
                  {linkedServiceIds.length === 1 ? "خدمة واحدة" : `${linkedServiceIds.length} خدمات`}
                </span>
              )}
            </h3>
            <div className="grid sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto rounded-xl border border-[var(--border)] p-3">
              {clinicServices.map((s) => {
                const selected = linkedServiceIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleService(s.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 text-right text-sm transition-colors",
                      selected ? "border-sky-400 bg-sky-50/80" : "border-[var(--border)] hover:bg-[var(--background)]"
                    )}
                  >
                    <span className={cn("h-4 w-4 rounded-full border-2 shrink-0", selected ? "border-sky-600 bg-sky-600" : "border-slate-300")} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{s.name}</p>
                      <p className="text-xs text-[var(--muted)]">{s.duration} دقيقة • <SarAmount amount={s.price} size="sm" /></p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ربط الأطباء */}
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-[var(--primary)]" />
              ربط الأطباء (اختياري)
            </h3>
            {linkedServiceIds.length === 0 ? (
              <div className="rounded-xl bg-[var(--background)] border border-[var(--border)] p-6 text-center text-sm text-[var(--muted)]">
                اختر الخدمات أولاً لعرض الأطباء المرتبطين بها
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2">
                {filteredDoctors.map((d) => {
                  const selected = linkedDoctorIds.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => toggleDoctor(d.id)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border p-3 text-right text-sm",
                        selected ? "border-[var(--primary)] bg-[var(--primary-light)]" : "border-[var(--border)]"
                      )}
                    >
                      <span className={cn("h-4 w-4 rounded-full border-2", selected ? "border-[var(--primary)] bg-[var(--primary)]" : "border-slate-300")} />
                      <div>
                        <p className="font-medium">{d.name}</p>
                        <p className="text-xs text-[var(--muted)]">{d.specialty}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* التخصيصات */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">
                {isService ? "إضافات وتخصيصات الخدمة" : "تخصيصات الباقة"}
                <span className="text-xs text-[var(--muted)] font-normal mr-2">اختياري</span>
              </h3>
            </div>
            <p className="text-xs text-[var(--muted)] mb-4">
              أضف تخصيصات مثل المدة أو الغرفة أو إضافات تكميلية. كل قيمة يمكن أن تضاف إلى سعر الخدمة.
            </p>
            {customizations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)] mb-3">
                لا توجد خيارات بعد
              </div>
            ) : (
              <div className="space-y-4 mb-3">
                {customizations.map((cust, ci) => (
                  <CustomizationBlock
                    key={cust.id}
                    cust={cust}
                    onChange={(updated) =>
                      setCustomizations((prev) => prev.map((c, i) => (i === ci ? updated : c)))
                    }
                    onDelete={() => setCustomizations((prev) => prev.filter((_, i) => i !== ci))}
                  />
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setCustomizations((prev) => [...prev, emptyCustomization()])}
              className="w-full rounded-xl border border-dashed border-[var(--border)] py-3 text-sm font-medium hover:bg-[var(--background)] flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              إضافة خيار
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--border)] bg-[var(--card)] px-6 py-4 flex items-center gap-3 shrink-0">
        <button type="button" onClick={handleSave} disabled={saving} className="rounded-xl bg-amber-400 px-8 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-500 disabled:opacity-60">
          {saving ? "جاري الحفظ..." : "حفظ"}
        </button>
        <button type="button" onClick={onClose} className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
          إلغاء
        </button>
      </div>
    </div>
  );
}

function CustomizationBlock({
  cust,
  onChange,
  onDelete,
}: {
  cust: ProductCustomization;
  onChange: (c: ProductCustomization) => void;
  onDelete: () => void;
}) {
  function updateValue(vi: number, patch: Partial<CustomizationValue>) {
    onChange({
      ...cust,
      values: cust.values.map((v, i) => (i === vi ? { ...v, ...patch } : v)),
    });
  }

  return (
    <div className="rounded-xl border border-[var(--border)] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <button type="button" onClick={onDelete} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg">
          <Trash2 className="h-4 w-4" />
        </button>
        <GripVertical className="h-4 w-4 text-[var(--muted)]" />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <input value={cust.nameAr} onChange={(e) => onChange({ ...cust, nameAr: e.target.value })} placeholder="الاسم (عربي)" className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm" />
        <input value={cust.nameEn} onChange={(e) => onChange({ ...cust, nameEn: e.target.value })} placeholder="e.g. Duration" dir="ltr" className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm" />
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        <select value={cust.type} onChange={(e) => onChange({ ...cust, type: e.target.value as "single" | "multiple" })} className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm">
          <option value="single">اختيار واحد (راديو)</option>
          <option value="multiple">اختيار متعدد</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={cust.required} onChange={(e) => onChange({ ...cust, required: e.target.checked })} className="accent-[var(--primary)]" />
          مطلوب
        </label>
      </div>
      <p className="text-sm font-medium">القيم</p>
      {cust.values.map((v, vi) => (
        <div key={v.id} className="flex flex-wrap items-center gap-2">
          <input value={v.nameAr} onChange={(e) => updateValue(vi, { nameAr: e.target.value })} placeholder="بالعربية" className="flex-1 min-w-[100px] rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm" />
          <input value={v.nameEn} onChange={(e) => updateValue(vi, { nameEn: e.target.value })} placeholder="English" dir="ltr" className="flex-1 min-w-[100px] rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm" />
          <div className="flex items-center rounded-lg border border-[var(--border)] overflow-hidden" dir="ltr">
            <input value={v.price} onChange={(e) => updateValue(vi, { price: Number(e.target.value) || 0 })} type="number" className="w-16 px-2 py-1.5 text-sm outline-none" />
            <span className="px-2 text-xs text-[var(--muted)] border-r border-[var(--border)]">ر.س</span>
          </div>
          <label className="flex items-center gap-1 text-xs whitespace-nowrap">
            <input type="radio" name={`default-${cust.id}`} checked={v.isDefault} onChange={() => onChange({ ...cust, values: cust.values.map((val, i) => ({ ...val, isDefault: i === vi })) })} />
            افتراضي
          </label>
          <button type="button" onClick={() => onChange({ ...cust, values: cust.values.filter((_, i) => i !== vi) })} className="text-red-400 p-1">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...cust, values: [...cust.values, { id: uid(), nameAr: "", nameEn: "", price: 0, isDefault: false }] })}
        className="text-sm text-[var(--primary)] flex items-center gap-1"
      >
        <Plus className="h-3.5 w-3.5" />
        إضافة قيمة
      </button>
    </div>
  );
}
