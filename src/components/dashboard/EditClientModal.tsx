"use client";

import { useEffect, useState } from "react";
import { X, Loader2, ChevronDown } from "lucide-react";

export interface ClientProfile {
  name: string;
  gender: string;
  age: string;
  address: string;
  email: string;
  phone: string;
  phoneExtra1: string;
  phoneExtra2: string;
  phoneExtra3: string;
  preferredPhone: "primary" | "extra1" | "extra2" | "extra3";
  notes: string;
}

interface Props {
  open: boolean;
  inquiryId: string | null;
  client: ClientProfile | null;
  onClose: () => void;
  onSaved?: () => void;
}

function PhoneField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:border-slate-400 bg-white">
        <span className="flex items-center gap-1 bg-slate-50 px-3 border-l border-slate-200 text-sm shrink-0">
          🇸🇦
          <ChevronDown className="h-3 w-3 text-slate-400" />
        </span>
        <input
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "أدخل رقم الهاتف"}
          dir="ltr"
          className="flex-1 px-4 py-2.5 text-sm outline-none text-left"
        />
      </div>
    </div>
  );
}

export function EditClientModal({ open, inquiryId, client, onClose, onSaved }: Props) {
  const [form, setForm] = useState<ClientProfile>({
    name: "",
    gender: "",
    age: "",
    address: "",
    email: "",
    phone: "",
    phoneExtra1: "",
    phoneExtra2: "",
    phoneExtra3: "",
    preferredPhone: "primary",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && client) setForm({ ...client });
  }, [open, client]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function handleSave() {
    if (!inquiryId) return;
    setSaving(true);
    const res = await fetch(`/api/appointments/${inquiryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "client", ...form }),
    });
    setSaving(false);
    if (res.ok) {
      onSaved?.();
      onClose();
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div
        className="relative w-full max-w-[420px] max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 pt-10">
          <h2 className="text-lg font-bold text-slate-900 mb-6 text-right">تعديل بيانات العميل</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">الاسم</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">النوع</label>
                <div className="relative">
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white outline-none"
                  >
                    <option value="">—</option>
                    <option value="أنثى">أنثى</option>
                    <option value="ذكر">ذكر</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">العمر</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">العنوان</label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
              />
            </div>

            <PhoneField
              label="الهاتف الرئيسي"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
            />

            <PhoneField
              label="هاتف إضافي 1"
              value={form.phoneExtra1}
              onChange={(v) => setForm({ ...form, phoneExtra1: v })}
            />

            <PhoneField
              label="هاتف إضافي 2"
              value={form.phoneExtra2}
              onChange={(v) => setForm({ ...form, phoneExtra2: v })}
            />

            <PhoneField
              label="هاتف إضافي 3"
              value={form.phoneExtra3}
              onChange={(v) => setForm({ ...form, phoneExtra3: v })}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">الهاتف المفضل</label>
              <div className="relative">
                <select
                  value={form.preferredPhone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      preferredPhone: e.target.value as ClientProfile["preferredPhone"],
                    })
                  }
                  className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white outline-none"
                >
                  <option value="primary">الهاتف الرئيسي</option>
                  <option value="extra1">هاتف إضافي 1</option>
                  <option value="extra2">هاتف إضافي 2</option>
                  <option value="extra3">هاتف إضافي 3</option>
                </select>
                <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">ملاحظات</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm resize-none outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-xl bg-amber-400 py-3 text-sm font-semibold text-slate-900 hover:bg-amber-500 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "حفظ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
