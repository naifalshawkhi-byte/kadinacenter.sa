"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Copy,
  Check,
  Link2,
  Eye,
  Users,
  CalendarCheck,
  TrendingUp,
  Ban,
  Loader2,
  Trash2,
} from "lucide-react";
import { TranslatedPageHeader } from "./TranslatedPageHeader";
import { getAppUrl } from "@/lib/site-url";
import {
  CAMPAIGN_PLATFORM_LABELS,
  CAMPAIGN_PLATFORMS,
  type CampaignPlatform,
  type DbCampaign,
} from "@/lib/campaign-types";
import {
  DataTable,
  FieldLabel,
  ModalForm,
  OutlineIconButton,
  StatusBadge,
  TextInput,
  YellowButton,
} from "@/components/clinic/clinic-ui";

interface DoctorOption {
  id: string;
  name: string;
}

interface CampaignRow extends DbCampaign {
  totalVisits: number;
  totalLeads: number;
  totalBookings: number;
  conversionRate: number;
  doctorName: string;
  url: string;
}

interface Stats {
  totalVisits: number;
  totalLeads: number;
  totalBookings: number;
  conversionRate: number;
}

interface Filters {
  doctorId: string;
  platform: string;
  campaignId: string;
  dateFrom: string;
  dateTo: string;
}

const emptyFilters = (): Filters => ({
  doctorId: "",
  platform: "",
  campaignId: "",
  dateFrom: "",
  dateTo: "",
});

const emptyForm = () => ({
  doctorId: "",
  platform: "instagram" as CampaignPlatform,
  campaignName: "",
  campaignCode: "",
});

function buildQuery(filters: Filters): string {
  const p = new URLSearchParams();
  if (filters.doctorId) p.set("doctorId", filters.doctorId);
  if (filters.platform) p.set("platform", filters.platform);
  if (filters.campaignId) p.set("campaignId", filters.campaignId);
  if (filters.dateFrom) p.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) p.set("dateTo", filters.dateTo);
  const q = p.toString();
  return q ? `?${q}` : "";
}

