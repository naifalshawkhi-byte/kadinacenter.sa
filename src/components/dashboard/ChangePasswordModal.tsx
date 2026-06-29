"use client";

import { useState } from "react";
import { X, KeyRound, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ open, onClose }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  function reset() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (newPassword !== confirmPassword) {
      setError("كلمة المرور الجديدة غير متطابقة");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "حدث خطأ");
      return;
    }
    setSuccess(true);
    setTimeout(handleClose, 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-[var(--card)] shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <button type="button" onClick={handleClose} className="p-2 rounded-lg hover:bg-[var(--background)]">
            <X className="h-5 w-5" />
          </button>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-[var(--primary)]" />
            تغيير كلمة المرور
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          {success && (
            <p className="text-emerald-700 text-sm bg-emerald-50 px-3 py-2 rounded-lg">
              تم تغيير كلمة المرور بنجاح
            </p>
          )}
          <div>
            <label className="text-sm text-[var(--muted)] mb-1 block">كلمة المرور الحالية *</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm bg-[var(--card)]"
            />
          </div>
          <div>
            <label className="text-sm text-[var(--muted)] mb-1 block">كلمة المرور الجديدة * (8+ أحرف)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm bg-[var(--card)]"
            />
          </div>
          <div>
            <label className="text-sm text-[var(--muted)] mb-1 block">تأكيد كلمة المرور *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm bg-[var(--card)]"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[var(--primary)] py-3 text-white font-medium disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            حفظ
          </button>
        </form>
      </div>
    </div>
  );
}
