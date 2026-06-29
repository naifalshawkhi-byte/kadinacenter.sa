"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Target, Trash2 } from "lucide-react";
import type { DbCustomerSource } from "@/lib/clinic-types";
import {
  DataTable,
  FieldLabel,
  ModalForm,
  OutlineIconButton,
  SectionShell,
  StatusBadge,
  TextInput,
  TypeBadge,
  YellowButton,
} from "./clinic-ui";

interface Props {
  onClose: () => void;
  onBack: () => void;
  onChanged?: () => void;
}

export function SourcesPanel({ onClose, onBack, onChanged }: Props) {
  const [sources, setSources] = useState<DbCustomerSource[]>([]);
  const [tab, setTab] = useState<"manual" | "utm">("manual");
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    fetch("/api/clinic/sources")
      .then((r) => r.json())
      .then((d) => setSources(d.sources || []));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openAdd() {
    setForm({ name: "", description: "" });
    setEditId(null);
    setModal("add");
  }

  function openEdit(s: DbCustomerSource) {
    setForm({ name: s.name, description: s.description });
    setEditId(s.id);
    setModal("edit");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const url = modal === "edit" && editId ? `/api/clinic/sources/${editId}` : "/api/clinic/sources";
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
    if (!confirm("حذف هذا المصدر؟")) return;
    await fetch(`/api/clinic/sources/${id}`, { method: "DELETE" });
    load();
    onChanged?.();
  }

  const manualSources = sources;

  return (
    <SectionShell
      title="مصادر العملاء"
      icon={Target}
      onClose={onClose}
      onBack={onBack}
      action={
        <div className="flex flex-wrap items-center gap-3 w-full justify-between">
          <div className="flex rounded-xl border border-[var(--border)] bg-[var(--background)] p-1">
            <button
              type="button"
              onClick={() => setTab("manual")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === "manual"
                  ? "bg-[var(--card)] shadow-sm text-[var(--foreground)]"
                  : "text-[var(--muted)]"
              }`}
            >
              Manual Sources
            </button>
            <button
              type="button"
              onClick={() => setTab("utm")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === "utm"
                  ? "bg-[var(--card)] shadow-sm text-[var(--foreground)]"
                  : "text-[var(--muted)]"
              }`}
            >
              UTM Values
            </button>
          </div>
          {tab === "manual" && (
            <YellowButton onClick={openAdd}>
              <Plus className="h-4 w-4" />
              إضافة مصدر
            </YellowButton>
          )}
        </div>
      }
    >
      {tab === "utm" ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-12 text-center text-[var(--muted)]">
          قيم UTM تُستخرج تلقائياً من روابط التتبع في قسم الاستفسارات
        </div>
      ) : (
        <DataTable>
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--background)] text-[var(--muted)]">
                <th className="px-4 py-3 text-right font-medium">اسم المصدر</th>
                <th className="px-4 py-3 text-right font-medium">الوصف</th>
                <th className="px-4 py-3 text-right font-medium">النوع</th>
                <th className="px-4 py-3 text-right font-medium">الحالة</th>
                <th className="px-4 py-3 text-right font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {manualSources.map((s) => (
                <tr key={s.id} className="border-b border-[var(--border)] hover:bg-[var(--background)]/50">
                  <td className="px-4 py-3 font-medium" dir="ltr">{s.name}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{s.description || "—"}</td>
                  <td className="px-4 py-3">
                    <TypeBadge type={s.type} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge active={s.status === "active"} />
                  </td>
                  <td className="px-4 py-3">
                    {s.type === "custom" ? (
                      <div className="flex gap-2">
                        <OutlineIconButton onClick={() => openEdit(s)} title="تعديل">
                          <Pencil className="h-3.5 w-3.5" />
                        </OutlineIconButton>
                        <OutlineIconButton onClick={() => handleDelete(s.id)} title="حذف" danger>
                          <Trash2 className="h-3.5 w-3.5" />
                        </OutlineIconButton>
                      </div>
                    ) : (
                      <span className="text-[var(--muted)]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTable>
      )}

      {modal && (
        <ModalForm
          title={modal === "add" ? "إضافة مصدر" : "تعديل مصدر"}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          submitting={submitting}
        >
          <FieldLabel>اسم المصدر *</FieldLabel>
          <TextInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <FieldLabel>الوصف</FieldLabel>
          <TextInput value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
        </ModalForm>
      )}
    </SectionShell>
  );
}
