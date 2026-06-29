"use client";

import { TranslatedPageHeader } from "@/components/dashboard/TranslatedPageHeader";
import { Bot, FileText, GitBranch, Bell } from "lucide-react";

export default function WhatsAppSettingsPage() {
  return (
    <div>
      <TranslatedPageHeader
        titleKey="pages.whatsappSettings.title"
        descriptionKey="pages.whatsappSettings.desc"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-[var(--primary)]" />
            قوالب الرسائل المعتمدة
          </h2>
          <ul className="space-y-2">
            {["تأكيد الحجز", "تذكير بالموعد", "متابعة ما بعد الزيارة", "عرض ترويجي"].map((t) => (
              <li key={t} className="flex justify-between items-center rounded-xl border border-[var(--border)] px-4 py-3">
                <span>{t}</span>
                <span className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">معتمد</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <GitBranch className="h-5 w-5 text-[var(--primary)]" />
            منشئ تدفقات المحادثة
          </h2>
          <p className="text-sm text-[var(--muted)] mb-4">
            صمم مسارات المحادثة التلقائية للحجز والاستفسارات
          </p>
          <button className="rounded-xl border border-dashed border-[var(--primary)] px-4 py-3 text-sm text-[var(--primary)] w-full hover:bg-[var(--primary-light)]">
            + إنشاء تدفق جديد
          </button>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm lg:col-span-2">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <Bot className="h-5 w-5 text-[var(--primary)]" />
            وكيل الذكاء الاصطناعي
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex items-center justify-between rounded-xl border border-[var(--border)] p-4">
              <span>تفعيل الوكيل الذكي</span>
              <input type="checkbox" defaultChecked className="h-5 w-5 accent-[var(--primary)]" />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-[var(--border)] p-4">
              <span>حجز المواعيد تلقائياً</span>
              <input type="checkbox" defaultChecked className="h-5 w-5 accent-[var(--primary)]" />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-[var(--border)] p-4">
              <span>دعم لغات متعددة</span>
              <input type="checkbox" defaultChecked className="h-5 w-5 accent-[var(--primary)]" />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-[var(--border)] p-4">
              <Bell className="h-4 w-4 text-[var(--muted)]" />
              <span>إشعارات الأداء</span>
              <input type="checkbox" className="h-5 w-5 accent-[var(--primary)]" />
            </label>
          </div>
          <p className="mt-4 text-sm text-[var(--muted)]">
            الوكيل يتعلم تلقائياً خدمات العيادة وأطباءها ويجيب على استفسارات المرضى ٢٤/٧
          </p>
        </section>
      </div>
    </div>
  );
}
