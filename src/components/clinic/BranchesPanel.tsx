"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import type { DbBranch } from "@/lib/clinic-types";
import { DAY_KEYS, DAY_LABELS, DEFAULT_WORKING_HOURS } from "@/lib/clinic-types";
import {
  DataTable,
  FieldLabel,
  ModalForm,
  OutlineIconButton,
  ReadyBadge,
  SectionShell,
  StatusBadge,
  TextInput,
  YellowButton,
  formatWorkingHoursPreview,
} from "./clinic-ui";

interface Props {
  onClose: () => void;
  onBack: () => void;
  onChanged?: () => void;
}

const emptyForm = (): Omit<DbBranch, "id" | "createdAt"> => ({
  name: "",
  address: "",
  phone: "",
  email: "",
  workingHours: { ...DEFAULT_WORKING_HOURS },
  status: "active",
});

export function BranchesPanel({ onClose, onBack, onChanged }: Props) {
  const [branches, setBranches] = useState<DbBranch[]>([]);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    fetch("/api/clinic/branches")
      .then((r) => r.json())
      .then((d) => setBranches(d.branches || []));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openAdd() {
    setForm(emptyForm());
    setEditId(null);
    setModal("add");
  }

  function openEdit(b: DbBranch) {
    setForm({
      name: b.name,
      address: b.address,
      phone: b.phone,
      email: b.email,
      workingHours: { ...b.workingHours },
      status: b.status,
    });
    setEditId(b.id);
    setModal("edit");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const url = modal === "edit" && editId ? `/api/clinic/branches/${editId}` : "/api/clinic/branches";
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
    if (!confirm("حذف هذا الفرع؟")) return;
    await fetch(`/api/clinic/branches/${id}`, { method: "DELETE" });
    load();
    onChanged?.();
  }

  return (
    <SectionShell
      title="الفروع"
      icon={Building2}
      onClose={onClose}
      onBack={onBack}
      action={
        <YellowButton onClick={openAdd}>
          <Plus className="h-4 w-4" />
          إضافة فرع
        </YellowButton>
      }
    >
      <DataTable>
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--background)] text-[var(--muted)]">
              <th className="px-4 py-3 text-right font-medium">اسم الفرع</th>
              <th className="px-4 py-3 text-right font-medium">العنوان</th>
              <th className="px-4 py-3 text-right font-medium">الهاتف</th>
              <th className="px-4 py-3 text-right font-medium">البريد الإلكتروني</th>
              <th className="px-4 py-3 text-right font-medium">ساعات العمل</th>
              <th className="px-4 py-3 text-right font-medium">الحالة</th>
              <th className="px-4 py-3 text-right font-medium">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((b) => (
              <tr key={b.id} className="border-b border-[var(--border)] hover:bg-[var(--background)]/50">
                <td className="px-4 py-3 font-medium">{b.name}</td>
                <td className="px-4 py-3 text-[var(--muted)] max-w-[200px]">{b.address || "—"}</td>
                <td className="px-4 py-3" dir="ltr">{b.phone || "—"}</td>
                <td className="px-4 py-3" dir="ltr">{b.email || "—"}</td>
                <td className="px-4 py-3 text-xs text-[var(--muted)] max-w-[220px]">
                  {formatWorkingHoursPreview(b.workingHours)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge active={b.status === "active"} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <OutlineIconButton onClick={() => openEdit(b)} title="تعديل">
                      <Pencil className="h-3.5 w-3.5" />
                    </OutlineIconButton>
                    <OutlineIconButton onClick={() => handleDelete(b.id)} title="حذف" danger>
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
          title={modal === "add" ? "إضافة فرع" : "تعديل فرع"}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          submitting={submitting}
        >
          <FieldLabel>اسم الفرع *</FieldLabel>
          <TextInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <FieldLabel>العنوان</FieldLabel>
          <TextInput value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
          <FieldLabel>الهاتف</FieldLabel>
          <TextInput value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} dir="ltr" />
          <FieldLabel>البريد الإلكتروني</FieldLabel>
          <TextInput value={form.email} onChange={(v) => setForm({ ...form, email: v })} dir="ltr" />
          <p className="text-sm font-medium pt-2">ساعات العمل</p>
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
        </ModalForm>
      )}
    </SectionShell>
  );
}
