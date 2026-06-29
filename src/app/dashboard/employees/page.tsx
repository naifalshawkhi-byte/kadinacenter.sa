"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TranslatedPageHeader } from "@/components/dashboard/TranslatedPageHeader";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { Plus, Trash2, Loader2, X, UserPlus, Pencil } from "lucide-react";
import { EditStaffModal, type StaffMember } from "@/components/dashboard/EditStaffModal";

export default function EmployeesPage() {
  const { user, loading: authLoading } = useDashboard();
  const router = useRouter();
  const [employees, setEmployees] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [form, setForm] = useState({ username: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user?.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const load = () => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((d) =>
        setEmployees(
          (d.users || []).filter(
            (u: StaffMember) => u.role === "employee" || u.role === "secretary"
          )
        )
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user?.role === "admin") load();
  }, [user]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, role: "employee" }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setForm({ username: "", password: "", name: "" });
    setShowModal(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("حذف هذا الموظف؟")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    load();
  }

  if (authLoading || user?.role !== "admin") {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div>
      <TranslatedPageHeader titleKey="pages.employees.title" descriptionKey="pages.employees.desc">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" />
          إضافة موظف
        </button>
      </TranslatedPageHeader>

      <p className="mb-4 text-sm text-[var(--muted)] rounded-xl bg-[var(--background)] border border-[var(--border)] px-4 py-3">
        الموظفون المضافون يظهرون في خانة «التعيين» بصفحة الاستفسارات. أي زبون تعيّنه لموظف يظهر له عند تسجيل الدخول.
      </p>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <button type="button" onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-[var(--primary)]" />
                إضافة موظف جديد
              </h3>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">الاسم الكامل *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">اسم المستخدم *</label>
                <input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">كلمة المرور * (6+ أحرف)</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-[var(--primary)] py-3 text-white font-medium disabled:opacity-60"
              >
                {submitting ? "جاري الحفظ..." : "حفظ الموظف"}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-[var(--primary)]" />
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--background)] text-[var(--muted)]">
                <th className="px-4 py-3 text-right">الاسم</th>
                <th className="px-4 py-3 text-right">اسم المستخدم</th>
                <th className="px-4 py-3 text-right">الدور</th>
                <th className="px-4 py-3 text-right">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-[var(--border)] hover:bg-[var(--background)]/50">
                  <td className="px-4 py-3 font-medium">{emp.name}</td>
                  <td className="px-4 py-3">{emp.username}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        emp.role === "admin"
                          ? "bg-[var(--primary-light)] text-[var(--primary)]"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {emp.role === "admin" ? "أدمن" : emp.role === "secretary" ? "سكرتير" : "موظف"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {emp.role !== "admin" && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingStaff(emp)}
                          className="text-[var(--primary)] hover:bg-[var(--primary-light)] p-2 rounded-lg"
                          title="تعديل"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <EditStaffModal
        staff={editingStaff}
        onClose={() => setEditingStaff(null)}
        onSaved={load}
      />
    </div>
  );
}