function StatCard({
  label,
  value,
  suffix,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | string;
  suffix?: string;
  icon: typeof Eye;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {value}
            {suffix && <span className="text-base font-medium text-[var(--muted)]">{suffix}</span>}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">{label}</p>
        </div>
        <div className={`rounded-xl p-2.5 ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function CampaignTrackingView() {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [allCampaigns, setAllCampaigns] = useState<CampaignRow[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalVisits: 0,
    totalLeads: 0,
    totalBookings: 0,
    conversionRate: 0,
  });
  const [filters, setFilters] = useState<Filters>(emptyFilters());
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showDisabled, setShowDisabled] = useState(false);

  const baseUrl = useMemo(() => {
    if (typeof window !== "undefined") return window.location.origin;
    return getAppUrl();
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const q = buildQuery(filters);
    const disabledQ = showDisabled ? `${q ? `${q}&` : "?"}includeDisabled=1` : q;
    const [listRes, statsRes] = await Promise.all([
      fetch(`/api/campaigns${disabledQ}`),
      fetch(`/api/campaigns/stats${q}`),
    ]);
    if (listRes.ok) {
      const data = await listRes.json();
      setCampaigns(data.campaigns || []);
      setAllCampaigns(data.allCampaigns || data.campaigns || []);
      setDoctors(data.doctors || []);
    }
    if (statsRes.ok) {
      const data = await statsRes.json();
      setStats(data.stats || { totalVisits: 0, totalLeads: 0, totalBookings: 0, conversionRate: 0 });
    }
    setLoading(false);
  }, [filters, showDisabled]);

  useEffect(() => {
    load();
  }, [load]);

  function openAdd() {
    setForm(emptyForm());
    setEditId(null);
    setModal("add");
  }

  function openEdit(c: CampaignRow) {
    setForm({
      doctorId: c.doctorId,
      platform: c.platform,
      campaignName: c.campaignName,
      campaignCode: c.campaignCode,
    });
    setEditId(c.id);
    setModal("edit");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const url = modal === "edit" && editId ? `/api/campaigns/${editId}` : "/api/campaigns";
    const method = modal === "edit" ? "PATCH" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSubmitting(false);
    setModal(null);
    load();
  }

  async function toggleStatus(c: CampaignRow) {
    await fetch(`/api/campaigns/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: c.status === "active" ? "disabled" : "active" }),
    });
    load();
  }

  async function handleDelete(c: CampaignRow) {
    if (!confirm(`حذف حملة «${c.campaignName}»؟ لا يمكن التراجع.`)) return;
    await fetch(`/api/campaigns/${c.id}`, { method: "DELETE" });
    load();
  }

  async function copyUrl(c: CampaignRow) {
    const full = `${baseUrl}/c/${c.id}`;
    await navigator.clipboard.writeText(full);
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const filteredCampaignOptions = allCampaigns;

  return (
    <div className="space-y-6">
      <TranslatedPageHeader
        titleKey="pages.campaignTracking.title"
        descriptionKey="pages.campaignTracking.desc"
      >
        <YellowButton onClick={openAdd}>
          <Plus className="h-4 w-4" />
          حملة جديدة
        </YellowButton>
      </TranslatedPageHeader>

      <label className="flex items-center gap-2 text-sm text-[var(--muted)] mb-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showDisabled}
          onChange={(e) => setShowDisabled(e.target.checked)}
          className="rounded"
        />
        عرض الحملات المعطّلة
      </label>

      {/* Filters */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1">الطبيب</label>
            <select
              value={filters.doctorId}
              onChange={(e) => setFilters((f) => ({ ...f, doctorId: e.target.value }))}
              className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm bg-[var(--card)]"
            >
              <option value="">الكل</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1">المنصة</label>
            <select
              value={filters.platform}
              onChange={(e) => setFilters((f) => ({ ...f, platform: e.target.value }))}
              className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm bg-[var(--card)]"
            >
              <option value="">الكل</option>
              {CAMPAIGN_PLATFORMS.map((p) => (
                <option key={p} value={p}>{CAMPAIGN_PLATFORM_LABELS[p]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1">الحملة</label>
            <select
              value={filters.campaignId}
              onChange={(e) => setFilters((f) => ({ ...f, campaignId: e.target.value }))}
              className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm bg-[var(--card)]"
            >
              <option value="">الكل</option>
              {filteredCampaignOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.campaignName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1">من تاريخ</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
              className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm bg-[var(--card)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1">إلى تاريخ</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
              className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm bg-[var(--card)]"
            />
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="إجمالي الزيارات" value={stats.totalVisits} icon={Eye} accent="bg-sky-50 text-sky-600" />
        <StatCard label="إجمالي العملاء المحتملين" value={stats.totalLeads} icon={Users} accent="bg-amber-50 text-amber-600" />
        <StatCard label="إجمالي الحجوزات" value={stats.totalBookings} icon={CalendarCheck} accent="bg-emerald-50 text-emerald-600" />
        <StatCard
          label="معدل التحويل"
          value={stats.conversionRate}
          suffix="%"
          icon={TrendingUp}
          accent="bg-violet-50 text-violet-600"
        />
      </div>

      {/* Campaign table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      ) : (
        <DataTable>
          <table className="w-full min-w-[1000px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--background)] text-[var(--muted)]">
                <th className="px-4 py-3 text-right font-medium">#</th>
                <th className="px-4 py-3 text-right font-medium">الحملة</th>
                <th className="px-4 py-3 text-right font-medium">الطبيب</th>
                <th className="px-4 py-3 text-right font-medium">المنصة</th>
                <th className="px-4 py-3 text-right font-medium">زيارات</th>
                <th className="px-4 py-3 text-right font-medium">عملاء</th>
                <th className="px-4 py-3 text-right font-medium">حجوزات</th>
                <th className="px-4 py-3 text-right font-medium">تحويل</th>
                <th className="px-4 py-3 text-right font-medium">الحالة</th>
                <th className="px-4 py-3 text-right font-medium">الرابط</th>
                <th className="px-4 py-3 text-right font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-[var(--muted)]">
                    لا توجد حملات — أنشئ حملة جديدة للبدء
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c.id} className="border-b border-[var(--border)] hover:bg-[var(--background)]/50">
                    <td className="px-4 py-3 font-mono text-xs">{c.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{c.campaignName}</p>
                      <p className="text-xs text-[var(--muted)]">{c.campaignCode}</p>
                    </td>
                    <td className="px-4 py-3">{c.doctorName}</td>
                    <td className="px-4 py-3">{CAMPAIGN_PLATFORM_LABELS[c.platform]}</td>
                    <td className="px-4 py-3">{c.totalVisits}</td>
                    <td className="px-4 py-3">{c.totalLeads}</td>
                    <td className="px-4 py-3">{c.totalBookings}</td>
                    <td className="px-4 py-3">{c.conversionRate}%</td>
                    <td className="px-4 py-3">
                      <StatusBadge active={c.status === "active"} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link2 className="h-3.5 w-3.5 text-[var(--muted)] shrink-0" />
                        <code className="text-xs text-[var(--primary)]">/c/{c.id}</code>
                        <button
                          type="button"
                          onClick={() => copyUrl(c)}
                          className="p-1 rounded hover:bg-[var(--background)]"
                          title="نسخ الرابط"
                        >
                          {copiedId === c.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-[var(--muted)]" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <OutlineIconButton onClick={() => openEdit(c)} title="تعديل">
                          <Pencil className="h-4 w-4" />
                        </OutlineIconButton>
                        <OutlineIconButton
                          onClick={() => toggleStatus(c)}
                          title={c.status === "active" ? "تعطيل" : "تفعيل"}
                        >
                          <Ban className="h-4 w-4" />
                        </OutlineIconButton>
                        <OutlineIconButton onClick={() => handleDelete(c)} title="حذف">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </OutlineIconButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </DataTable>
      )}

      {modal && (
        <ModalForm
          title={modal === "add" ? "إنشاء حملة" : "تعديل حملة"}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          submitting={submitting}
        >
          <div className="space-y-4">
            <div>
              <FieldLabel>الطبيب *</FieldLabel>
              <select
                value={form.doctorId}
                onChange={(e) => setForm((f) => ({ ...f, doctorId: e.target.value }))}
                required
                className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm bg-[var(--card)]"
              >
                <option value="">— اختر الطبيب —</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>المنصة *</FieldLabel>
              <select
                value={form.platform}
                onChange={(e) =>
                  setForm((f) => ({ ...f, platform: e.target.value as CampaignPlatform }))
                }
                required
                className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm bg-[var(--card)]"
              >
                {CAMPAIGN_PLATFORMS.map((p) => (
                  <option key={p} value={p}>{CAMPAIGN_PLATFORM_LABELS[p]}</option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>اسم الحملة *</FieldLabel>
              <TextInput
                value={form.campaignName}
                onChange={(v) => setForm((f) => ({ ...f, campaignName: v }))}
                placeholder="مثال: Dental Implant June"
                required
              />
            </div>
            <div>
              <FieldLabel>رمز الحملة</FieldLabel>
              <TextInput
                value={form.campaignCode}
                onChange={(v) => setForm((f) => ({ ...f, campaignCode: v }))}
                placeholder="يُولّد تلقائياً إن تُرك فارغاً"
              />
            </div>
            {modal === "add" && (
              <p className="text-xs text-[var(--muted)] rounded-lg bg-[var(--background)] p-3">
                بعد الإنشاء سيتم توليد رابط فريد مثل <strong>/c/101</strong> يمكن نسخه ومشاركته.
              </p>
            )}
          </div>
        </ModalForm>
      )}
    </div>
  );
}
