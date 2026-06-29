"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Pencil,
  Plus,
  Stethoscope,
  Trash2,
  User,
} from "lucide-react";
import type { DbBranch } from "@/lib/clinic-types";
import type { DbDoctor } from "@/lib/db";
import {
  DataTable,
  FieldLabel,
  ModalForm,
  OutlineIconButton,
  SectionShell,
  StatusBadge,
  TextInput,
  YellowButton,
} from "./clinic-ui";
import { getInitials } from "@/lib/utils";

interface Props {
  onClose: () => void;
  onBack: () => void;
  onChanged?: () => void;
}

const emptyForm = () => ({
  name: "",
  specialty: "",
  branch: "",
  phone: "",
  email: "",
  workingHours: "9:00 AM - 5:00 PM",
  status: "active" as "active" | "inactive",
});

export function DoctorsPanel({ onClose, onBack, onChanged }: Props) {
  const [doctors, setDoctors] = useState<DbDoctor[]>([]);
  const [branches, setBranches] = useState<DbBranch[]>([]);
  const [branchFilter, setBranchFilter] = useState("");
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    Promise.all([
      fetch("/api/doctors").then((r) => r.json()),
      fetch("/api/clinic/branches").then((r) => r.json()),
    ]).then(([doc, br]) => {
      setDoctors(doc.doctors || []);
      setBranches(br.branches || []);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!branchFilter) return doctors;
    return doctors.filter((d) => d.branch === branchFilter);
  }, [doctors, branchFilter]);

  function openAdd() {
    setForm(emptyForm());
    setEditId(null);
    setModal("add");
  }

  function openEdit(d: DbDoctor) {
    setForm({
      name: d.name,
      specialty: d.specialty,
      branch: d.branch,
      phone: d.phone,
      email: d.email || "",
      workingHours: d.workingHours,
      status: d.status,
    });
    setEditId(d.id);
    setModal("edit");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const url = modal === "edit" && editId ? `/api/doctors/${editId}` : "/api/doctors";
    const method = modal === "edit" ? "PATCH" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSubmitting(false);
    setModal(null);
    load();
    onChanged?.();
  }

  async function handleDelete(id: string) {
    if (!confirm("حذف هذا الطبيب؟")) return;
    await fetch(`/api/doctors/${id}`, { method: "DELETE" });
    load();
    onChanged?.();
  }

  return (
    <SectionShell
      title="الأطباء"
      icon={Stethoscope}
      onClose={onClose}
      onBack={onBack}
      action={
        <div className="flex flex-wrap items-center gap-3 w-full justify-between">
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm min-w-[160px]"
          >
            <option value="">جميع الفروع</option>
            {branches.map((b) => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
          <YellowButton onClick={openAdd}>
            <Plus className="h-4 w-4" />
            إضافة طبيب
          </YellowButton>
        </div>
      }
    >
      <DataTable>
        <table className="w-full min-w-[1000px] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--background)] text-[var(--muted)]">
              <th className="px-4 py-3 text-right font-medium w-12"></th>
              <th className="px-4 py-3 text-right font-medium">اسم الطبيب</th>
              <th className="px-4 py-3 text-right font-medium">التخصص</th>
              <th className="px-4 py-3 text-right font-medium">البريد الإلكتروني</th>
              <th className="px-4 py-3 text-right font-medium">الهاتف</th>
              <th className="px-4 py-3 text-right font-medium">الفرع</th>
              <th className="px-4 py-3 text-right font-medium">الحالة</th>
              <th className="px-4 py-3 text-right font-medium">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="border-b border-[var(--border)] hover:bg-[var(--background)]/50">
                <td className="px-4 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary-light)] text-xs font-bold text-[var(--primary)]">
                    {getInitials(d.name)}
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold">{d.name}</td>
                <td className="px-4 py-3 text-[var(--muted)]">{d.specialty}</td>
                <td className="px-4 py-3" dir="ltr">{d.email || "—"}</td>
                <td className="px-4 py-3" dir="ltr">{d.phone || "—"}</td>
                <td className="px-4 py-3">{d.branch || "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge active={d.status === "active"} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <OutlineIconButton onClick={() => {}} title="الجدول">
                      <Calendar className="h-3.5 w-3.5" />
                    </OutlineIconButton>
                    <OutlineIconButton onClick={() => openEdit(d)} title="الملف">
                      <User className="h-3.5 w-3.5" />
                    </OutlineIconButton>
                    <OutlineIconButton onClick={() => openEdit(d)} title="تعديل">
                      <Pencil className="h-3.5 w-3.5" />
                    </OutlineIconButton>
                    <OutlineIconButton onClick={() => handleDelete(d.id)} title="حذف" danger>
                      <Trash2 className="h-3.5 w-3.5" />
                    </OutlineIconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>

      {modal && (
        <ModalForm
          title={modal === "add" ? "إضافة طبيب" : "تعديل طبيب"}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          submitting={submitting}
        >
          <FieldLabel>اسم الطبيب *</FieldLabel>
          <TextInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <FieldLabel>التخصص *</FieldLabel>
          <TextInput value={form.specialty} onChange={(v) => setForm({ ...form, specialty: v })} required />
          <FieldLabel>الفرع</FieldLabel>
          <select
            value={form.branch}
            onChange={(e) => setForm({ ...form, branch: e.target.value })}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm"
          >
            <option value="">اختر الفرع</option>
            {branches.map((b) => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
          <FieldLabel>البريد الإلكتروني</FieldLabel>
          <TextInput value={form.email} onChange={(v) => setForm({ ...form, email: v })} dir="ltr" />
          <FieldLabel>الهاتف</FieldLabel>
          <TextInput value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} dir="ltr" />
          <FieldLabel>ساعات العمل</FieldLabel>
          <TextInput value={form.workingHours} onChange={(v) => setForm({ ...form, workingHours: v })} dir="ltr" />
        </ModalForm>
      )}
    </SectionShell>
  );
}
