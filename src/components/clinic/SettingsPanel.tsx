"use client";

import { useEffect, useRef, useState } from "react";
import { Settings, X, Upload, ImageIcon } from "lucide-react";
import type { ClinicSettings } from "@/lib/clinic-types";
import { DAY_KEYS, DAY_LABELS } from "@/lib/clinic-types";
import { useClinicBranding } from "@/components/providers/ClinicBrandingProvider";
import {
  FieldLabel,
  SectionShell,
  TextArea,
  TextInput,
  YellowButton,
} from "./clinic-ui";

interface Props {
  onClose: () => void;
  onBack: () => void;
}

export function SettingsPanel({ onClose, onBack }: Props) {
  const { refresh } = useClinicBranding();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ClinicSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/clinic/settings")
      .then((r) => r.json())
      .then((d) => setForm(d.settings));
  }, []);

  function handleLogoFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 800_000) {
      alert("حجم الصورة كبير جداً. الحد الأقصى 800KB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setForm((f) => (f ? { ...f, logo: result } : f));
    };
    reader.readAsDataURL(file);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/clinic/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setSaved(true);
      if (data.settings) {
        setForm(data.settings);
      }
      refresh();
    }
  }

  if (!form) {
    return (
      <SectionShell title="الإعدادات" icon={Settings} onClose={onClose} onBack={onBack}>
        <p className="text-center text-[var(--muted)] py-12">جاري التحميل...</p>
      </SectionShell>
    );
  }

  const logoInitial = form.name?.trim()?.charAt(0) || "ر";

  return (
    <SectionShell title="الإعدادات" icon={Settings} onClose={onClose} onBack={onBack}>
      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>الاسم</FieldLabel>
            <TextInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          </div>
          <div>
            <FieldLabel>الشعار / العبارة</FieldLabel>
            <TextInput value={form.tagline} onChange={(v) => setForm({ ...form, tagline: v })} />
          </div>
          <div>
            <FieldLabel>معرف العيادة</FieldLabel>
            <TextInput value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} dir="ltr" />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel>الوصف</FieldLabel>
            <TextArea value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={4} />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel>شعار العيادة</FieldLabel>
            <div className="flex flex-wrap items-start gap-4">
              <div className="relative h-20 w-20 rounded-xl bg-[var(--primary)] flex items-center justify-center text-2xl font-bold text-white border border-[var(--border)] overflow-hidden shrink-0">
                {form.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.logo} alt="logo" className="h-full w-full object-cover" />
                ) : (
                  logoInitial
                )}
                {form.logo && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, logo: "" })}
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <div className="flex-1 min-w-[200px] space-y-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleLogoFile(f);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 rounded-xl border border-dashed border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)] hover:bg-[var(--background)] w-full"
                >
                  <Upload className="h-4 w-4" />
                  اضغط لرفع صورة الشعار
                </button>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-[var(--muted)] shrink-0" />
                  <TextInput
                    value={form.logo.startsWith("data:") ? "" : form.logo}
                    onChange={(v) => setForm({ ...form, logo: v })}
                    placeholder="أو أدخل رابط الشعار (URL)"
                    dir="ltr"
                  />
                </div>
                <p className="text-xs text-[var(--muted)]">
                  يظهر الشعار في القائمة الجانبية مباشرة بعد الحفظ
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold mb-4">معلومات الاتصال</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>هاتف التواصل</FieldLabel>
              <TextInput value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} dir="ltr" />
            </div>
            <div>
              <FieldLabel>البريد الإلكتروني</FieldLabel>
              <TextInput value={form.email} onChange={(v) => setForm({ ...form, email: v })} dir="ltr" />
            </div>
            <div>
              <FieldLabel>رابط الموقع</FieldLabel>
              <TextInput value={form.website} onChange={(v) => setForm({ ...form, website: v })} dir="ltr" />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>العنوان</FieldLabel>
              <TextArea value={form.address} onChange={(v) => setForm({ ...form, address: v })} rows={2} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold mb-4">ساعات العمل</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DAY_KEYS.map((day) => (
              <div key={day}>
                <FieldLabel>{DAY_LABELS[day]}</FieldLabel>
                <TextInput
                  value={form.workingHours[day] || ""}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      workingHours: { ...form.workingHours, [day]: v },
                    })
                  }
                  dir="ltr"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold mb-4">وسائل التواصل الاجتماعي</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["facebook", "Facebook"],
                ["instagram", "Instagram"],
                ["twitter", "Twitter"],
                ["linkedin", "LinkedIn"],
                ["youtube", "YouTube"],
                ["tiktok", "TikTok"],
                ["snapchat", "Snapchat"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <FieldLabel>{label}</FieldLabel>
                <TextInput
                  value={form.social[key]}
                  onChange={(v) =>
                    setForm({ ...form, social: { ...form.social, [key]: v } })
                  }
                  dir="ltr"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <YellowButton type="submit" disabled={saving} className="min-w-[120px]">
            {saving ? "جاري الحفظ..." : "حفظ"}
          </YellowButton>
          {saved && <span className="text-sm text-emerald-600">تم الحفظ — تم تحديث الشعار والاسم</span>}
        </div>
      </form>
    </SectionShell>
  );
}
