"use client";

import { TranslatedPageHeader } from "@/components/dashboard/TranslatedPageHeader";
import { MessageCircle, Send, CheckCheck, Bot } from "lucide-react";
import Link from "next/link";
import { usePreferences } from "@/components/providers/PreferencesProvider";

export default function WhatsAppPanelPage() {
  const { t } = usePreferences();

  return (
    <div>
      <TranslatedPageHeader
        titleKey="pages.whatsapp.title"
        descriptionKey="pages.whatsapp.desc"
      />

      <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900 p-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-emerald-800 dark:text-emerald-300">متصل — WhatsApp Business API</p>
          <p className="text-sm text-emerald-700 dark:text-emerald-400">رقم العيادة: +966 53 464 2062</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {[
          { label: "المحادثات النشطة", value: 12, icon: MessageCircle },
          { label: "رسائل اليوم", value: 48, icon: Send },
          { label: "معدل القراءة", value: "٨٧%", icon: CheckCheck },
          { label: "ردود AI", value: 156, icon: Bot },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <s.icon className="h-5 w-5 text-emerald-600 mb-2" />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-[var(--muted)]">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/dashboard/conversations" className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 hover:shadow-md transition-shadow">
          <MessageCircle className="h-8 w-8 text-emerald-600 mb-3" />
          <h3 className="font-semibold">{t("nav.conversations")}</h3>
          <p className="text-sm text-[var(--muted)] mt-1">واجهة محادثات موحدة لجميع الأرقام</p>
        </Link>
        <Link href="/dashboard/campaigns" className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 hover:shadow-md transition-shadow">
          <Send className="h-8 w-8 text-emerald-600 mb-3" />
          <h3 className="font-semibold">{t("nav.campaigns")}</h3>
          <p className="text-sm text-[var(--muted)] mt-1">بث جماعي وحملات مستهدفة</p>
        </Link>
        <Link href="/dashboard/whatsapp-settings" className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 hover:shadow-md transition-shadow">
          <Bot className="h-8 w-8 text-emerald-600 mb-3" />
          <h3 className="font-semibold">{t("nav.whatsappSettings")}</h3>
          <p className="text-sm text-[var(--muted)] mt-1">قوالب، تدفقات، ووكيل الذكاء الاصطناعي</p>
        </Link>
      </div>
    </div>
  );
}
