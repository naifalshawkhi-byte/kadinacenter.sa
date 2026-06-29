"use client";

import { TranslatedPageHeader } from "@/components/dashboard/TranslatedPageHeader";

const chartBars = [65, 80, 45, 90, 70, 85, 60, 95, 75, 88, 55, 92];

export default function AnalyticsPage() {
  return (
    <div>
      <TranslatedPageHeader
        titleKey="pages.analytics.title"
        descriptionKey="pages.analytics.desc"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {[
          { label: "إجمالي الحجوزات", value: "٩٠٠+", change: "+12%" },
          { label: "إجمالي العملاء", value: "٣١,٦٠٠", change: "+8%" },
          { label: "الإيرادات (ريال)", value: "٢٤٥,٠٠٠", change: "+15%" },
          { label: "معدل التحويل", value: "٣٤%", change: "+3%" },
        ].map((m) => (
          <div key={m.label} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
            <p className="text-sm text-[var(--muted)]">{m.label}</p>
            <p className="mt-1 text-2xl font-bold">{m.value}</p>
            <p className="text-xs text-emerald-600 mt-1">{m.change} عن الشهر السابق</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h3 className="font-semibold mb-4">الحجوزات الشهرية</h3>
          <div className="flex items-end gap-2 h-48">
            {chartBars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-lg bg-[var(--primary)] opacity-80 hover:opacity-100 transition-opacity"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-[var(--muted)]">
            {["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"].map((m) => (
              <span key={m} className="hidden sm:inline">{m.slice(0, 3)}</span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h3 className="font-semibold mb-4">مصادر العملاء</h3>
          <div className="space-y-4">
            {[
              { source: "واتساب", pct: 45, color: "bg-emerald-500" },
              { source: "الموقع", pct: 28, color: "bg-blue-500" },
              { source: "إعلانات", pct: 18, color: "bg-amber-500" },
              { source: "إحالة", pct: 9, color: "bg-purple-500" },
            ].map((s) => (
              <div key={s.source}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{s.source}</span>
                  <span className="text-[var(--muted)]">{s.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--background)] overflow-hidden">
                  <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm lg:col-span-2">
          <h3 className="font-semibold mb-4">أداء الخدمات</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[var(--muted)] border-b border-[var(--border)]">
                <th className="text-right py-2">الخدمة</th>
                <th className="text-right py-2">الحجوزات</th>
                <th className="text-right py-2">الإيرادات</th>
                <th className="text-right py-2">النمو</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "جلسة هيدرافيشل", bookings: 156, revenue: "٧٠,٢٠٠", growth: "+18%" },
                { name: "حقن بوتوكس", bookings: 89, revenue: "١٠٦,٨٠٠", growth: "+22%" },
                { name: "ابتسامة هوليوود", bookings: 34, revenue: "٢٧٢,٠٠٠", growth: "+8%" },
                { name: "استشارة جلدية", bookings: 210, revenue: "٤٢,٠٠٠", growth: "+5%" },
              ].map((r) => (
                <tr key={r.name} className="border-b border-[var(--border)]">
                  <td className="py-3 font-medium">{r.name}</td>
                  <td className="py-3">{r.bookings}</td>
                  <td className="py-3">{r.revenue} ر.س</td>
                  <td className="py-3 text-emerald-600">{r.growth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
