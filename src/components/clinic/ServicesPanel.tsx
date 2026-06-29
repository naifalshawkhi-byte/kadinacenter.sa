"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Briefcase, Pencil, Plus, SlidersHorizontal, Trash2, Users } from "lucide-react";
import type { DbBranch, DbService } from "@/lib/clinic-types";
import { SarAmount } from "@/components/ui/SarAmount";
import {
  DataTable,
  FieldLabel,
  ModalForm,
  OutlineIconButton,
  SectionShell,
  StatusBadge,
  TextArea,
  TextInput,
  YellowButton,
} from "./clinic-ui";

interface Props {
  onClose: () => void;
  onBack: () => void;
  onChanged?: () => void;
}

const emptyForm = (): Omit<DbService, "id" | "createdAt"> => ({
  name: "",
  description: "",
  duration: 30,
  price: 0,
  branch: "",
  status: "active",
});

export function ServicesPanel({ onClose, onBack, onChanged }: Props) {
  const [services, setServices] = useState<DbService[]>([]);
  const [branches, setBranches] = useState<DbBranch[]>([]);
  const [branchFilter, setBranchFilter] = useState("");
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    Promise.all([
      fetch("/api/clinic/services").then((r) => r.json()),
      fetch("/api/clinic/branches").then((r) => r.json()),
    ]).then(([svc, br]) => {
      setServices(svc.services || []);
      setBranches(br.branches || []);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!branchFilter) return services;
    return services.filter((s) => !s.branch || s.branch === branchFilter);
  }, [services, branchFilter]);

  function openAdd() {
    setForm(emptyForm());
    setEditId(null);
    setModal("add");
  }

  function openEdit(s: DbService) {
    setForm({
      name: s.name,
      description: s.description,
      duration: s.duration,
      price: s.price,
      branch: s.branch,
      status: s.status,
    });
    setEditId(s.id);
    setModal("edit");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const url = modal === "edit" && editId ? `/api/clinic/services/${editId}` : "/api/clinic/services";
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
    if (!confirm("حذف هذه الخدمة؟")) return;
    await fetch(`/api/clinic/services/${id}`, { method: "DELETE" });
    load();
    onChanged?.();
  }

  return (
    <SectionShell
      title="الخدمات"
      icon={Briefcase}
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
            إضافة خدمة
          </YellowButton>
        </div>
      }
    >
      <DataTable>
        <table className="w-full min-w-[1000px] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--background)] text-[var(--muted)]">
              <th className="px-4 py-3 text-right font-medium">اسم الخدمة</th>
              <th className="px-4 py-3 text-right font-medium">الوصف</th>
              <th className="px-4 py-3 text-right font-medium">المدة (بالدقائق)</th>
              <th className="px-4 py-3 text-right font-medium">السعر</th>
              <th className="px-4 py-3 text-right font-medium">الفرع</th>
              <th className="px-4 py-3 text-right font-medium">الحالة</th>
              <th className="px-4 py-3 text-right font-medium">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-[var(--border)] hover:bg-[var(--background)]/50">
                <td className="px-4 py-3 font-semibold">{s.name}</td>
                <td className="px-4 py-3 text-[var(--muted)] max-w-[200px] truncate">{s.description || "—"}</td>
                <td className="px-4 py-3">{s.duration}</td>
                <td className="px-4 py-3"><SarAmount amount={s.price} /></td>
                <td className="px-4 py-3">{s.branch || "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge active={s.status === "active"} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <OutlineIconButton onClick={() => {}} title="إعدادات">
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                    </OutlineIconButton>
                    <OutlineIconButton onClick={() => {}} title="الموظفين">
                      <Users className="h-3.5 w-3.5" />
                    </OutlineIconButton>
                    <OutlineIconButton onClick={() => openEdit(s)} title="تعديل">
                      <Pencil className="h-3.5 w-3.5" />
                    </OutlineIconButton>
                    <OutlineIconButton onClick={() => handleDelete(s.id)} title="حذف" danger>
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
          title={modal === "add" ? "إضافة خدمة" : "تعديل خدمة"}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          submitting={submitting}
        >
          <FieldLabel>اسم الخدمة *</FieldLabel>
          <TextInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <FieldLabel>الوصف</FieldLabel>
          <TextArea value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>المدة (دقائق)</FieldLabel>
              <TextInput
                value={String(form.duration)}
                onChange={(v) => setForm({ ...form, duration: Number(v) || 0 })}
                dir="ltr"
              />
            </div>
            <div>
              <FieldLabel>السعر</FieldLabel>
              <TextInput
                value={String(form.price)}
                onChange={(v) => setForm({ ...form, price: Number(v) || 0 })}
                dir="ltr"
              />
            </div>
          </div>
          <FieldLabel>الفرع</FieldLabel>
          <select
            value={form.branch}
            onChange={(e) => setForm({ ...form, branch: e.target.value })}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm"
          >
            <option value="">جميع الفروع</option>
            {branches.map((b) => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
        </ModalForm>
      )}
    </SectionShell>
  );
}
