"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  X,
  User,
  Phone,
  Search,
  Calendar,
  Clock,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { getInitials, toLocalISOString } from "@/lib/utils";
import { branchesList as fallbackBranches, servicesList as fallbackServices } from "@/lib/data";

interface ClientOption {
  id: string;
  name: string;
  phone: string;
}

interface DoctorOption {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

function formatPhoneDisplay(phone: string): string {
  const p = phone.trim();
  if (!p) return "";
  if (p.startsWith("+")) return p;
  if (p.startsWith("966")) return `+${p}`;
  if (p.startsWith("0")) return `+966${p.slice(1)}`;
  return `+966${p}`;
}

function formatDateAr(d: Date): string {
  const day = d.getDate();
  const month = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", { month: "long" }).format(d);
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export function CreateAppointmentModal({ open, onClose, onCreated }: Props) {
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [showClientList, setShowClientList] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null);
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [branch, setBranch] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [service, setService] = useState("");
  const [note, setNote] = useState("");
  const [branches, setBranches] = useState<string[]>(fallbackBranches);
  const [services, setServices] = useState<string[]>(fallbackServices);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [inqRes, docRes, metaRes] = await Promise.all([
      fetch("/api/inquiries"),
      fetch("/api/doctors"),
      fetch("/api/clinic/meta"),
    ]);
    if (inqRes.ok) {
      const data = await inqRes.json();
      setClients(
        (data.inquiries || []).map((i: { id: string; name: string; phone: string }) => ({
          id: i.id,
          name: i.name,
          phone: i.phone,
        }))
      );
    }
    if (docRes.ok) {
      const d = await docRes.json();
      setDoctors((d.doctors || []).map((doc: DoctorOption) => ({ id: doc.id, name: doc.name })));
    }
    if (metaRes.ok) {
      const meta = await metaRes.json();
      if (meta.branches?.length) setBranches(meta.branches);
      if (meta.services?.length) setServices(meta.services);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) {
      loadData();
      setSelectedClient(null);
      setClientSearch("");
      setBranch("");
      setDoctorId("");
      setService("");
      setNote("");
      setAppointmentDate(new Date());
    }
  }, [open, loadData]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const filteredClients = useMemo(() => {
    const q = clientSearch.trim().toLowerCase();
    if (!q) return clients.slice(0, 12);
    return clients
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          formatPhoneDisplay(c.phone).includes(q)
      )
      .slice(0, 12);
  }, [clients, clientSearch]);

  const selectedDoctor = doctors.find((d) => d.id === doctorId);

  async function handleCreate() {
    if (!selectedClient) return;
    setSaving(true);
    const res = await fetch("/api/appointments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inquiryId: selectedClient.id,
        nextFollowUp: toLocalISOString(appointmentDate),
        branch,
        service,
        note,
        assignedTo: doctorId,
        doctorName: selectedDoctor?.name || "",
      }),
    });
    setSaving(false);
    if (res.ok) {
      onCreated?.();
      onClose();
    }
  }

  const dateStr = `${appointmentDate.getFullYear()}-${String(appointmentDate.getMonth() + 1).padStart(2, "0")}-${String(appointmentDate.getDate()).padStart(2, "0")}`;
  const timeStr = `${String(appointmentDate.getHours()).padStart(2, "0")}:${String(appointmentDate.getMinutes()).padStart(2, "0")}`;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div
        className="relative w-full max-w-[520px] max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 pt-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">إنشاء موعد</h2>
            </div>
            <p className="text-xs text-slate-500 text-left max-w-[180px] leading-relaxed">
              أدخل التفاصيل لحجز موعد جديد
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="space-y-5">
              {/* العميل */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
                  <User className="h-4 w-4 text-violet-500" />
                  العميل
                </label>

                {selectedClient ? (
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClient(null);
                        setClientSearch("");
                      }}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-semibold text-slate-900 text-right">{selectedClient.name}</p>
                        <p className="text-sm text-slate-500 flex items-center gap-1 justify-end" dir="ltr">
                          <Phone className="h-3.5 w-3.5" />
                          {formatPhoneDisplay(selectedClient.phone)}
                        </p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                        {getInitials(selectedClient.name)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      value={clientSearch}
                      onChange={(e) => {
                        setClientSearch(e.target.value);
                        setShowClientList(true);
                      }}
                      onFocus={() => setShowClientList(true)}
                      placeholder="Search by name or phone"
                      dir="ltr"
                      className="w-full rounded-xl border border-slate-200 py-3 pr-10 pl-4 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 text-left"
                    />
                    {showClientList && filteredClients.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                        {filteredClients.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setSelectedClient(c);
                              setShowClientList(false);
                              setClientSearch("");
                            }}
                            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-right hover:bg-slate-50 border-b border-slate-50 last:border-0"
                          >
                            <span className="text-sm text-slate-500" dir="ltr">
                              {formatPhoneDisplay(c.phone)}
                            </span>
                            <span className="flex items-center gap-2 font-medium text-slate-800">
                              <User className="h-4 w-4 text-violet-400" />
                              {c.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {selectedClient && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">
                        اختر التاريخ
                      </label>
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 bg-white">
                        <Calendar className="h-4 w-4 text-amber-500 shrink-0" />
                        <input
                          type="date"
                          value={dateStr}
                          onChange={(e) => {
                            const d = new Date(appointmentDate);
                            const [y, m, day] = e.target.value.split("-").map(Number);
                            d.setFullYear(y, m - 1, day);
                            setAppointmentDate(d);
                          }}
                          className="flex-1 text-sm border-0 outline-none bg-transparent"
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{formatDateAr(appointmentDate)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">
                        اختر الوقت
                      </label>
                      <div className="relative">
                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 bg-white">
                          <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                          <input
                            type="time"
                            value={timeStr}
                            onChange={(e) => {
                              const d = new Date(appointmentDate);
                              const [h, min] = e.target.value.split(":").map(Number);
                              d.setHours(h, min);
                              setAppointmentDate(d);
                            }}
                            className="flex-1 text-sm border-0 outline-none bg-transparent"
                          />
                        </div>
                        <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">
                        اختر الفرع
                      </label>
                      <div className="relative">
                        <select
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white outline-none focus:border-amber-400"
                        >
                          <option value="">— اختر —</option>
                          {branches.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">
                        اختر الطبيب
                      </label>
                      <div className="relative">
                        <select
                          value={doctorId}
                          onChange={(e) => setDoctorId(e.target.value)}
                          className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white outline-none focus:border-amber-400"
                        >
                          <option value="">— اختر —</option>
                          {doctors.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      </div>
                      {selectedDoctor && (
                        <div className="mt-2 flex items-center gap-2 rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-sm text-violet-800">
                          <User className="h-4 w-4 shrink-0" />
                          <span>الطبيب المخصص: <strong>{selectedDoctor.name}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      اختر الخدمة
                    </label>
                    <div className="relative">
                      <select
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white outline-none focus:border-amber-400"
                      >
                        <option value="">— اختر —</option>
                        {services.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      ملاحظات
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="أضف ملاحظات..."
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm resize-none outline-none focus:border-amber-400"
                    />
                  </div>
                </>
              )}

              {!selectedClient && (
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    ملاحظات
                  </label>
                  <textarea
                    disabled
                    placeholder="أضف ملاحظات..."
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm resize-none bg-slate-50 text-slate-400"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={!selectedClient || saving}
                  className="rounded-xl bg-amber-400 px-6 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-500 disabled:opacity-50 shadow-sm"
                >
                  {saving ? "جاري الإنشاء..." : "إنشاء موعد"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
