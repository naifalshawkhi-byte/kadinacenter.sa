"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, Stethoscope } from "lucide-react";
import { parseTrackingFromQuery } from "@/lib/tracking";
import type { TrackingData } from "@/lib/tracking";
import {
  getCampaignFromStorage,
  mergeCampaignIntoTracking,
  saveCampaignToStorage,
} from "@/lib/campaign-tracking";
import type { StoredCampaign } from "@/lib/campaign-types";
import { formatSaudiPhoneLocal, normalizeSaudiPhone } from "@/lib/utils";

interface BookInfo {
  name: string;
  tagline: string;
  logo: string;
  description: string;
  branches: string[];
  services: string[];
  branchCount: number;
}

export function BookForm() {
  const [info, setInfo] = useState<BookInfo | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [service, setService] = useState("");
  const [tracking, setTracking] = useState<TrackingData>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const initDone = useRef(false);

  // Run once — avoids Strict Mode double-run and prevents re-init loops
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    async function init() {
      const params = new URLSearchParams(window.location.search);
      const cid = params.get("cid");
      let stored = getCampaignFromStorage();

      if (cid) {
        try {
          const res = await fetch(`/api/campaigns/${cid}/public`);
          if (res.ok) {
            const data = (await res.json()) as StoredCampaign;
            saveCampaignToStorage(data);
            stored = data;
          }
        } catch {
          // ignore — fall back to localStorage
        }
        // Remove cid from URL without navigation/reload
        window.history.replaceState(null, "", window.location.pathname);
      }

      const t = parseTrackingFromQuery(window.location.search);
      t.landingPath = "/book";
      if (!t.source && !t.medium && !t.campaign && !stored) {
        t.source = "direct";
      }
      setTracking(mergeCampaignIntoTracking(t));
    }

    init();
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/book/info", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setInfo(data);
      })
      .catch(() => {
        if (!cancelled) {
          setInfo({
            name: "",
            tagline: "",
            logo: "",
            description: "",
            branches: [],
            services: [],
            branchCount: 0,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const normalizedPhone = normalizeSaudiPhone(phone);
    if (!normalizedPhone) {
      setError("رقم الهاتف غير صالح — يجب أن يبدأ بـ 5 ويتكون من 9 أرقام");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone: normalizedPhone,
        message,
        service,
        // Re-read localStorage at submit time for latest campaign data
        tracking: mergeCampaignIntoTracking(tracking),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "حدث خطأ");
      return;
    }

    setSuccess(true);
    setName("");
    setPhone("");
    setMessage("");
    setService("");
  }

  const clinicName = info?.name || "العيادة";
  const headline = info?.description?.trim() || `${clinicName} - رعاية متكاملة بأيدٍ خبيرة`;
  const branchSubtitle = "احجز موعدك الآن — الرياض";

  const logoInitial = clinicName.charAt(0) || "ر";

  return (
    <div className="min-h-screen bg-[var(--background)]" dir="rtl">
      <header className="flex items-center justify-end px-6 py-4 max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          {info?.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${info.logo}?v=${encodeURIComponent(clinicName)}`}
              alt={clinicName}
              className="h-10 w-10 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-lg font-bold text-white">
              {logoInitial}
            </div>
          )}
          <span className="text-lg font-bold text-[var(--foreground)]">{clinicName}</span>
        </Link>
      </header>

      <main className="max-w-xl mx-auto px-6 pb-16 pt-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] leading-relaxed">
            {headline}
          </h1>
          {info?.tagline && (
            <p className="mt-2 text-[var(--muted,#6c757d)] text-sm">{info.tagline}</p>
          )}
          <p className="mt-3 text-[var(--muted,#6c757d)] text-sm md:text-base">{branchSubtitle}</p>
        </div>

        <div className="bg-[var(--card)] rounded-2xl shadow-md border border-[var(--border)] p-6 md:p-8">
          <h2 className="text-xl font-bold text-[var(--foreground)] text-center">احجز موعدك الآن</h2>
          <p className="text-center text-[var(--muted)] text-sm mt-1 mb-6">
            وتمتّع بالتجربة العلاجية التي تستحقها.
          </p>

          {success ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[var(--foreground)]">تم إرسال طلبك بنجاح!</h3>
              <p className="text-[var(--muted)] text-sm mt-2">سنتواصل معك قريباً</p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-6 text-[var(--primary)] text-sm font-medium hover:underline"
              >
                إرسال طلب آخر
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground,#374151)] mb-1.5">
                    الاسم <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="اسمك الكامل"
                    required
                    className="w-full rounded-xl border border-[var(--border)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] bg-[var(--card)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground,#374151)] mb-1.5">
                    رقم الهاتف <span className="text-red-500">*</span>
                  </label>
                  <div className="flex rounded-xl border border-[var(--border)] overflow-hidden focus-within:border-[var(--primary)] focus-within:ring-1 focus-within:ring-[var(--primary)]">
                    <span className="flex items-center gap-1 bg-[var(--primary-light)] px-3 border-l border-[var(--border)] text-sm shrink-0 text-[var(--foreground)]">
                      🇸🇦 +966
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => setPhone(formatSaudiPhoneLocal(e.target.value))}
                      placeholder="5XXXXXXXX"
                      required
                      minLength={9}
                      maxLength={9}
                      pattern="5[0-9]{8}"
                      title="رقم سعودي يبدأ بـ 5 (9 أرقام)"
                      dir="ltr"
                      className="flex-1 px-4 py-3 text-sm outline-none bg-[var(--card)]"
                    />
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)]">يجب أن يبدأ رقم الجوال بـ 5 (9 أرقام)</p>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-[var(--foreground,#374151)] mb-1.5">
                  <Stethoscope className="h-3.5 w-3.5 text-[var(--primary)]" />
                  الخدمة
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] bg-[var(--card)]"
                >
                  <option value="">اختر الخدمة (اختياري)</option>
                  {(info?.services || []).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground,#374151)] mb-1.5">الرسالة</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="أخبرنا عن مخاوفك أو أسئلتك"
                  rows={4}
                  className="w-full rounded-xl border border-[var(--border)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] resize-none bg-[var(--card)]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[var(--primary)] py-3.5 text-white font-semibold hover:bg-[var(--primary-dark)] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                احجز الآن
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
