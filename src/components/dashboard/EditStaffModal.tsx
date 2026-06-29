"use client";

import { useEffect, useState } from "react";
import { X, Pencil, Loader2 } from "lucide-react";

export interface StaffMember {
  id: string;
  username: string;
  name: string;
  role: string;
  linkedDoctorId?: string;
}

interface Props {
  staff: StaffMember | null;
  onClose: () => void;
  onSaved: () => void;
  showDoctorField?: boolean;
  doctors?: { id: string; name: string }[];
}

export function EditStaffModal({
  staff,
  onClose,
  onSaved,
  showDoctorField,
  doctors = [],
}: Props) {
  const [form, setForm] = useState({ name: "", username: "", password: "", linkedDoctorId: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (staff) {
      setForm({
        name: staff.name,
        username: staff.username,
        password: "",
        linkedDoctorId: staff.linkedDoctorId || "",
      });
      setError("");
    }
  }, [staff]);

  if (!staff) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const body: Record<string, string> = {
      name: form.name,
      username: form.username,
    };
    if (form.password.trim()) body.password = form.password;
    if (showDoctorField) body.linkedDoctorId = form.linkedDoctorId;

    const res = await fetch(`/api/users/${staff!.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "حدث خطأ");
      return;
    }
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-[var(--card)] shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--background)]">
            <X className="h-5 w-5" />
          </button>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Pencil className="h-5 w-5 text-[var(--primary)]" />
            تعديل {staff.role === "secretary" ? "السكرتير" : "الموظف"}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <label className="text-sm text-[var(--muted)] mb-1 block">الاسم الكامل *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm bg-[var(--card)]"
            />
          </div>
          <div>
            <label className="text-sm text-[var(--muted)] mb-1 block">اسم المستخدم *</label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm bg-[var(--card)]"
            />
          </div>
          {showDoctorField && (
            <div>
              <label className="text-sm text-[var(--muted)] mb-1 block">الطبيب المرتبط</label>
              <select
                value={form.linkedDoctorId}
                onChange={(e) => setForm({ ...form, linkedDoctorId: e.target.value })}
                className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm bg-[var(--card)]"
              >
                <option value="">— بدون —</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="text-sm text-[var(--muted)] mb-1 block">
              كلمة مرور جديدة (اتركها فارغة إن لم تُرد التغيير)
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              minLength={8}
              placeholder="8+ أحرف"
              className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm bg-[var(--card)]"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[var(--primary)] py-3 text-white font-medium disabled:opacity-60"
          >
            {submitting ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
        </form>
      </div>
    </div>
  );
}
